"use client";

import { useGame } from "@/lib/hooks/use-game";
import { Component } from "@/type/component";
import type { GameState } from "@clicker/game/types";
import { createContext, PropsWithChildren, useContext } from "react";

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  handleClick: () => void;
  buyUpgrade: (upgradeId: number, quantity?: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: Component<PropsWithChildren> = ({ children }) => {
  const { gameState, isLoading, error, handleClick, buyUpgrade, resetGame } = useGame();

  const contextValue: GameContextType = {
    gameState,
    isLoading,
    error,
    handleClick,
    buyUpgrade,
    resetGame,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within a GameProvider");
  return context;
};
