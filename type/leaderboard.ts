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