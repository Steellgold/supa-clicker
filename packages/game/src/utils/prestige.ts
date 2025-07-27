import type { GameState } from '../types/game';

export const PRESTIGE_CONFIG = {
  FIRST_PRESTIGE_REQUIREMENT: 10_000_000,
  MAX_PRESTIGE_LEVEL: 50,
  BASE_EXPONENT: 2.5,
  POWER_MULTIPLIER_PER_PRESTIGE: 0.5,
} as const;

export const calculatePrestigeCost = (prestigeLevel: number): number => {
  if (prestigeLevel <= 0) return 0;
  if (prestigeLevel === 1) return PRESTIGE_CONFIG.FIRST_PRESTIGE_REQUIREMENT;
  
  // MATH: 10M * (2.5 ^ (level - 1))
  return Math.floor(
    PRESTIGE_CONFIG.FIRST_PRESTIGE_REQUIREMENT * 
    Math.pow(PRESTIGE_CONFIG.BASE_EXPONENT, prestigeLevel - 1)
  );
}

export const getMaxAffordablePrestigeLevel = (lifetimePower: number): number => {
  let level = 0;
  
  while (level < PRESTIGE_CONFIG.MAX_PRESTIGE_LEVEL) {
    const nextLevelCost = calculatePrestigeCost(level + 1);
    if (lifetimePower >= nextLevelCost) {
      level++; 
    } else {
      break;
    }
  }
  
  return level;
}

export const canPrestige = (gameState: GameState): boolean => {
  const nextPrestigeLevel = gameState.prestige_level + 1;
  if (nextPrestigeLevel > PRESTIGE_CONFIG.MAX_PRESTIGE_LEVEL) return false;
  
  const requiredPower = calculatePrestigeCost(nextPrestigeLevel);
  return gameState.power >= requiredPower;
}

export const getPrestigeMultiplier = (prestigeLevel: number): number => {
  return 1 + (prestigeLevel * PRESTIGE_CONFIG.POWER_MULTIPLIER_PER_PRESTIGE);
}

export const performPrestige = (gameState: GameState): GameState => {
  if (!canPrestige(gameState)) {
    throw new Error('Cannot perform prestige - requirements not met');
  }
  
  const newPrestigeLevel = gameState.prestige_level + 1;
  
  return {
    ...gameState,
    prestige_level: newPrestigeLevel,
    power: 0,
    total_power: 0,
    ppc: 1,
    pps: 0,
    upgrades: [],
    //
    unlocked_achievements: gameState.unlocked_achievements || [],
    prestige_stats: gameState.prestige_stats || [],
    current_prestige_start_time: Date.now(),
    current_prestige_clicks: 0,
    current_prestige_upgrades_purchased: 0,
    current_prestige_power_spent: 0,
    current_prestige_power_earned: 0,
  };
}

export const getPrestigeProgress = (gameState: GameState): number => {
  const nextPrestigeLevel = gameState.prestige_level + 1;
  if (nextPrestigeLevel > PRESTIGE_CONFIG.MAX_PRESTIGE_LEVEL) return 1;
  
  const requiredPower = calculatePrestigeCost(nextPrestigeLevel);
  return Math.min(gameState.power / requiredPower, 1);
}

export const getNextPrestigeInfo = (gameState: GameState): {
  canPrestige: boolean;
  nextLevel: number;
  requiredPower: number;
  currentPower: number;
  progress: number;
  newMultiplier: number;
} | null => {
  const nextLevel = gameState.prestige_level + 1;
  
  if (nextLevel > PRESTIGE_CONFIG.MAX_PRESTIGE_LEVEL) {
    return null;
  }
  
  const requiredPower = calculatePrestigeCost(nextLevel);
  const progress = getPrestigeProgress(gameState);
  const newMultiplier = getPrestigeMultiplier(nextLevel);
  
  return {
    canPrestige: canPrestige(gameState),
    nextLevel,
    requiredPower,
    currentPower: gameState.lifetime_power,
    progress,
    newMultiplier,
  };
}

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'O', 'N', 'D'];
  let suffixIndex = 0;
  let value = num;
  
  while (value >= 1000 && suffixIndex < suffixes.length - 1) {
    value /= 1000;
    suffixIndex++;
  }
  
  return `${value.toFixed(suffixIndex === 0 ? 0 : 2)}${suffixes[suffixIndex]}`;
}