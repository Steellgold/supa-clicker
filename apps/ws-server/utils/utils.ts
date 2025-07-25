import type { GameState } from "@clicker/game/types";
import { UPGRADES } from "@clicker/game/utils";

export const getUpgradeById = (id: number) => {
  return UPGRADES.find(u => u.id === id);
}

export function calculateUpgradeCost(upgrade: { baseCost: number; costGrowth: number }, level: number) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
}

export function recalculateStats(gameState: GameState) {
  let totalPps = 0;
  let totalPpc = 1; // always at least 1
  
  for (const up of gameState.upgrades) {
    const upgrade = getUpgradeById(up.id);
    if (upgrade) {
      totalPps += (upgrade.pps || 0) * up.level;
      totalPpc += (upgrade.ppc || 0) * up.level;
    }
  }
  
  gameState.pps = totalPps;
  gameState.ppc = totalPpc;
}