"use client";

import { useGameLocal } from "@/lib/hooks/use-game.local";
import type { Achievement, GameState } from "@clicker/game/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  handleClick: () => void;
  buyUpgrade: (upgradeId: number, quantity?: number, isBulk?: boolean) => void;
  resetGame: () => void;
  performPrestige: () => void;
  canPerformAction: () => boolean;
  clearError: () => void;
  // Achievement-related state
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  unlockedIds: number[];
  isLoadingAchievements: boolean;
  refreshAchievements: () => void;
  // Notification state
  achievementNotifications: Achievement[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const game = useGameLocal();
  const { unlocks, consumeUnlocks } = game;
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);

  useEffect(() => {
    if (unlocks.length === 0) return;

    const ids = new Set(unlocks.map(a => a.id));

    setAchievementNotifications(prev => {
      const known = new Set(prev.map(a => a.id));
      const fresh = unlocks.filter(a => !known.has(a.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
    consumeUnlocks();

    const timeout = setTimeout(() => {
      setAchievementNotifications(prev => prev.filter(a => !ids.has(a.id)));
    }, 5000);

    return () => clearTimeout(timeout);
  }, [unlocks, consumeUnlocks]);

  const unlockedIds = game.gameState?.unlocked_achievements ?? [];

  const unlockedAchievements = game.achievements.filter(a => unlockedIds.includes(a.id));
  const lockedAchievements = game.achievements.filter(a => !unlockedIds.includes(a.id));

  const refreshAchievements = useCallback(() => {}, []);

  const value: GameContextType = {
    gameState: game.gameState,
    isLoading: game.isLoading,
    error: game.error,
    handleClick: game.handleClick,
    buyUpgrade: game.buyUpgrade,
    resetGame: game.resetGame,
    performPrestige: game.performPrestige,
    canPerformAction: game.canPerformAction,
    clearError: game.clearError,
    achievements: game.achievements,
    unlockedAchievements,
    lockedAchievements,
    unlockedIds,
    isLoadingAchievements: false,
    refreshAchievements,
    achievementNotifications,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
