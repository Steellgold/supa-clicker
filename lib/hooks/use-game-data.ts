"use client"

import { GameOptions, GameState, Upgrade } from "@/type/game";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME_CONFIG } from "../config/game-config";
import { getAllUpgrades } from "../upgrades";

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

  // ===============================
  // CLICK BATCHING LOGIC (server + local)
  // ===============================
  const clickBatchRef = useRef({ count: 0, lastSend: Date.now(), timer: null as NodeJS.Timeout | null });
  const [pendingClicks, setPendingClicks] = useState(0);
  const [serverState, setServerState] = useState<GameState | null>(null);

  // Batched and merged
  const handleClick = useCallback(() => {
    setPendingClicks((prev) => prev + 1);
    setGameState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      currentPower: prev.currentPower + prev.clickPower,
      totalPower: prev.totalPower + prev.clickPower,
      lastClickTime: Date.now(),
      lastSaveTime: Date.now(),
    }));
    clickBatchRef.current.count += 1;
    if (clickBatchRef.current.count >= 10) {
      sendClickBatch();
    } else if (!clickBatchRef.current.timer) {
      clickBatchRef.current.timer = setTimeout(() => {
        sendClickBatch();
      }, 2000);
    }
    return { gained: gameState.clickPower };
  }, [gameState.clickPower]);

  // Send the click batch to the server
  const sendClickBatch = useCallback(async () => {
    if (!userId || clickBatchRef.current.count === 0) return;
    const batchCount = clickBatchRef.current.count;
    clickBatchRef.current.count = 0;
    if (clickBatchRef.current.timer) {
      clearTimeout(clickBatchRef.current.timer);
      clickBatchRef.current.timer = null;
    }
    try {
      const response = await fetch("/api/game/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: Date.now(),
          sessionId: Date.now(),
          batch: batchCount
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setServerState(result.gameState);
          setPendingClicks((prev) => Math.max(0, prev - batchCount));
          setGameState(({
            ...result.gameState,
            // Merge the remaining local clicks
            totalClicks: result.gameState.totalClicks + (pendingClicks - batchCount),
            currentPower: result.gameState.currentPower + (pendingClicks - batchCount) * (result.gameState.clickPower || 1),
            totalPower: result.gameState.totalPower + (pendingClicks - batchCount) * (result.gameState.clickPower || 1),
            lastSaveTime: Date.now(),
          }));
        }
      } else {
        console.error("Click batch failed:", await response.text());
        // If the batch fails, keep the pendingClicks
        setPendingClicks((prev) => prev + batchCount);
      }
    } catch (error) {
      console.error("Click batch failed:", error);
      setPendingClicks((prev) => prev + batchCount);
    }
  }, [userId, pendingClicks]);

  // Merge the server state + pendingClicks for display (always up to date)
  const mergedGameState = useMemo(() => (
    serverState
      ? {
          ...serverState,
          totalClicks: serverState.totalClicks + pendingClicks,
          currentPower: serverState.currentPower + pendingClicks * (serverState.clickPower || 1),
          totalPower: serverState.totalPower + pendingClicks * (serverState.clickPower || 1),
          lastSaveTime: Date.now(),
        }
      : gameState
  ), [serverState, pendingClicks, gameState]);

  // Client-side helper functions for display purposes only
  const getUpgradeCost = useCallback((upgrade: Upgrade, currentLevel: number = 0) => {
    // Simple client-side calculation for display
    // Real calculation happens server-side
    const cost = upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel);
    const prestigeReduction = Math.max(0.8, 1 - (gameState.prestigeLevel * 0.02));
    return Math.floor(cost * prestigeReduction);
  }, [gameState.prestigeLevel]);

  const buyUpgrade = useCallback(async (upgradeId: number, quantity: number = 1) => {
    if (!userId) return 0;

    await fetch("/api/game/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "save",
        payload: gameState,
        timestamp: Date.now()
      })
    });

    // Cap the quantity to avoid backend validation errors
    const cappedQuantity = Math.min(quantity, 100); // Cap at 100 upgrades per request

    // Optimistic update: apply upgrade locally
    const upgrade = getAllUpgrades().find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    const currentLevel = mergedGameState.upgrades[upgradeId] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel) * cappedQuantity;
    if (mergedGameState.currentPower < cost) return 0;

    // Save previous state for rollback
    const prevState = { ...gameState };

    setGameState(prev => ({
      ...prev,
      currentPower: prev.currentPower - cost,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: (prev.upgrades[upgradeId] || 0) + cappedQuantity
      },
      lastSaveTime: Date.now(),
    }));

    // Send request in background
    try {
      const response = await fetch("/api/game/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          purchaseType: "upgrade",
          upgradeId,
          quantity: cappedQuantity,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(prev => ({
            ...prev,
            ...result.gameState
          }));
          return result.purchased;
        } else {
          setGameState(prevState);
          return 0;
        }
      } else {
        setGameState(prevState);
        const error = await response.json();
        console.error("Purchase failed:", error.error);
        return 0;
      }
    } catch (error) {
      setGameState(prevState);
      console.error("Purchase failed:", error);
      return 0;
    }
  }, [userId, mergedGameState, gameState, getUpgradeCost]);

  const buySpecialItem = useCallback(async (specialItemId: number) => {
    if (!userId) return false;

    await fetch("/api/game/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "save",
        payload: gameState,
        timestamp: Date.now()
      })
    });

    const prevState = { ...gameState };
    setGameState(prev => ({
      ...prev,
      specialItems: {
        ...prev.specialItems,
        [specialItemId]: (prev.specialItems[specialItemId] || 0) + 1
      },
      lastSaveTime: Date.now(),
    }));

    try {
      const response = await fetch("/api/game/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          purchaseType: "specialItem",
          specialItemId,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(prev => ({
            ...prev,
            ...result.gameState
          }));
          return true;
        } else {
          setGameState(prevState);
          return false;
        }
      } else {
        setGameState(prevState);
        const error = await response.json();
        console.error("Special item purchase failed:", error.error);
        return false;
      }
    } catch (error) {
      setGameState(prevState);
      console.error("Special item purchase failed:", error);
      return false;
    }
  }, [userId, gameState]);

  // ===============================
  // LOCAL STORAGE MANAGEMENT
  // ===============================

  const saveToLocal = useCallback((data: GameState) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving to local storage:", error);
      return false;
    }
  }, [storageKey]);

  const loadFromLocal = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        return {
          ...DEFAULT_GAME_STATE,
          ...data,
          lastSaveTime: Date.now()
        };
      }
    } catch (error) {
      console.error("Error loading local game data:", error);
    }
    return DEFAULT_GAME_STATE;
  }, [storageKey]);

  const saveToSupabaseDB = useCallback(async (data: GameState) => {
    if (!saveToSupabase || !userId) return false;

    try {
      const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_SAVE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "save",
          payload: data,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save game data");
      }

      return true;
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      return false;
    }
  }, [saveToSupabase, userId]);

  const loadFromSupabaseDB = useCallback(async () => {
    if (!saveToSupabase || !userId) {
      return loadFromLocal();
    }

    try {
      // First, ensure user profile exists
      console.log("Initializing user profile...");
      const profileResponse = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!profileResponse.ok) {
        console.error("Failed to initialize profile");
        throw new Error("Failed to initialize user profile");
      }

      const profileResult = await profileResponse.json();
      console.log("Profile initialized:", profileResult.success);

      // Then load game data
      const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_LOAD);
      
      if (!response.ok) {
        throw new Error("Failed to load game data");
      }

      const result = await response.json();
      
      if (result.gameData) {
        console.log("Game data loaded from Supabase");
        return {
          ...DEFAULT_GAME_STATE,
          ...result.gameData,
          lastSaveTime: Date.now()
        };
      }
    } catch (error) {
      console.error("Error loading from Supabase:", error);
    }

    // Fallback to local data
    console.log("Falling back to local data");
    const localData = loadFromLocal();
    
    // Try to transfer local save to Supabase if it has data
    if (localData.totalPower > 0 || localData.totalClicks > 0) {
      try {
        console.log("Transferring local data to Supabase...");
        await saveToSupabaseDB(localData);
      } catch (transferError) {
        console.error("Failed to transfer local save:", transferError);
      }
    }

    return localData;
  }, [saveToSupabase, userId, loadFromLocal, saveToSupabaseDB]);

  const saveGame = useCallback(async () => {
    const success = saveToSupabase 
      ? await saveToSupabaseDB(gameState)
      : saveToLocal(gameState);
    
    if (success) {
      setLastSaveTime(Date.now());
    }
    return success;
  }, [saveToSupabase, saveToSupabaseDB, saveToLocal, gameState]);

  const resetGame = useCallback(async () => {
    setGameState(DEFAULT_GAME_STATE);
    localStorage.removeItem(storageKey);
    
    if (saveToSupabase && userId) {
      try {
        const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_RESET, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to reset game data");
        }
      } catch (error) {
        console.error("Error during Supabase reset:", error);
      }
    }
  }, [storageKey, saveToSupabase, userId]);

  // ===============================
  // PRESTIGE SYSTEM
  // ===============================

  const canPrestige = useCallback(() => {
    return gameState.totalPower >= GAME_CONFIG.PRESTIGE.MINIMUM_POWER;
  }, [gameState.totalPower]);

  const getPrestigeBonus = useCallback(() => {
    const baseBonus = GAME_CONFIG.PRESTIGE.BASE_BONUS;
    const levelBonus = gameState.prestigeLevel * GAME_CONFIG.PRESTIGE.BONUS_PER_LEVEL;
    return baseBonus + levelBonus;
  }, [gameState.prestigeLevel]);

  const performPrestige = useCallback(async () => {
    if (!canPrestige()) return false;

    // For now, handle prestige locally
    // TODO: Move to server-side endpoint
    const newPrestigeLevel = gameState.prestigeLevel + 1;
    
    setGameState(() => ({
      ...DEFAULT_GAME_STATE,
      prestigeLevel: newPrestigeLevel,
      lastSaveTime: Date.now()
    }));

    return true;
  }, [gameState.prestigeLevel, canPrestige]);

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const updateAchievements = useCallback((achievementIds: number[]) => {
    setGameState(prev => ({
      ...prev,
      unlockedAchievements: achievementIds,
      lastSaveTime: Date.now()
    }));
  }, []);

  const getUpgradePPSGain = useCallback((upgrade: Upgrade) => {
    // Simple client-side calculation for display
    const prestigeMultiplier = 1 + (gameState.prestigeLevel * 0.1);
    return upgrade.ppsGain * prestigeMultiplier;
  }, [gameState.prestigeLevel]);

  const getUpgradeClickMultiplier = useCallback((upgrade: Upgrade) => {
    // Simple client-side calculation for display
    const prestigeBonus = 1 + (gameState.prestigeLevel * 0.05);
    return upgrade.clickMultiplier * prestigeBonus;
  }, [gameState.prestigeLevel]);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      const loadedState = await loadFromSupabaseDB();
      setGameState(loadedState);
      setIsLoading(false);
    };
    loadGame();
  }, [loadFromSupabaseDB]);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveInterval > 0 && !isLoading && userId) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveGame();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveInterval, isLoading, saveGame, userId]);

  // Before unload save
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveToSupabase && userId) {
        saveToSupabaseDB(gameState);
      } else {
        saveToLocal(gameState);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveToSupabase, userId, saveToSupabaseDB, saveToLocal, gameState]);

  // Apply PPS (power per second) to currentPower and totalPower every 100ms
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.pps > 0) {
          const gain = prev.pps / 10; // 10 times per second for smoothness
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

  // ===============================
  // COMPUTED VALUES
  // ===============================

  const upgradesInfo = getAllUpgrades().map(upgrade => {
    const currentLevel = gameState.upgrades[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel);
    const canAfford = mergedGameState.currentPower >= cost;
    
    return {
      ...upgrade,
      currentLevel,
      cost,
      canAfford,
      totalPps: getUpgradePPSGain(upgrade) * currentLevel,
      totalClickBonus: getUpgradeClickMultiplier(upgrade) * currentLevel
    };
  });

  return {
    gameState: mergedGameState,
    setGameState: (state: GameState) => {
      setGameState(state);
      saveGame();
    },
    isLoading,
    lastSaveTime,
    
    // Game actions (now async and server-validated)
    handleClick,
    buyUpgrade,
    buySpecialItem,
    saveGame,
    resetGame,
    updateAchievements,
    
    // Prestige system
    canPrestige,
    getPrestigeBonus,
    performPrestige,
    
    // Display helpers (client-side only)
    upgradesInfo,
    specialItemsState: mergedGameState.specialItems,
    getUpgradeCost,
    getUpgradePPSGain,
    getUpgradeClickMultiplier,
    
    // Status info
    comboActive: mergedGameState.comboActive,
    comboCount: mergedGameState.comboCount,
    timeBoostActive: mergedGameState.timeBoostActive,
    timeBoostTimeLeft: mergedGameState.timeBoostActive ? Math.max(0, mergedGameState.timeBoostEndTime - Date.now()) : 0,
    timeBoostMultiplier: mergedGameState.timeBoostMultiplier
  };
};