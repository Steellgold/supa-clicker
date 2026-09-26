import type { GameState } from "@clicker/game/types";
import { getPrestigeMultiplier, UPGRADES } from "@clicker/game/utils";

export const getUpgradeById = (id: number) => {
  return UPGRADES.find(u => u.id === id);
}

export const calculateUpgradeCost = (upgrade: { baseCost: number; costGrowth: number }, level: number) => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
}

export const calculateBulkUpgradeCost = (upgrade: { baseCost: number; costGrowth: number; max?: number }, currentLevel: number, quantity: number, maxPower: number) => {
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

export const recalculateStats = (gameState: GameState) => {
  let totalPps = 0;
  let totalPpc = 1;

  for (const up of gameState.upgrades) {
    const upgrade = getUpgradeById(up.id);
    if (upgrade) {
      totalPps += (upgrade.pps || 0) * up.level;
      totalPpc += (upgrade.ppc || 0) * up.level;
    }
  }

  const prestigeMultiplier = getPrestigeMultiplier(gameState.prestige_level);
  gameState.pps = totalPps * prestigeMultiplier;
  gameState.ppc = totalPpc * prestigeMultiplier;
}

export const createInitialGameState = (): GameState => {
  const now = Date.now();
  return {
    ppc: 1,
    pps: 0,
    power: 0,
    total_power: 0,
    upgrades: [],
    prestige_level: 0,
    lifetime_power: 0,
    lifetime_clicks: 0,
    unlocked_achievements: [],
    prestige_stats: [{
      prestige_level: 0,
      start_time: now,
      end_time: 0,
      duration_seconds: 0,
      total_power_earned: 0,
      total_clicks: 0,
      upgrades_purchased: 0,
      power_spent_on_upgrades: 0,
      max_pps_reached: 0,
      max_ppc_reached: 1,
      final_upgrades: [],
      achievements_unlocked: []
    }],
    current_prestige_start_time: now,
    current_prestige_clicks: 0,
    current_prestige_upgrades_purchased: 0,
    current_prestige_power_spent: 0,
    current_prestige_power_earned: 0,
  };
}
