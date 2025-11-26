import type { GameState } from "@clicker/game/types";
import { getNextPrestigeInfo, getPrestigeMultiplier } from "@clicker/game/utils";
export { canPrestige, formatNumber as formatPrestigeNumber } from "@clicker/game/utils";

export const getPrestigeRequirement = (gameState: GameState): number => {
  const nextInfo = getNextPrestigeInfo(gameState);
  return nextInfo?.requiredPower || 0;
}

export const getPrestigeEstimates = (gameState: GameState): {
  currentMultiplier: number;
  newMultiplier: number;
  newLevel: number;
  canPrestige: boolean;
} => {
  const currentMultiplier = getPrestigeMultiplier(gameState.prestige_level);
  const nextInfo = getNextPrestigeInfo(gameState);
  
  return {
    currentMultiplier,
    newMultiplier: nextInfo?.newMultiplier || currentMultiplier,
    newLevel: nextInfo?.nextLevel || gameState.prestige_level,
    canPrestige: nextInfo?.canPrestige || false,
  };
}

export const getPrestigeProgress = (gameState: GameState): number => {
  const nextInfo = getNextPrestigeInfo(gameState);
  if (!nextInfo) return 1;
  
  return Math.min(100, (gameState.power / nextInfo.requiredPower) * 100);
}