"use client"

import { ClientEncryption } from "@/lib/crypto/client-encryption";
import { GameOptions, GameState, Upgrade } from "@/type/game";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/game-config";
import { getPrestigeMultiplier } from "../prestige";
import { getAllUpgrades } from "../upgrades";
import { useEncryptedGameData } from "./use-encrypted-game-data";

const DEFAULT_GAME_STATE: GameState = {
  totalClicks: 0,
  totalPower: 0,
  currentPower: 0,
  clickPower: 1,
  pps: 0,
  upgrades: {},
  specialItems: {},
  unlockedAchievements: [],
  lastSaveTime: Date.now(),
  prestigeLevel: 0,
  resourcesPerSecond: 0,
  currentResources: 0,
  comboCount: 0,
  comboActive: false,
  lastClickTime: 0,
  timeBoostActive: false,
  timeBoostEndTime: 0,
  timeBoostMultiplier: 1,
  purchasedUpgrades: [],
  purchasedSpecialItems: [],
  nextUpgradeCosts: {},
  nextSpecialItemCosts: {},
};

function recalculateStats(state: GameState): { pps: number; clickPower: number; resourcesPerSecond: number } {
  let totalPps = 0;
  let totalClickMultiplier = 1;
  const globalMultiplier = 1;
  const upgrades = getAllUpgrades();
  // Upgrades
  upgrades.forEach(upgrade => {
    const level = state.upgrades[upgrade.id] || 0;
    if (level > 0) {
      const upgradePps = upgrade.ppsGain * level;
      const upgradeClick = upgrade.clickMultiplier * level;
      totalPps += upgradePps;
      totalClickMultiplier += upgradeClick;
    }
  });
  // Apply prestige multiplier (exponential)
  const prestigeMultiplier = getPrestigeMultiplier(state.prestigeLevel);
  return {
    pps: totalPps * globalMultiplier * prestigeMultiplier,
    clickPower: totalClickMultiplier * globalMultiplier * prestigeMultiplier,
    resourcesPerSecond: totalPps * globalMultiplier * prestigeMultiplier,
  };
}

