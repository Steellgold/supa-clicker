export const GUEST_ID_KEY = "supa-clicker-guest-id";

// Upgrade type
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

export type DatabaseUpgrade = {
  id: number;
  level: number
}

// Game options
export type GameOptions = {
  saveToSupabase?: boolean;
  userId?: string | null;
  autoSaveInterval?: number;
  upgrades?: Upgrade[];
  storageKey?: string;
};

// Purchased upgrade
export type PurchasedUpgrade = {
  upgradeId: number;
  quantity: number;
  ppsGain: number;
  clickMultiplier: number;
};

// Purchased special item
export type PurchasedSpecialItem = {
  specialItemId: number;
  quantity: number;
  effectMultiplier: number;
};

// Game state (used by both www and ws-server)
export type GameState = {
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: DatabaseUpgrade[];
  prestige_level: number;
  lifetime_power: number;
};

// User upgrade
export type UserUpgrade = {
  upgradeId: number;
  quantity: number;
};

// Game statistics
export type GameStats = {
  totalClicks: number;
  currentResources: number;
  resourcesPerSecond: number;
  lastSaveTime: number;
  prestigeLevel: number;
  upgradesBoughtSession: number;
  clicksSession: number;
  powerSession: number;
};

// Achievement type
export type Achievement = {
  id: number;
  name: string;
  description: string;
  requirement: (stats: GameStats, upgrades?: UserUpgrade[]) => boolean;
  unlocked: boolean;
  icon: string;
};

// Special item type
export type SpecialItem = {
  id: number;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  category: any; // Replace with actual SpecialItemCategory type if needed
  effect: any;   // Replace with actual SpecialItemEffect type if needed
  multiplier: number;
  unlockRequirement?: number;
  maxPurchases?: number;
  isFeatureUnlock?: boolean;
};

// Database representation of game state
export type GameStateDB = {
  user_id: string;
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: DatabaseUpgrade[];
  prestige_level: number;
  lifetime_power: number;
  created_at?: string;
  updated_at?: string;
}