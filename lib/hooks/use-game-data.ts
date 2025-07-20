import { GameState, GameOptions } from '@/type/game';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUpgradeCost } from '../upgrades';

const DEFAULT_GAME_STATE: GameState = {
  totalClicks: 0,
  totalPower: 0,
  currentPower: 0,
  clickPower: 1,
  rps: 0,
  upgrades: {},
  unlockedAchievements: [],
  lastSaveTime: Date.now(),
  prestigeLevel: 0,
  resourcesPerSecond: 0,
  currentResources: 0
};

export const useClickerGame = (options: GameOptions = {}) => {
  const {
    saveToSupabase = false,
    userId = null,
    autoSaveInterval = 5000,
    upgrades = [],
    storageKey = 'clicker_game_save'
  } = options;

  const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  
  const rpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const calculateTotalStats = useCallback((upgradesState: Record<number, number>) => {
    let totalRps = 0;
    let totalClickMultiplier = 1;

    upgrades.forEach(upgrade => {
      const level = upgradesState[upgrade.id] || 0;
      if (level > 0) {
        totalRps += upgrade.rpsGain * level;
        totalClickMultiplier += upgrade.clickMultiplier * level;
      }
    });

    return { totalRps, totalClickMultiplier };
  }, [upgrades]);

  useEffect(() => {
    const { totalRps, totalClickMultiplier } = calculateTotalStats(gameState.upgrades);
    setGameState(prev => {
      if (prev.rps === totalRps && prev.clickPower === totalClickMultiplier) return prev;

      return {
        ...prev,
        rps: totalRps,
        clickPower: totalClickMultiplier,
        resourcesPerSecond: totalRps,
        lastSaveTime: Date.now()
      };
    });
  }, [gameState.upgrades, calculateTotalStats]);

  const handleClick = useCallback(() => {
    const rand = Math.random();
    const isPlatinum = rand < 0.05;
    const isGolden = !isPlatinum && rand < 0.15;

    const goldenBonus = 49;
    const platinumBonus = 499;

    const baseGain = gameStateRef.current.clickPower;

    let gainedPower = baseGain;
    if (isPlatinum) {
      gainedPower += platinumBonus;
    } else if (isGolden) {
      gainedPower += goldenBonus;
    }

    setGameState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      currentPower: prev.currentPower + gainedPower,
      totalPower: prev.totalPower + gainedPower,
      currentResources: prev.currentPower + gainedPower,
      lastSaveTime: Date.now()
    }));

    return { gained: gainedPower, isGolden, isPlatinum };
  }, []);

  const buyUpgrade = useCallback((upgradeId: number) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = gameState.upgrades[upgradeId] || 0;
    const cost = getUpgradeCost(upgrade, currentLevel);

    if (gameState.currentPower >= cost) {
      setGameState(prev => ({
        ...prev,
        currentPower: prev.currentPower - cost,
        currentResources: prev.currentPower - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: currentLevel + 1
        },
        lastSaveTime: Date.now()
      }));
      return true;
    }

    return false;
  }, [gameState.currentPower, gameState.upgrades, upgrades]);

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
      console.log('🔄 Saving to Supabase via API...', { userId, dataKeys: Object.keys(data) });
      
      const response = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameData: data }),
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
      const response = await fetch('/api/game/load');
      
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

    return loadFromLocal();
  }, [saveToSupabase, userId, loadFromLocal]);

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
        const response = await fetch('/api/game/reset', {
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
    if (gameState.rps > 0) {
      rpsIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          const newCurrentPower = prev.currentPower + prev.rps;
          return {
            ...prev,
            currentPower: newCurrentPower,
            totalPower: prev.totalPower + prev.rps,
            currentResources: newCurrentPower,
            lastSaveTime: Date.now()
          };
        });
      }, 1000);
    } else {
      if (rpsIntervalRef.current) {
        clearInterval(rpsIntervalRef.current);
        rpsIntervalRef.current = null;
      }
    }

    return () => {
      if (rpsIntervalRef.current) {
        clearInterval(rpsIntervalRef.current);
      }
    };
  }, [gameState.rps]);

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
    const cost = getUpgradeCost(upgrade, currentLevel);
    const canAfford = gameState.currentPower >= cost;
    
    return {
      ...upgrade,
      currentLevel,
      cost,
      canAfford,
      totalRps: upgrade.rpsGain * currentLevel,
      totalClickBonus: upgrade.clickMultiplier * currentLevel
    };
  });

  const updateAchievements = useCallback((achievementIds: number[]) => {
    setGameState(prev => ({
      ...prev,
      unlockedAchievements: achievementIds,
      lastSaveTime: Date.now()
    }));
  }, []);

  return {
    gameState,
    isLoading,
    lastSaveTime,
    
    handleClick,
    buyUpgrade,
    saveGame,
    resetGame,
    updateAchievements,
    
    upgradesInfo,
    
    getUpgradeCost
  };
};