import { SpecialItemCategory, SpecialItemEffect } from "@/lib/constants/special-items";

export type Upgrade = {
  id: number;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  ppsGain: number;
  clickMultiplier: number;
  category: string;
  maxPurchases?: number;
};

export type GameOptions = {
  saveToSupabase?: boolean;
  userId?: string | null;
  autoSaveInterval?: number;
  upgrades?: Upgrade[];
  storageKey?: string;
};

export type PurchasedUpgrade = {
  upgradeId: number;
  quantity: number;
  ppsGain: number;
  clickMultiplier: number;
};

export type PurchasedSpecialItem = {
  specialItemId: number;
  quantity: number;
  effectMultiplier: number;
};

export type GameState = {
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: { id: number; level: number }[];
};

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
  // Session stats for achievements
  upgradesBoughtSession: number;
  clicksSession: number;
  powerSession: number;
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