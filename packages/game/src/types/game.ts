export const GUEST_ID_KEY = "supa-clicker-guest-id";

// Leaderboard types
export type LeaderboardType = "total_clicks" | "total_power" | "prestige_level";

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  display_name?: string;
  total_clicks: number;
  total_power: number;
  prestige_level: number;
  achievements_count: number;
  clicks_per_second: number;
  updated_at: string;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  userPosition: number | null;
  userData: LeaderboardEntry | null;
  type: LeaderboardType;
};

export type UserLeaderboardStats = {
  userId: string;
  username: string;
  totalClicks: number;
  totalPower: number;
  prestigeLevel: number;
  achievementsCount: number;
  clicksPerSecond: number;
};

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

// Achievement type
export type Achievement = {
  id: number;
  name: string;
  description: string;
  requirement: (stats: GameStats, upgrades?: UserUpgrade[]) => boolean;
  unlocked: boolean;
  icon: string;
  category:
    | "clicking"
    | "upgrades"
    | "prestige"
    | "power"
    | "special"
    | "challenge"
    | "speed"
    | "time"
    | "efficiency"
    | "tech"
    | "milestone"
    | "combo"
    | "session";

  rarity: "common" | "rare" | "epic" | "legendary";
};

// Prestige Statistics - tracks stats for each prestige level
export type PrestigeStats = {
  prestige_level: number;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  total_power_earned: number;
  total_clicks: number;
  upgrades_purchased: number;
  power_spent_on_upgrades: number;
  max_pps_reached: number;
  max_ppc_reached: number;
  final_upgrades: DatabaseUpgrade[];
  achievements_unlocked: number[];
};

// Extended Game State with achievements and prestige stats
export type GameState = {
  ppc: number;
  pps: number;
  power: number;
  total_power: number;
  upgrades: DatabaseUpgrade[];
  prestige_level: number;
  lifetime_power: number;
  lifetime_clicks: number;
  unlocked_achievements: number[];
  prestige_stats: PrestigeStats[];
  current_prestige_start_time: number;
  current_prestige_clicks: number;
  current_prestige_upgrades_purchased: number;
  current_prestige_power_spent: number;
  current_prestige_power_earned: number;
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
  lifetimePower: number;
  lifetimeClicks: number;
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