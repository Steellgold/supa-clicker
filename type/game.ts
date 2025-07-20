import { SpecialItemCategory, SpecialItemEffect } from "@/lib/constants/special-items";

export type Upgrade = {
  id: number;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  rpsGain: number;
  clickMultiplier: number;
  category: string;
};

export type GameOptions = {
  saveToSupabase?: boolean;
  userId?: string | null;
  autoSaveInterval?: number;
  upgrades?: Upgrade[];
  storageKey?: string;
};

export type GameState = {
  totalClicks: number;
  totalPower: number;
  currentPower: number;
  clickPower: number;
  rps: number;
  upgrades: Record<number, number>;
  specialItems: Record<number, number>;
  // Achievement-related fields
  unlockedAchievements: number[];
  lastSaveTime: number;
  prestigeLevel: number;
  resourcesPerSecond: number;
  currentResources: number;
  // Combo System
  comboCount: number;
  lastClickTime: number;
  // Time Boost System
  timeBoostActive: boolean;
  timeBoostEndTime: number;
  timeBoostMultiplier: number;
}

export type UserUpgrade = {
  upgradeId: number;
  quantity: number;
}

export type GameStats = {
  totalClicks: number;
  currentResources: number;
  resourcesPerSecond: number;
  lastSaveTime: number;
  prestigeLevel: number;
}

export type Achievement = {
  id: number;
  name: string;
  description: string;
  requirement: (stats: GameStats, upgrades?: UserUpgrade[]) => boolean;
  unlocked: boolean;
  icon: string;
}

export type SpecialItem = {
  id: number;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  category: SpecialItemCategory;
  effect: SpecialItemEffect;
  multiplier: number;
  unlockRequirement?: number;
  maxPurchases?: number;
  isFeatureUnlock?: boolean;
}