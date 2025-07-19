"use client";

import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useClickerGame } from '@/lib/hooks/use-game-data';
import { getAllUpgrades } from '@/lib/upgrades';
import { useAuth } from '@/lib/auth/auth-context';
import { Component } from '@/type/component';

type GameContextType = ReturnType<typeof useClickerGame>;

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

  return (
    <GameContext.Provider value={gameData}>
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
