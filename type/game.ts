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
  totalClicks: number;
  totalPower: number;
  currentPower: number;
  clickPower: number;
  pps: number;
  upgrades: Record<number, number>;
  specialItems: Record<number, number>;
  // Ajout : upgrades et special items figés
  purchasedUpgrades?: PurchasedUpgrade[];
  purchasedSpecialItems?: PurchasedSpecialItem[];
  // Prix figés pour le prochain achat
  nextUpgradeCosts?: Record<number, number>;
  nextSpecialItemCosts?: Record<number, number>;
  // Achievement-related fields
  unlockedAchievements: number[];
  lastSaveTime: number;
  prestigeLevel: number;
  resourcesPerSecond: number;
  currentResources: number;
  // Combo System
  comboActive: boolean;
  comboCount: number;
  lastClickTime: number;
  // Time Boost System
  timeBoostActive: boolean;
  timeBoostEndTime: number;
  timeBoostMultiplier: number;
  total_spent?: number;
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