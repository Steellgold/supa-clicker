"use client";

import React, { createContext, useContext, PropsWithChildren, useEffect } from 'react';
import { useClickerGame } from '@/lib/hooks/use-game-data';
import { useAchievements } from '@/lib/hooks/use-achievements';
import { getAllUpgrades } from '@/lib/upgrades';
import { useAuth } from '@/lib/auth/auth-context';
import { Component } from '@/type/component';
import { GameStats, UserUpgrade } from '@/type/game';

type GameContextType = ReturnType<typeof useClickerGame> & ReturnType<typeof useAchievements>;

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: Component<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  
  const gameData = useClickerGame({
    upgrades: getAllUpgrades(),
    saveToSupabase: !!user,
    userId: user?.id || null,
    autoSaveInterval: 5000,
    storageKey: 'clicker_game_save'
  });

  const achievementData = useAchievements(gameData.gameState.unlockedAchievements);

  useEffect(() => {
    const unlockedIds = achievementData.unlockedAchievements.map(a => a.id);
    if (unlockedIds.length !== gameData.gameState.unlockedAchievements.length || 
        !unlockedIds.every(id => gameData.gameState.unlockedAchievements.includes(id))) {
      gameData.updateAchievements(unlockedIds);
    }
  }, [achievementData.unlockedAchievements, gameData]);

  useEffect(() => {
    if (!gameData.isLoading) {
      const stats: GameStats = {
        totalClicks: gameData.gameState.totalClicks,
        currentResources: gameData.gameState.currentPower,
        resourcesPerSecond: gameData.gameState.rps,
        lastSaveTime: gameData.gameState.lastSaveTime,
        prestigeLevel: gameData.gameState.prestigeLevel,
      };

      const upgrades: UserUpgrade[] = Object.entries(gameData.gameState.upgrades).map(([id, quantity]) => ({
        upgradeId: parseInt(id),
        quantity,
      }));

      achievementData.checkForNewAchievements(stats, upgrades);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameData.gameState.totalClicks,
    gameData.gameState.currentPower,
    gameData.gameState.rps,
    gameData.gameState.upgrades,
    gameData.gameState.lastSaveTime,
    gameData.gameState.prestigeLevel,
    gameData.isLoading,
  ]);

  const combinedContext = {
    ...gameData,
    ...achievementData,
    resetGame: async () => {
      await gameData.resetGame();
      achievementData.resetAchievements();
    },
  };

  return (
    <GameContext.Provider value={combinedContext}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};
