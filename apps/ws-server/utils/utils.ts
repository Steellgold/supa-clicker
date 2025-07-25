import type { GameState } from "@clicker/game/types";
import { UPGRADES } from "@clicker/game/utils";
import { getPrestigeMultiplier } from "@clicker/game/utils";

export const getUpgradeById = (id: number) => {
  return UPGRADES.find(u => u.id === id);
}

export function calculateUpgradeCost(upgrade: { baseCost: number; costGrowth: number }, level: number) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
}

export function calculateBulkUpgradeCost(upgrade: { baseCost: number; costGrowth: number; max?: number }, currentLevel: number, quantity: number, maxPower: number) {
  let totalCost = 0;
  let actualQuantity = 0;
  const maxAffordable = Math.min(quantity, upgrade.max ? upgrade.max - currentLevel : quantity);
  
  for (let i = 0; i < maxAffordable; i++) {
    const cost = calculateUpgradeCost(upgrade, currentLevel + i);
    
    if (cost < 0 || !Number.isFinite(cost)) break;

    if (maxPower >= totalCost + cost) {
      totalCost += cost;
      actualQuantity++;
    } else {
      break;
    }
  }
  
  return { totalCost, actualQuantity };
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
  
  const prestigeMultiplier = getPrestigeMultiplier(gameState.prestige_level);
  gameState.pps = Math.floor(totalPps * prestigeMultiplier);
  gameState.ppc = Math.floor(totalPpc * prestigeMultiplier);
}