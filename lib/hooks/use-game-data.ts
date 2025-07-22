import { GameOptions, GameState, Upgrade } from '@/type/game';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../config/game-config';
import { SPECIAL_ITEM_EFFECTS, SPECIAL_ITEM_IDS } from '../constants/special-items';
import { getPrestigeMultiplier } from '../prestige';
import { getUpgradeClickMultiplier, getUpgradeCost, getUpgradePPSGain } from '../upgrades';
import { SPECIAL_ITEMS, canPurchaseSpecialItem, getSpecialItemCost, getSpecialItemMultiplier } from '../upgrades-specials';
import { useCryptoSecurity } from './use-crypto-security';

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
  // Combo System
  comboCount: 0,
  comboActive: false,
  lastClickTime: 0,
  // Time Boost System
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
    nextSpecialItemCosts[item.id] = getSpecialItemCost(item, level, gameState.prestigeLevel, gameState.totalPower);
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
  
  const { makeSignedRequest, isReady: cryptoReady } = useCryptoSecurity();
  const ppsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoClickerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeBoostIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    setGameState(prev => initializeNextCosts(prev, upgrades));
  }, [upgrades, gameState.prestigeLevel]);

  const calculateTotalStats = useCallback((upgradesState: Record<number, number>, specialItemsState: Record<number, number> = {}) => {
    if (gameState.purchasedUpgrades && gameState.purchasedUpgrades.length > 0) {
      let totalPps = 0;
      let totalClickMultiplier = 1;
      let globalMultiplier = 1;

      for (const pu of gameState.purchasedUpgrades) {
        totalPps += pu.ppsGain * pu.quantity;
        totalClickMultiplier += pu.clickMultiplier * pu.quantity;
      }

      if (gameState.purchasedSpecialItems && gameState.purchasedSpecialItems.length > 0) {
        for (const psi of gameState.purchasedSpecialItems) {
          const specialItem = SPECIAL_ITEMS.find(item => item.id === psi.specialItemId);
          if (specialItem && [
            "x1.5 Global",
            "x2 Global",
            "x3 Global",
            "x5 Global",
            "x10 Global",
            "Caffeine Boost"
          ].includes(specialItem.effect)) {
            globalMultiplier *= Math.pow(psi.effectMultiplier, psi.quantity);
          }
        }
      }

      // Prestige
      const prestigeMultiplier = getPrestigeMultiplier(gameStateRef.current.prestigeLevel);
      return {
        totalPps: totalPps * globalMultiplier * prestigeMultiplier,
        totalClickMultiplier: totalClickMultiplier * globalMultiplier * prestigeMultiplier
      };
    }

    let totalPps = 0;
    let totalClickMultiplier = 1;
    let globalMultiplier = 1;
    const fixedPrestigeLevel = gameState.prestigeLevel;
    const fixedTotalPower = gameState.prestigeLevel > 0 ? gameState.totalPower : gameState.totalPower;
    upgrades.forEach(upgrade => {
      const level = upgradesState[upgrade.id] || 0;
      if (level > 0) {
        let upgradePps = getUpgradePPSGain(upgrade, fixedPrestigeLevel) * level;
        let upgradeClick = getUpgradeClickMultiplier(upgrade, fixedPrestigeLevel) * level;
        SPECIAL_ITEMS.forEach(specialItem => {
          const specialLevel = specialItemsState[specialItem.id] || 0;
          if (specialLevel > 0) {
            switch (specialItem.effect) {
              case SPECIAL_ITEM_EFFECTS.AI_INTERN_BOOST:
                if (upgrade.name.toLowerCase().includes('ai intern')) {
                  const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
                  upgradePps *= Math.pow(itemMultiplier, specialLevel);
                  upgradeClick *= Math.pow(itemMultiplier, specialLevel);
                }
                break;
              case SPECIAL_ITEM_EFFECTS.JUNIOR_DEV_BOOST:
                if (upgrade.name.toLowerCase().includes('junior dev')) {
                  const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
                  upgradePps *= Math.pow(itemMultiplier, specialLevel);
                  upgradeClick *= Math.pow(itemMultiplier, specialLevel);
                }
                break;
              case SPECIAL_ITEM_EFFECTS.DEVOPS_BOOST:
                if (upgrade.name.toLowerCase().includes('devops')) {
                  const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
                  upgradePps *= Math.pow(itemMultiplier, specialLevel);
                  upgradeClick *= Math.pow(itemMultiplier, specialLevel);
                }
                break;
              case SPECIAL_ITEM_EFFECTS.CLOUD_BOOST:
                if (upgrade.name.toLowerCase().includes('cloud')) {
                  const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
                  upgradePps *= Math.pow(itemMultiplier, specialLevel);
                  upgradeClick *= Math.pow(itemMultiplier, specialLevel);
                }
                break;
              case SPECIAL_ITEM_EFFECTS.AI_ML_BOOST:
                if (upgrade.name.toLowerCase().includes('ai') || upgrade.name.toLowerCase().includes('ml')) {
                  const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
                  upgradePps *= Math.pow(itemMultiplier, specialLevel);
                  upgradeClick *= Math.pow(itemMultiplier, specialLevel);
                }
                break;
            }
          }
        });
        totalPps += upgradePps;
        totalClickMultiplier += upgradeClick;
      }
    });
    SPECIAL_ITEMS.forEach(specialItem => {
      const specialLevel = specialItemsState[specialItem.id] || 0;
      if (specialLevel > 0) {
        switch (specialItem.effect) {
          case SPECIAL_ITEM_EFFECTS.GLOBAL_1_5X:
          case SPECIAL_ITEM_EFFECTS.GLOBAL_2X:
          case SPECIAL_ITEM_EFFECTS.GLOBAL_3X:
          case SPECIAL_ITEM_EFFECTS.GLOBAL_5X:
          case SPECIAL_ITEM_EFFECTS.GLOBAL_10X:
          case SPECIAL_ITEM_EFFECTS.CAFFEINE_BOOST:
            const itemMultiplier = getSpecialItemMultiplier(specialItem, fixedPrestigeLevel, fixedTotalPower);
            globalMultiplier *= Math.pow(itemMultiplier, specialLevel);
            break;
        }
      }
    });
    const prestigeMultiplier = getPrestigeMultiplier(gameStateRef.current.prestigeLevel);
    return { 
      totalPps: totalPps * globalMultiplier * prestigeMultiplier, 
      totalClickMultiplier: totalClickMultiplier * globalMultiplier * prestigeMultiplier 
    };
  }, [upgrades]);

  useEffect(() => {
    const { totalPps, totalClickMultiplier } = calculateTotalStats(gameState.upgrades, gameState.specialItems);
    setGameState(prev => {
      if (prev.pps === totalPps && prev.clickPower === totalClickMultiplier) return prev;

      return {
        ...prev,
        pps: totalPps,
        clickPower: totalClickMultiplier,
        resourcesPerSecond: totalPps,
        lastSaveTime: Date.now()
      };
    });
  }, [gameState.upgrades, gameState.specialItems, gameState.prestigeLevel, calculateTotalStats]);

  const handleClick = useCallback(() => {
    const currentState = gameStateRef.current;
    const currentTime = Date.now();
    const baseGain = currentState.clickPower;
    let gainedPower = baseGain;

    const goldenClickLevel = currentState.specialItems[SPECIAL_ITEM_IDS.GOLDEN_CLICK] || 0;
    const luckyStreakLevel = currentState.specialItems[SPECIAL_ITEM_IDS.LUCKY_STREAK] || 0;
    const hasGoldenClick = goldenClickLevel > 0;
    const hasLuckyStreak = luckyStreakLevel > 0;
    const hasComboSystem = (currentState.specialItems[SPECIAL_ITEM_IDS.COMBO_MASTER] || 0) > 0;
    const hasTimeBoost = (currentState.specialItems[SPECIAL_ITEM_IDS.TIME_WARP] || 0) > 0;
    const timeBoostLevel = currentState.specialItems[SPECIAL_ITEM_IDS.TIME_WARP] || 0;
    
    let isSpecialClick = false;
    let specialMultiplier = 1;
    let comboMultiplier = 1;
    let shouldActivateTimeBoost = false;

    if (hasGoldenClick) {
      const goldenClickChance = GAME_CONFIG.SPECIAL_ABILITIES.GOLDEN_CLICK_CHANCE * goldenClickLevel;
      if (Math.random() < goldenClickChance) {
        isSpecialClick = true;
        specialMultiplier = GAME_CONFIG.SPECIAL_ABILITIES.GOLDEN_CLICK_MULTIPLIER;
      }
    }
    if (!isSpecialClick && hasLuckyStreak) {
      const luckyStreakChance = GAME_CONFIG.SPECIAL_ABILITIES.LUCKY_STREAK_CHANCE * luckyStreakLevel;
      if (Math.random() < luckyStreakChance) {
        isSpecialClick = true;
        specialMultiplier = GAME_CONFIG.SPECIAL_ABILITIES.LUCKY_STREAK_MULTIPLIER;
      }
    }

    // Combo System logic
    let newComboCount = 0;
    let comboActive = false;
    if (hasComboSystem) {
      const timeSinceLastClick = currentTime - currentState.lastClickTime;
      if (timeSinceLastClick < GAME_CONFIG.INTERVALS.COMBO_TIMEOUT) {
        newComboCount = currentState.comboCount + 1;
      } else {
        newComboCount = 1; // Reset
      }
      // Combo is active if count > 1
      comboActive = newComboCount > 1;
      // Apply combo multiplier (1.1x per combo level, capped at 10x total)
      if (newComboCount > 1) {
        comboMultiplier = Math.min(1 + (newComboCount - 1) * GAME_CONFIG.SPECIAL_ABILITIES.COMBO.MULTIPLIER_INCREMENT, GAME_CONFIG.SPECIAL_ABILITIES.COMBO.MAX_MULTIPLIER);
      }
    }

    // Time Boost activation logic
    if (hasTimeBoost && !currentState.timeBoostActive) {
      // Base chance + chance per level
      const timeBoostChance = GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.BASE_CHANCE + (timeBoostLevel - 1) * GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.CHANCE_PER_LEVEL;
      if (Math.random() < timeBoostChance) {
        shouldActivateTimeBoost = true;
      }
    }

    // Apply multipliers
    if (isSpecialClick) {
      gainedPower *= specialMultiplier;
    }
    gainedPower *= comboMultiplier;

    // Apply time boost if active
    if (currentState.timeBoostActive && currentTime < currentState.timeBoostEndTime) {
      gainedPower *= currentState.timeBoostMultiplier;
    }

    setGameState(prev => {
      const updates: Partial<GameState> = {
        totalClicks: prev.totalClicks + 1,
        currentPower: prev.currentPower + gainedPower,
        totalPower: prev.totalPower + gainedPower,
        currentResources: prev.currentPower + gainedPower,
        lastSaveTime: currentTime,
        lastClickTime: currentTime
      };

      // Update combo count
      if (hasComboSystem) {
        updates.comboCount = newComboCount;
        updates.comboActive = comboActive;
      }

      // Activate time boost if triggered
      if (shouldActivateTimeBoost) {
        const boostDuration = GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.BASE_DURATION + (timeBoostLevel - 1) * GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.DURATION_PER_LEVEL;
        const boostMultiplier = GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.BASE_MULTIPLIER + (timeBoostLevel - 1) * GAME_CONFIG.SPECIAL_ABILITIES.TIME_BOOST.MULTIPLIER_PER_LEVEL;
        updates.timeBoostActive = true;
        updates.timeBoostEndTime = currentTime + boostDuration;
        updates.timeBoostMultiplier = boostMultiplier;
      }

      // Check if time boost should end
      if (prev.timeBoostActive && currentTime >= prev.timeBoostEndTime) {
        updates.timeBoostActive = false;
        updates.timeBoostEndTime = 0;
        updates.timeBoostMultiplier = 1;
      }

      return { ...prev, ...updates };
    });

    return { 
      gained: gainedPower, 
      isSpecialClick, 
      specialMultiplier: isSpecialClick ? specialMultiplier : 1,
      comboMultiplier,
      comboCount: newComboCount,
      timeBoostActivated: shouldActivateTimeBoost
    };
  }, []);

  const buyUpgrade = useCallback((upgradeId: number, quantity: number = 1) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = gameState.upgrades[upgradeId] || 0;
    let totalCost = 0;
    let actualQuantity = 0;
    const purchasedUpgrades = gameState.purchasedUpgrades ? [...gameState.purchasedUpgrades] : [];

    // QUANTITY COST
    for (let i = 0; i < quantity; i++) {
      const cost = getUpgradeCost(upgrade, currentLevel + i, gameState.prestigeLevel);
      if (gameState.currentPower >= totalCost + cost) {
        totalCost += cost;
        actualQuantity++;
      } else {
        break;
      }
    }

    if (actualQuantity > 0 && gameState.currentPower >= totalCost) {
      for (let i = 0; i < actualQuantity; i++) {
        const ppsGain = getUpgradePPSGain(upgrade, gameState.prestigeLevel);
        const clickMultiplier = getUpgradeClickMultiplier(upgrade, gameState.prestigeLevel);
        purchasedUpgrades.push({
          upgradeId,
          quantity: 1,
          ppsGain,
          clickMultiplier
        });
      }

      const newNextUpgradeCosts = { ...(gameState.nextUpgradeCosts || {}) };
      newNextUpgradeCosts[upgradeId] = getUpgradeCost(upgrade, currentLevel + actualQuantity, gameState.prestigeLevel);
      setGameState(prev => ({
        ...prev,
        currentPower: prev.currentPower - totalCost,
        currentResources: prev.currentPower - totalCost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: currentLevel + actualQuantity
        },
        purchasedUpgrades,
        nextUpgradeCosts: newNextUpgradeCosts,
        lastSaveTime: Date.now()
      }));
      return actualQuantity;
    }

    return 0;
  }, [gameState.currentPower, gameState.upgrades, upgrades, gameState.prestigeLevel, gameState.totalPower, gameState.purchasedUpgrades]);

  const buySpecialItem = useCallback((specialItemId: number) => {
    const specialItem = SPECIAL_ITEMS.find(item => item.id === specialItemId);
    if (!specialItem) return false;

    const currentLevel = gameState.specialItems[specialItemId] || 0;
    const cost = getSpecialItemCost(specialItem, currentLevel, gameState.prestigeLevel, gameState.totalPower);
    const purchasedSpecialItems = gameState.purchasedSpecialItems ? [...gameState.purchasedSpecialItems] : [];

    // Fix: Ensure we have enough power AND all other requirements are met
    if (gameState.currentPower >= cost && canPurchaseSpecialItem(specialItem, currentLevel, gameState.currentPower, gameState.totalPower, gameState.prestigeLevel, gameState.upgrades)) {
      const effectMultiplier = getSpecialItemMultiplier(specialItem, gameState.prestigeLevel, gameState.totalPower);
      purchasedSpecialItems.push({
        specialItemId,
        quantity: 1,
        effectMultiplier
      });
      const newSpecialItems = {
        ...gameState.specialItems,
        [specialItemId]: currentLevel + 1
      };
      const newNextSpecialItemCosts = { ...(gameState.nextSpecialItemCosts || {}) };
      newNextSpecialItemCosts[specialItemId] = getSpecialItemCost(specialItem, currentLevel + 1, gameState.prestigeLevel, gameState.totalPower);
      const { totalPps, totalClickMultiplier } = calculateTotalStats(gameState.upgrades, newSpecialItems);
      setGameState(prev => ({
        ...prev,
        currentPower: prev.currentPower - cost,
        currentResources: prev.currentPower - cost,
        specialItems: newSpecialItems,
        purchasedSpecialItems,
        nextSpecialItemCosts: newNextSpecialItemCosts,
        pps: totalPps,
        clickPower: totalClickMultiplier,
        resourcesPerSecond: totalPps,
        lastSaveTime: Date.now()
      }));
      return true;
    }

    return false;
  }, [gameState.currentPower, gameState.specialItems, gameState.totalPower, gameState.upgrades, gameState.prestigeLevel, calculateTotalStats, gameState.purchasedSpecialItems]);

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
          prestigeLevel: data.prestigeLevel || DEFAULT_GAME_STATE.prestigeLevel,
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
      
      if (!cryptoReady) {
        throw new Error('Crypto security not ready');
      }
      
      const response = await makeSignedRequest(
        GAME_CONFIG.ENDPOINTS.GAME_SAVE,
        {
          type: 'save',
          payload: data
        }
      );

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
  }, [saveToSupabase, userId, cryptoReady, makeSignedRequest]);

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
    const currentGameState = gameStateRef.current;
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

  useEffect(() => {
    if (gameState.pps > 0) {
      ppsIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          const newCurrentPower = prev.currentPower + prev.pps;
          return {
            ...prev,
            currentPower: newCurrentPower,
            totalPower: prev.totalPower + prev.pps,
            currentResources: newCurrentPower,
            lastSaveTime: Date.now()
          };
        });
      }, GAME_CONFIG.INTERVALS.PPS_UPDATE);
    } else {
      if (ppsIntervalRef.current) {
        clearInterval(ppsIntervalRef.current);
        ppsIntervalRef.current = null;
      }
    }

    return () => {
      if (ppsIntervalRef.current) {
        clearInterval(ppsIntervalRef.current);
      }
    };
  }, [gameState.pps]);

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
      autoClickerIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          const clickPower = prev.clickPower;
          return {
            ...prev,
            // Auto-clickers don't count towards totalClicks (only manual user clicks)
            currentPower: prev.currentPower + clickPower,
            totalPower: prev.totalPower + clickPower,
            currentResources: prev.currentPower + clickPower,
            lastSaveTime: Date.now()
          };
        });
      }, interval);
    } else {
      if (autoClickerIntervalRef.current) {
        clearInterval(autoClickerIntervalRef.current);
        autoClickerIntervalRef.current = null;
      }
    }

    return () => {
      if (autoClickerIntervalRef.current) {
        clearInterval(autoClickerIntervalRef.current);
      }
    };
  }, [gameState.specialItems, gameState.clickPower]);

  // Time Boost expiration effect
  useEffect(() => {
    if (gameState.timeBoostActive && gameState.timeBoostEndTime > 0) {
      const timeLeft = gameState.timeBoostEndTime - Date.now();
      if (timeLeft > 0) {
        timeBoostIntervalRef.current = setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            timeBoostActive: false,
            timeBoostEndTime: 0,
            timeBoostMultiplier: 1,
            lastSaveTime: Date.now()
          }));
        }, timeLeft);
      } else {
        console.log('-----');
        console.log('Time Boost expired, resetting state');
        console.log('Current Game State:', gameStateRef.current);
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
      if (timeBoostIntervalRef.current) {
        clearTimeout(timeBoostIntervalRef.current);
        timeBoostIntervalRef.current = null;
      }
    }

    return () => {
      if (timeBoostIntervalRef.current) {
        clearTimeout(timeBoostIntervalRef.current);
      }
    };
  }, [gameState.timeBoostActive, gameState.timeBoostEndTime]);

  useEffect(() => {
    if (autoSaveInterval > 0 && !isLoading) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveGame();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveInterval, isLoading, saveGame]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentGameState = gameStateRef.current;
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