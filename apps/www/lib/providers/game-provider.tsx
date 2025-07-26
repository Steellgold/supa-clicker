"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useGame } from "@/lib/hooks/use-game";
import type { Achievement, GameState } from "@clicker/game/types";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
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
  const { user } = useAuth();
  const gameHook = useGame(user?.id);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);

  // Handle achievement events
  useEffect(() => {
    const socket = gameHook.socketRef.current;
    if (!socket) {
      console.log("🔌 [GAME_PROVIDER] No socket available for achievements");
      return;
    }

    console.log("🔌 [GAME_PROVIDER] Setting up achievement listeners on socket:", socket.connected ? "connected" : "disconnected");

    const handleAchievementsList = (achievementsList: Achievement[], unlockedIdsList: number[]) => {
      console.log("📋 [GAME_PROVIDER] Received achievements list:", achievementsList.length, "achievements");
      console.log("🔓 [GAME_PROVIDER] Unlocked achievements:", unlockedIdsList);
      setAchievements(achievementsList);
      setUnlockedIds(unlockedIdsList);
      setIsLoadingAchievements(false);
    };

    const handleAchievementUnlocked = (achievement: Achievement) => {
      console.log("🏆 [GAME_PROVIDER] Achievement unlocked:", achievement.name);
      
      // Update unlocked IDs
      setUnlockedIds(prev => {
        if (prev.includes(achievement.id)) {
          return prev;
        }
        return [...prev, achievement.id];
      });

      // Add to notifications
      setAchievementNotifications(prev => {
        const exists = prev.some(n => n.id === achievement.id);
        if (exists) {
          return prev;
        }
        
        const newNotifications = [...prev, achievement];
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          setAchievementNotifications(current => 
            current.filter(n => n.id !== achievement.id)
          );
        }, 5000);
        
        return newNotifications;
      });
    };

    // Set up event listeners
    console.log("🔌 [GAME_PROVIDER] Adding event listeners...");
    socket.on("achievementsList", handleAchievementsList);
    socket.on("achievementUnlocked", handleAchievementUnlocked);

    // Request achievements on mount
    console.log("🔄 [GAME_PROVIDER] Requesting achievements from server...");
    setIsLoadingAchievements(true);
    socket.emit("getAchievements");

    return () => {
      console.log("Cleaning up game provider achievement listeners");
      socket.off("achievementsList", handleAchievementsList);
      socket.off("achievementUnlocked", handleAchievementUnlocked);
    };
  }, [gameHook.isConnected]); // Changed dependency to isConnected instead of socketRef

  const refreshAchievements = useCallback(() => {
    const socket = gameHook.socketRef.current;
    if (socket && gameHook.isConnected) {
      setIsLoadingAchievements(true);
      socket.emit("getAchievements");
    }
  }, [gameHook.isConnected]);

  const unlockedAchievements = achievements.filter(a => unlockedIds.includes(a.id));
  const lockedAchievements = achievements.filter(a => !unlockedIds.includes(a.id));

  const value: GameContextType = {
    ...gameHook,
    achievements,
    unlockedAchievements,
    lockedAchievements,
    unlockedIds,
    isLoadingAchievements,
    refreshAchievements,
    achievementNotifications,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
