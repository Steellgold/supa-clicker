import { SupabaseClient } from "@supabase/supabase-js";

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
  supabaseClient?: SupabaseClient | undefined;
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
  // Achievement-related fields
  unlockedAchievements: number[];
  lastSaveTime: number;
  prestigeLevel: number;
  resourcesPerSecond: number;
  currentResources: number;
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