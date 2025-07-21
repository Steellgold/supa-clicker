import { GameState } from "@/type/game";
import { GAME_CONFIG } from "./config/game-config";

export const PRESTIGE_CONFIG = {
  MIN_TOTAL_POWER: GAME_CONFIG.PRESTIGE.MINIMUM_POWER,
  BASE_BONUS: GAME_CONFIG.PRESTIGE.BASE_BONUS,
  BONUS_PER_LEVEL: GAME_CONFIG.PRESTIGE.BONUS_PER_LEVEL,
  COST_GROWTH_FACTOR: 10,
} as const;

export const canPrestige = (gameState: GameState): boolean => {
  if (gameState.prestigeLevel >= 50) return false;
  return gameState.currentPower >= getPrestigeRequirement(gameState.prestigeLevel);
};

export const getPrestigeRequirement = (currentPrestigeLevel: number): number => {
  return PRESTIGE_CONFIG.MIN_TOTAL_POWER * Math.pow(PRESTIGE_CONFIG.COST_GROWTH_FACTOR, currentPrestigeLevel);
};

export const calculatePrestigeGain = (gameState: GameState): number => {
  if (!canPrestige(gameState)) return 0;
  return Math.floor(Math.log10(gameState.currentPower / PRESTIGE_CONFIG.MIN_TOTAL_POWER)) + 1;
};

export const getPrestigeMultiplier = (prestigeLevel: number): number => {
  if (prestigeLevel === 0) return 1;
  
  // Rewarding progression system matching requested targets:
  // 1-4: ~100x, 5-10: ~15k, 11-20: ~50k, 21-30: ~150k, 31-40: ~1M, 41-50: ~1Md
  
  if (prestigeLevel <= 4) {
    // Early levels: 25x per level (25x, 50x, 75x, 100x)
    return prestigeLevel * 25;
  } else if (prestigeLevel <= 10) {
    // Levels 5-10: exponential jump to ~15k (100x to 15k)
    return 100 * Math.pow(2.3, prestigeLevel - 4); // 2.3^6 ≈ 150x multiplier
  } else if (prestigeLevel <= 20) {
    // Levels 11-20: moderate growth to ~50k
    const baseAt10 = 100 * Math.pow(2.3, 6); // ~15k
    return baseAt10 * Math.pow(1.12, prestigeLevel - 10); // 1.12^10 ≈ 3.1x multiplier
  } else if (prestigeLevel <= 30) {
    // Levels 21-30: growth to ~150k  
    const baseAt20 = 100 * Math.pow(2.3, 6) * Math.pow(1.12, 10); // ~50k
    return baseAt20 * Math.pow(1.11, prestigeLevel - 20); // 1.11^10 ≈ 2.8x multiplier
  } else if (prestigeLevel <= 40) {
    // Levels 31-40: growth to ~1M
    const baseAt30 = 100 * Math.pow(2.3, 6) * Math.pow(1.12, 10) * Math.pow(1.11, 10); // ~150k
    return baseAt30 * Math.pow(1.2, prestigeLevel - 30); // 1.2^10 ≈ 6.2x multiplier
  } else {
    // Levels 41-50: growth to ~1Md (1 billion)
    const baseAt40 = 100 * Math.pow(2.3, 6) * Math.pow(1.12, 10) * Math.pow(1.11, 10) * Math.pow(1.2, 10); // ~800k
    return baseAt40 * Math.pow(2.15, prestigeLevel - 40); // 2.15^10 ≈ 1238x multiplier → ~1Md
  }
};

// New function to calculate price multiplier based on prestige
export const getPrestigePriceMultiplier = (prestigeLevel: number): number => {
  if (prestigeLevel === 0) return 1;
  
  // Prices increase more gradually than bonuses to maintain balance
  // Each prestige level increases prices by ~20-30%
  return Math.pow(1.25, Math.min(prestigeLevel, 50)) * (prestigeLevel > 50 ? Math.pow(1.1, prestigeLevel - 50) : 1);
};

export const performPrestige = (gameState: GameState): GameState => {
  if (!canPrestige(gameState)) {
    return gameState;
  }

  const newPrestigeLevel = gameState.prestigeLevel + calculatePrestigeGain(gameState);

  return {
    ...gameState,
    currentPower: 0,
    clickPower: 1,
    pps: 0,
    upgrades: {},
    specialItems: {},
    totalClicks: 0,
    // TOTAL POWER | ACHIEVEMENTS
    prestigeLevel: newPrestigeLevel,
    // RESET SPECIALS
    comboCount: 0,
    lastClickTime: 0,
    timeBoostActive: false,
    timeBoostEndTime: 0,
    timeBoostMultiplier: 1,
    //
    lastSaveTime: Date.now(),
    //
    resourcesPerSecond: 0,
    currentResources: 0,
  };
};

export const getPrestigeEstimates = (gameState: GameState) => {
  const currentMultiplier = getPrestigeMultiplier(gameState.prestigeLevel);
  const newPrestigeLevel = gameState.prestigeLevel + calculatePrestigeGain(gameState);
  const newMultiplier = getPrestigeMultiplier(newPrestigeLevel);
  const currentPriceMultiplier = getPrestigePriceMultiplier(gameState.prestigeLevel);
  const newPriceMultiplier = getPrestigePriceMultiplier(newPrestigeLevel);
  
  return {
    currentLevel: gameState.prestigeLevel,
    newLevel: newPrestigeLevel,
    currentMultiplier,
    newMultiplier,
    bonusGain: newMultiplier - currentMultiplier,
    prestigePointsGained: calculatePrestigeGain(gameState),
    currentPriceMultiplier,
    newPriceMultiplier,
  };
};