export const useClickerGame = (options: GameOptions = {}) => {
  const {
    saveToSupabase = false,
    userId = null,
    autoSaveInterval = GAME_CONFIG.INTERVALS.AUTO_SAVE,
    storageKey = GAME_CONFIG.STORAGE.GAME_SAVE_KEY
  } = options;

  const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hook for client-side encryption
  const { saveGame: saveGameEncrypted, isSaving } = useEncryptedGameData();

  // Helper for saving with encryption
  const saveGameToServer = useCallback(async (gameDataToSave: GameState) => {
    if (!userId) return;
    
    if (process.env.NODE_ENV === 'development') console.log('🔐 Attempting to save with encryption for user:', userId);
    
    try {
      await saveGameEncrypted(gameDataToSave);
      if (process.env.NODE_ENV === 'development') console.log('✅ Successfully saved with encryption');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('❌ Failed to save game with encryption:', error);
      if (process.env.NODE_ENV === 'development') console.log('🔄 Falling back to unencrypted save');
      // Fallback to unencrypted save in case of error
      await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "save",
          payload: gameDataToSave,
          timestamp: Date.now()
        })
      });
    }
  }, [userId, saveGameEncrypted]);

  const [sessionStats, setSessionStats] = useState({
    clicksSession: 0,
    powerSession: 0,
    upgradesBoughtSession: 0,
  });

  useEffect(() => setSessionStats({ clicksSession: 0, powerSession: 0, upgradesBoughtSession: 0 }), []);

  // ===============================
  // SIMPLE LOCAL CLICK SYSTEM
  // ===============================
  const handleClick = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      currentPower: prev.currentPower + prev.clickPower,
      totalPower: prev.totalPower + prev.clickPower,
      lastClickTime: Date.now(),
      lastSaveTime: Date.now(),
    }));
    setSessionStats(prev => ({ ...prev, clicksSession: prev.clicksSession + 1 }));
    return { gained: gameState.clickPower };
  }, [gameState.clickPower]);

  // Client-side helper functions for display purposes only
  const getUpgradeCost = useCallback((upgrade: Upgrade, currentLevel: number = 0) => {
    const baseCost = upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel);
    const prestigeMultiplier = getPrestigeMultiplier(gameState.prestigeLevel);
    return Math.floor(baseCost * prestigeMultiplier);
  }, [gameState.prestigeLevel]);

  const saveToLocal = useCallback((data: GameState) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Error saving to local storage:", error);
      return false;
    }
  }, [storageKey]);

  // ======================================
  // FONCTION BUYUPGRADE AVEC SAUVEGARDE IMMÉDIATE
  // ======================================
  const buyUpgrade = useCallback(async (upgradeId: number, quantity: number = 1) => {
    if (!userId) {
      // Offline mode - keep old behavior
      const upgrade = getAllUpgrades().find(u => u.id === upgradeId);
      if (!upgrade) return 0;
      
      const currentLevel = gameState.upgrades[upgradeId] || 0;
      const cost = getUpgradeCost(upgrade, currentLevel) * quantity;
      if (gameState.currentPower < cost) return 0;
      
      const nextUpgrades = {
        ...gameState.upgrades,
        [upgradeId]: (gameState.upgrades[upgradeId] || 0) + quantity
      };
      const nextState = {
        ...gameState,
        currentPower: gameState.currentPower - cost,
        upgrades: nextUpgrades,
        lastSaveTime: Date.now(),
        total_spent: (gameState.total_spent || 0) + cost,
      };

      const { pps, clickPower, resourcesPerSecond } = recalculateStats(nextState);
      nextState.pps = pps;
      nextState.clickPower = clickPower;
      nextState.resourcesPerSecond = resourcesPerSecond;
      setGameState(nextState);
      setSessionStats(prev => ({ ...prev, upgradesBoughtSession: prev.upgradesBoughtSession + quantity }));
      saveToLocal(nextState);
      return quantity;
    }

    // Only save before purchase - the API will use the current state
    if (process.env.NODE_ENV === 'development') console.log('🛒 Attempting purchase with current state:', { currentPower: gameState.currentPower, upgradeId, quantity });
    
    try {
      const response = await fetch("/api/game/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          purchaseType: "upgrade",
          upgradeId,
          quantity,
          currentGameState: gameState, // Send current state
          timestamp: Date.now()
        })
      });
      const result = await response.json();
      
      if (result.success && result.newState) {
        if (process.env.NODE_ENV === 'development') console.log('✅ Purchase successful, updating from server');
        setGameState(result.newState);
        setSessionStats(prev => ({ ...prev, upgradesBoughtSession: prev.upgradesBoughtSession + result.purchased }));
        saveToLocal(result.newState);
        return result.purchased;
      } else {
        if (process.env.NODE_ENV === 'development') console.log('❌ Purchase failed:', result.error);
        return 0;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('❌ Error during purchase:', error);
      return 0;
    }
  }, [userId, gameState, saveGameToServer, saveToLocal, getUpgradeCost]);

  // Autres fonctions simplifiées...
  const buySpecialItem = useCallback(async (specialItemId: number) => {
    return false; // Placeholder
  }, []);

  const saveGame = useCallback(async () => {
    if (saveToSupabase && userId) {
      await saveGameToServer(gameState);
    } else {
      saveToLocal(gameState);
    }
    setLastSaveTime(Date.now());
    return true;
  }, [saveToSupabase, userId, saveGameToServer, saveToLocal, gameState]);

  const resetGame = useCallback(async (): Promise<boolean> => {
    setGameState(DEFAULT_GAME_STATE);
    localStorage.removeItem(storageKey);
    return true;
  }, [storageKey]);

  const updateAchievements = useCallback((achievementIds: number[]) => {
    setGameState(prev => ({
      ...prev,
      unlockedAchievements: achievementIds,
      lastSaveTime: Date.now()
    }));
  }, []);

  // Load from local/remote
  const loadFromLocal = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return { ...DEFAULT_GAME_STATE, ...JSON.parse(saved), lastSaveTime: Date.now() };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Error loading local game data:", error);
    }
    return DEFAULT_GAME_STATE;
  }, [storageKey]);

  const loadFromSupabaseDB = useCallback(async () => {
    try {
      if (saveToSupabase && userId) {
        const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_LOAD);
        if (response.ok) {
          const result = await response.json();
          if (result.gameData) {
            return { ...DEFAULT_GAME_STATE, ...result.gameData, lastSaveTime: Date.now() };
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Error loading from Supabase:", error);
    }
    return loadFromLocal();
  }, [saveToSupabase, userId, loadFromLocal]);

  // Helper functions
  const getUpgradePPSGain = useCallback((upgrade: Upgrade) => {
    const prestigeMultiplier = getPrestigeMultiplier(gameState.prestigeLevel);
    return upgrade.ppsGain * prestigeMultiplier;
  }, [gameState.prestigeLevel]);

  const getUpgradeClickMultiplier = useCallback((upgrade: Upgrade) => {
    const prestigeMultiplier = getPrestigeMultiplier(gameState.prestigeLevel);
    return upgrade.clickMultiplier * prestigeMultiplier;
  }, [gameState.prestigeLevel]);

  // --- PURCHASE QUEUE & BATCH LOGIC ---

  // Purchase queue type
  interface QueuedPurchase {
    type: "upgrade" | "specialItem";
    upgradeId?: number;
    specialItemId?: number;
    quantity?: number;
    optimisticState: GameState; // State after optimistic update
  }

  const PURCHASE_BATCH_SIZE = 5;
  const PURCHASE_BATCH_TIMEOUT = 200; // ms

  const [purchaseQueue, setPurchaseQueue] = useState<QueuedPurchase[]>([]);
  const purchaseQueueTimer = useRef<NodeJS.Timeout | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

  // Helper: flush the queue (send to server)
  const flushPurchaseQueue = useCallback(async () => {
    if (!userId || purchaseQueue.length === 0) return;
    const purchases = purchaseQueue.map(p => ({
      type: p.type,
      upgradeId: p.upgradeId,
      specialItemId: p.specialItemId,
      quantity: p.quantity
    }));
    const optimisticState = purchaseQueue[purchaseQueue.length - 1].optimisticState;
    setPurchaseQueue([]); // Clear queue immediately for UI responsiveness
    setQueueError(null);
    try {
      let payload;
      if (userId) {
        // Encrypt the batch payload (always, no legacy mode)
        const encryptedPayload = await ClientEncryption.encryptData(userId, { gameState: optimisticState, purchases });
        payload = {
          type: "batch-purchase",
          encryptedPayload,
          timestamp: Date.now(),
          clientEncryption: true
        };
      }
      const response = await fetch("/api/game/batch-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result?.gameState) {
        setGameState(result.gameState);
        saveToLocal(result.gameState);
        // Optionally: show success feedback
      } else {
        // Rollback: reload from server or local, show error
        setQueueError(result?.error || "Batch purchase failed");
        // Optionally: reload last known good state
        const loaded = await loadFromSupabaseDB();
        setGameState(loaded);
        saveToLocal(loaded);
      }
    } catch (err) {
      setQueueError("Network or server error during batch purchase");
      // Optionally: reload last known good state
      const loaded = await loadFromSupabaseDB();
      setGameState(loaded);
      saveToLocal(loaded);
    }
  }, [userId, purchaseQueue, loadFromSupabaseDB, saveToLocal]);

  // Helper: schedule queue flush (by size or timeout)
  const scheduleQueueFlush = useCallback(() => {
    if (purchaseQueue.length >= PURCHASE_BATCH_SIZE) {
      flushPurchaseQueue();
      return;
    }
    if (purchaseQueueTimer.current) clearTimeout(purchaseQueueTimer.current);
    purchaseQueueTimer.current = setTimeout(() => {
      flushPurchaseQueue();
    }, PURCHASE_BATCH_TIMEOUT);
  }, [purchaseQueue, flushPurchaseQueue]);

  // Optimistic buyUpgrade (queue version)
  const queueBuyUpgrade = useCallback((upgradeId: number, quantity: number = 1) => {
    const upgrade = getAllUpgrades().find(u => u.id === upgradeId);
    if (!upgrade) return;
    const currentLevel = gameState.upgrades[upgradeId] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel) * quantity;
    if (gameState.currentPower < cost) return;
    // Optimistic update
    const nextUpgrades = {
      ...gameState.upgrades,
      [upgradeId]: (gameState.upgrades[upgradeId] || 0) + quantity
    };
    const nextState = {
      ...gameState,
      currentPower: gameState.currentPower - cost,
      upgrades: nextUpgrades,
      lastSaveTime: Date.now(),
      total_spent: (gameState.total_spent || 0) + cost,
    };
    const { pps, clickPower, resourcesPerSecond } = recalculateStats(nextState);
    nextState.pps = pps;
    nextState.clickPower = clickPower;
    nextState.resourcesPerSecond = resourcesPerSecond;
    setGameState(nextState);
    setSessionStats(prev => ({ ...prev, upgradesBoughtSession: prev.upgradesBoughtSession + quantity }));
    setPurchaseQueue(q => [...q, { type: "upgrade", upgradeId, quantity, optimisticState: nextState }]);
    scheduleQueueFlush();
  }, [gameState, getUpgradeCost, setGameState, setSessionStats, scheduleQueueFlush]);

  // Optimistic buySpecialItem (queue version)
  const queueBuySpecialItem = useCallback((specialItemId: number) => {
    // TODO: implement cost/validation logic for special items
    // For now, just queue the purchase and do a naive optimistic update
    const currentLevel = gameState.specialItems[specialItemId] || 0;
    // You may want to calculate cost and check if affordable
    const nextSpecialItems = {
      ...gameState.specialItems,
      [specialItemId]: currentLevel + 1
    };
    const nextState = {
      ...gameState,
      specialItems: nextSpecialItems,
      lastSaveTime: Date.now(),
    };
    setGameState(nextState);
    setPurchaseQueue(q => [...q, { type: "specialItem", specialItemId, optimisticState: nextState }]);
    scheduleQueueFlush();
  }, [gameState, setGameState, scheduleQueueFlush]);

  // Manual flush (for UI button or on unmount)
  const manualFlushQueue = useCallback(() => {
    flushPurchaseQueue();
  }, [flushPurchaseQueue]);

  // On unmount, flush any remaining queue
  useEffect(() => {
    return () => {
      if (purchaseQueue.length > 0) flushPurchaseQueue();
      if (purchaseQueueTimer.current) clearTimeout(purchaseQueueTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effects
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      const loadedState = await loadFromSupabaseDB();
      setGameState(loadedState);
      setIsLoading(false);
    };
    loadGame();
  }, [loadFromSupabaseDB]);

  // Auto-save effect - DISABLED to avoid conflicts
  // Disabled: auto-save interferes with purchases
  // We only save when purchases are successful
  if (process.env.NODE_ENV === 'development') console.log('🚫 Auto-save disabled to avoid conflicts with purchases');
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveInterval, isLoading, saveGame, userId]);

  // PPS effect
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.pps > 0) {
          const gain = prev.pps / 10;
          return {
            ...prev,
            currentPower: prev.currentPower + gain,
            totalPower: prev.totalPower + gain,
          };
        }
        return prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Computed values
  const upgradesInfo = getAllUpgrades().map(upgrade => {
    const currentLevel = gameState.upgrades[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel);
    const canAfford = gameState.currentPower >= cost;
    
    return {
      ...upgrade,
      currentLevel,
      cost,
      canAfford,
      totalPps: getUpgradePPSGain(upgrade) * currentLevel,
      totalClickBonus: getUpgradeClickMultiplier(upgrade) * currentLevel
    };
  });

  const gameStateWithSession = useMemo(() => ({
    ...gameState,
    clicksSession: sessionStats.clicksSession,
    powerSession: sessionStats.powerSession,
    upgradesBoughtSession: sessionStats.upgradesBoughtSession,
  }), [gameState, sessionStats]);

  return {
    gameState: gameStateWithSession,
    setGameState,
    isLoading,
    lastSaveTime,
    
    // Actions
    handleClick,
    buyUpgrade: queueBuyUpgrade,
    buySpecialItem: queueBuySpecialItem,
    saveGame,
    resetGame,
    updateAchievements,
    flushPurchaseQueue: manualFlushQueue,
    
    // Helpers
    getUpgradeCost,
    getUpgradePPSGain,
    getUpgradeClickMultiplier,
    
    // Display
    upgradesInfo,
    specialItemsState: gameState.specialItems,
    
    // Status
    comboActive: gameState.comboActive,
    comboCount: gameState.comboCount,
    timeBoostActive: gameState.timeBoostActive,
    timeBoostTimeLeft: gameState.timeBoostActive ? Math.max(0, gameState.timeBoostEndTime - Date.now()) : 0,
    timeBoostMultiplier: gameState.timeBoostMultiplier,
    
    // Encryption status
    isSaving,
    purchaseQueue,
    queueError
  };
};
