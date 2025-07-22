"use client"

import { GameOptions, GameState, Upgrade } from '@/type/game';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../config/game-config';
import { getAllUpgrades } from '../upgrades';

// SIMPLIFIED CLIENT STATE - All game logic moved to server
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
    upgrades = [],
    storageKey = GAME_CONFIG.STORAGE.GAME_SAVE_KEY
  } = options;

  const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ===============================
  // SECURE API CALLS
  // ===============================

  const handleClick = useCallback(async () => {
    if (!userId || isProcessing) return { gained: 0 };

    setIsProcessing(true);
    try {
      const response = await fetch('/api/game/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Date.now(),
          sessionId: Date.now() // Basic session tracking
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(prev => ({
            ...prev,
            ...result.gameState
          }));
          return { gained: result.gained };
        }
      } else {
        console.error('Click failed:', await response.text());
      }
    } catch (error) {
      console.error('Click failed:', error);
    } finally {
      setIsProcessing(false);
    }
    
    return { gained: 0 };
  }, [userId, isProcessing]);

  const buyUpgrade = useCallback(async (upgradeId: number, quantity: number = 1) => {
    if (!userId || isProcessing) return 0;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/game/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'upgrade',
          upgradeId,
          quantity,
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
        }
      } else {
        const error = await response.json();
        console.error('Purchase failed:', error.error);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
    
    return 0;
  }, [userId, isProcessing]);

  const buySpecialItem = useCallback(async (specialItemId: number) => {
    if (!userId || isProcessing) return false;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/game/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'specialItem',
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
        }
      } else {
        const error = await response.json();
        console.error('Special item purchase failed:', error.error);
      }
    } catch (error) {
      console.error('Special item purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
    
    return false;
  }, [userId, isProcessing]);

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'save',
          payload: data,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save game data');
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
      const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_LOAD);
      
      if (!response.ok) {
        throw new Error('Failed to load game data');
      }

      const result = await response.json();
      
      if (result.gameData) {
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
    const localData = loadFromLocal();
    
    // Try to transfer local save to Supabase if it has data
    if (localData.totalPower > 0 || localData.totalClicks > 0) {
      try {
        await saveToSupabaseDB(localData);
      } catch (transferError) {
        console.error('Failed to transfer local save:', transferError);
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
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reset game data');
        }
      } catch (error) {
        console.error('Error during Supabase reset:', error);
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

  // Client-side helper functions for display purposes only
  const getUpgradeCost = useCallback((upgrade: Upgrade, currentLevel: number = 0) => {
    // Simple client-side calculation for display
    // Real calculation happens server-side
    const cost = upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel);
    const prestigeReduction = Math.max(0.8, 1 - (gameState.prestigeLevel * 0.02));
    return Math.floor(cost * prestigeReduction);
  }, [gameState.prestigeLevel]);

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

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToSupabase, userId, saveToSupabaseDB, saveToLocal, gameState]);

  // ===============================
  // COMPUTED VALUES
  // ===============================

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

  return {
    gameState,
    setGameState: (state: GameState) => {
      setGameState(state);
      saveGame();
    },
    isLoading,
    isProcessing,
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
    specialItemsState: gameState.specialItems,
    getUpgradeCost,
    getUpgradePPSGain,
    getUpgradeClickMultiplier,
    
    // Status info
    comboActive: gameState.comboActive,
    comboCount: gameState.comboCount,
    timeBoostActive: gameState.timeBoostActive,
    timeBoostTimeLeft: gameState.timeBoostActive ? Math.max(0, gameState.timeBoostEndTime - Date.now()) : 0,
    timeBoostMultiplier: gameState.timeBoostMultiplier
  };
};