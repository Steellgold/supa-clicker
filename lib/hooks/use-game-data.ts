"use client"

import { GameOptions, GameState, Upgrade } from '@/type/game';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../config/game-config';
import { SPECIAL_ITEM_EFFECTS, SPECIAL_ITEM_IDS } from '../constants/special-items';
import { getPrestigeMultiplier } from '../prestige';
import { getUpgradeClickMultiplier, getUpgradeCost, getUpgradePPSGain } from '../upgrades';
import { SPECIAL_ITEMS, canPurchaseSpecialItem, getSpecialItemCost, getSpecialItemMultiplier } from '../upgrades-specials';
// REMOVED: useCryptoSecurity

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

function initializeNextCosts(gameState: GameState, upgrades: Upgrade[]): GameState {
  const nextUpgradeCosts: Record<number, number> = {};
  const nextSpecialItemCosts: Record<number, number> = {};
  upgrades.forEach(upg => {
    const level = (gameState.upgrades[upg.id] || 0);
    nextUpgradeCosts[upg.id] = getUpgradeCost(upg, level, gameState.prestigeLevel);
  });
  SPECIAL_ITEMS.forEach(item => {
    const level = (gameState.specialItems[item.id] || 0);
    nextSpecialItemCosts[item.id] = getSpecialItemCost(item, level, gameState.prestigeLevel);
  });
  return {
    ...gameState,
    nextUpgradeCosts,
    nextSpecialItemCosts,
  };
}

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
  
  // REMOVED: All client-side calculations and crypto security
  // All game logic will be handled server-side

  // SIMPLIFIED: Only handle UI state, server handles all calculations
  const handleClick = useCallback(async () => {
    if (!userId) return { gained: 0 };

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
        setGameState(prev => ({
          ...prev,
          ...result.gameState
        }));
        return { gained: result.gained };
      }
    } catch (error) {
      console.error('Click failed:', error);
    }
    
    return { gained: 0 };
  }, [userId]);

  // SIMPLIFIED: Delegate to server
  const buyUpgrade = useCallback(async (upgradeId: number, quantity: number = 1) => {
    if (!userId) return false;

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
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
    
    return false;
  }, [userId]);

  // SIMPLIFIED: Delegate to server
  const buySpecialItem = useCallback(async (specialItemId: number) => {
    if (!userId) return false;

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
          return result.purchased;
        }
      }
    } catch (error) {
      console.error('Special item purchase failed:', error);
    }
    
    return false;
  }, [userId]);

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
        
        const validatedData = {
          totalClicks: data.totalClicks || DEFAULT_GAME_STATE.totalClicks,
          totalPower: data.totalPower || DEFAULT_GAME_STATE.totalPower,
          currentPower: data.currentPower || DEFAULT_GAME_STATE.currentPower,
          clickPower: data.clickPower || DEFAULT_GAME_STATE.clickPower,
          pps: data.pps || DEFAULT_GAME_STATE.pps,
          upgrades: data.upgrades || DEFAULT_GAME_STATE.upgrades,
          specialItems: data.specialItems || DEFAULT_GAME_STATE.specialItems,
          unlockedAchievements: data.unlockedAchievements || DEFAULT_GAME_STATE.unlockedAchievements,
          prestigeLevel: (data.prestigeLevel || DEFAULT_GAME_STATE.prestigeLevel) > 50 ? 50 : (data.prestigeLevel || DEFAULT_GAME_STATE.prestigeLevel),
          resourcesPerSecond: data.resourcesPerSecond || DEFAULT_GAME_STATE.resourcesPerSecond,
          currentResources: data.currentResources || DEFAULT_GAME_STATE.currentResources,
          comboCount: data.comboCount || DEFAULT_GAME_STATE.comboCount,
          comboActive: data.comboActive || DEFAULT_GAME_STATE.comboActive,
          lastClickTime: data.lastClickTime || DEFAULT_GAME_STATE.lastClickTime,
          timeBoostActive: data.timeBoostActive || DEFAULT_GAME_STATE.timeBoostActive,
          timeBoostEndTime: data.timeBoostEndTime || DEFAULT_GAME_STATE.timeBoostEndTime,
          timeBoostMultiplier: data.timeBoostMultiplier || DEFAULT_GAME_STATE.timeBoostMultiplier,
          purchasedUpgrades: data.purchasedUpgrades || DEFAULT_GAME_STATE.purchasedUpgrades,
          purchasedSpecialItems: data.purchasedSpecialItems || DEFAULT_GAME_STATE.purchasedSpecialItems
        };
        
        return {
          ...DEFAULT_GAME_STATE,
          ...validatedData,
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
      console.log('🔄 Saving to Supabase via API...', { userId, dataKeys: Object.keys(data) });
      
      // REMOVED: cryptoReady check
      
      const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'save',
          payload: data,
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save game data');
      }

      console.log('✅ Game saved to Supabase successfully');
      
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
        console.log('✅ Loaded existing Supabase save');
        return {
          ...DEFAULT_GAME_STATE,
          ...result.gameData,
          lastSaveTime: Date.now()
        };
      }
    } catch (error) {
      console.error("Error loading from Supabase:", error);
    }

    const localData = loadFromLocal();
    
    if (localData.totalPower > 0 || localData.totalClicks > 0 || Object.keys(localData.upgrades).length > 0) {
      console.log('🔄 Transferring local save to Supabase...');
      try {
        const transferSuccess = await saveToSupabaseDB(localData);
        if (transferSuccess) {
          console.log('✅ Local save transferred to Supabase successfully');
          return localData;
        }
      } catch (transferError) {
        console.error('❌ Failed to transfer local save:', transferError);
      }
    }

    return localData;
  }, [saveToSupabase, userId, loadFromLocal, saveToSupabaseDB]);

  const saveGame = useCallback(async () => {
    const currentGameState = gameState; // gameStateRef.current; // REMOVED: gameStateRef
    const success = saveToSupabase 
      ? await saveToSupabaseDB(currentGameState)
      : saveToLocal(currentGameState);
    
    if (success) {
      setLastSaveTime(Date.now());
    }
    return success;
  }, [saveToSupabase, saveToSupabaseDB, saveToLocal]);

  const resetGame = useCallback(async () => {
    setGameState(DEFAULT_GAME_STATE);
    localStorage.removeItem(storageKey);
    
    if (saveToSupabase && userId) {
      try {
        console.log('🗑️ Resetting Supabase data via API...');
        const response = await fetch(GAME_CONFIG.ENDPOINTS.GAME_RESET, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reset game data');
        }
        
        console.log('✅ Supabase data reset successfully');
      } catch (error) {
        console.error('Error during Supabase reset:', error);
      }
    }
  }, [storageKey, saveToSupabase, userId]);

  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      const loadedState = await loadFromSupabaseDB();
      setGameState(loadedState);
      setIsLoading(false);
    };
    loadGame();
  }, [loadFromSupabaseDB]);

  // REMOVED: PPS update effect

  // Auto-clicker effect
  useEffect(() => {
    const specialItems = gameState.specialItems;
    let autoClicksPerSecond = 0;

    // Calculate total auto-clicks per second
    if (specialItems[SPECIAL_ITEM_IDS.AUTO_CLICKER]) {
      autoClicksPerSecond += specialItems[SPECIAL_ITEM_IDS.AUTO_CLICKER] * GAME_CONFIG.SPECIAL_ABILITIES.AUTO_CLICKER.BASIC;
    }
    if (specialItems[SPECIAL_ITEM_IDS.TURBO_AUTO_CLICKER]) {
      autoClicksPerSecond += specialItems[SPECIAL_ITEM_IDS.TURBO_AUTO_CLICKER] * GAME_CONFIG.SPECIAL_ABILITIES.AUTO_CLICKER.TURBO;
    }
    if (specialItems[SPECIAL_ITEM_IDS.HYPER_AUTO_CLICKER]) {
      autoClicksPerSecond += specialItems[SPECIAL_ITEM_IDS.HYPER_AUTO_CLICKER] * GAME_CONFIG.SPECIAL_ABILITIES.AUTO_CLICKER.HYPER;
    }
    if (specialItems[SPECIAL_ITEM_IDS.QUANTUM_AUTO_CLICKER]) {
      autoClicksPerSecond += specialItems[SPECIAL_ITEM_IDS.QUANTUM_AUTO_CLICKER] * GAME_CONFIG.SPECIAL_ABILITIES.AUTO_CLICKER.QUANTUM;
    }

    if (autoClicksPerSecond > 0) {
      const interval = 1000 / autoClicksPerSecond; // Calculate interval between clicks
      // REMOVED: autoClickerIntervalRef
    } else {
      // REMOVED: autoClickerIntervalRef
    }

    return () => {
      // REMOVED: autoClickerIntervalRef
    };
  }, [gameState.specialItems, gameState.clickPower]);

  // Time Boost expiration effect
  useEffect(() => {
    if (gameState.timeBoostActive && gameState.timeBoostEndTime > 0) {
      const timeLeft = gameState.timeBoostEndTime - Date.now();
      if (timeLeft > 0) {
        // REMOVED: timeBoostIntervalRef
      } else {
        console.log('-----');
        console.log('Time Boost expired, resetting state');
        console.log('Current Game State:', gameState);
        console.log('-----');
        setGameState(prev => ({
          ...prev,
          timeBoostActive: false,
          timeBoostEndTime: 0,
          timeBoostMultiplier: 1,
          lastSaveTime: Date.now()
        }));
      }
    } else {
      // REMOVED: timeBoostIntervalRef
    }

    return () => {
      // REMOVED: timeBoostIntervalRef
    };
  }, [gameState.timeBoostActive, gameState.timeBoostEndTime]);

  useEffect(() => {
    if (autoSaveInterval > 0 && !isLoading) {
      // REMOVED: autoSaveIntervalRef
    }

    return () => {
      // REMOVED: autoSaveIntervalRef
    };
  }, [autoSaveInterval, isLoading, saveGame]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentGameState = gameState; // gameStateRef.current; // REMOVED: gameStateRef
      if (saveToSupabase && userId) {
        saveToSupabaseDB(currentGameState);
      } else {
        saveToLocal(currentGameState);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToSupabase, userId, saveToSupabaseDB, saveToLocal]);

  const upgradesInfo = upgrades.map(upgrade => {
    const currentLevel = gameState.upgrades[upgrade.id] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel, gameState.prestigeLevel);
    const canAfford = gameState.currentPower >= cost;
    
    return {
      ...upgrade,
      currentLevel,
      cost,
      canAfford,
      totalPps: getUpgradePPSGain(upgrade, gameState.prestigeLevel) * currentLevel,
      totalClickBonus: getUpgradeClickMultiplier(upgrade, gameState.prestigeLevel) * currentLevel
    };
  });

  const updateAchievements = useCallback((achievementIds: number[]) => {
    setGameState(prev => ({
      ...prev,
      unlockedAchievements: achievementIds,
      lastSaveTime: Date.now()
    }));
  }, []);

  const addPower = useCallback((amount: number) => {
    if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
      console.warn('Invalid power amount:', amount);
      return false;
    }

    const maxAllowed = Math.max(gameState.clickPower * GAME_CONFIG.LIMITS.POWER_VALIDATION.MAX_MULTIPLIER, GAME_CONFIG.LIMITS.POWER_VALIDATION.MIN_THRESHOLD);
    const safeAmount = Math.min(amount, maxAllowed);

    if (safeAmount !== amount) {
      console.warn(`Power amount capped from ${amount} to ${safeAmount} for security`);
    }

    setGameState(prev => ({
      ...prev,
      currentPower: prev.currentPower + safeAmount,
      totalPower: prev.totalPower + safeAmount,
      currentResources: prev.currentPower + safeAmount,
      lastSaveTime: Date.now()
    }));

    return true;
  }, [gameState.clickPower]);

  const canPrestige = useCallback(() => {
    return gameState.totalPower >= GAME_CONFIG.PRESTIGE.MINIMUM_POWER;
  }, [gameState.totalPower]);

  const getPrestigeBonus = useCallback(() => {
    const baseBonus = GAME_CONFIG.PRESTIGE.BASE_BONUS;
    const levelBonus = gameState.prestigeLevel * GAME_CONFIG.PRESTIGE.BONUS_PER_LEVEL;
    return baseBonus + levelBonus;
  }, [gameState.prestigeLevel]);

  const performPrestige = useCallback(() => {
    if (!canPrestige()) return false;

    const newPrestigeLevel = gameState.prestigeLevel + 1;
    
    setGameState(() => ({
      ...DEFAULT_GAME_STATE,
      prestigeLevel: newPrestigeLevel,
      lastSaveTime: Date.now()
    }));

    return true;
  }, [gameState.prestigeLevel, canPrestige]);

  return {
    gameState,
    setGameState: (state: GameState) => {
      setGameState(state);
      saveGame();
    },
    isLoading,
    lastSaveTime,
    
    handleClick,
    buyUpgrade,
    buySpecialItem,
    saveGame,
    resetGame,
    updateAchievements,
    addPower,
    canPrestige,
    getPrestigeBonus,
    performPrestige,
    
    upgradesInfo,
    specialItemsState: gameState.specialItems,
    
    getUpgradeCost: (upgrade: Upgrade, currentLevel: number = 0) => getUpgradeCost(upgrade, currentLevel, gameState.prestigeLevel),
    getUpgradePPSGain: (upgrade: Upgrade) => getUpgradePPSGain(upgrade, gameState.prestigeLevel),
    getUpgradeClickMultiplier: (upgrade: Upgrade) => getUpgradeClickMultiplier(upgrade, gameState.prestigeLevel),
    
    comboActive: gameState.comboActive,
    comboCount: gameState.comboCount,
    timeBoostActive: gameState.timeBoostActive,
    timeBoostTimeLeft: gameState.timeBoostActive ? Math.max(0, gameState.timeBoostEndTime - Date.now()) : 0,
    timeBoostMultiplier: gameState.timeBoostMultiplier
  };
};