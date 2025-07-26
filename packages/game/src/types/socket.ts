import type { Socket } from "socket.io";
import type { Achievement, GameState, PrestigeStats, LeaderboardEntry, LeaderboardResponse, LeaderboardType, UserLeaderboardStats } from "./game";

export interface EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, ...args: any[]): void | Promise<void>;
}

export type ClientToServerEvents = {
  click: () => void;
  buyUpgrade: (upgradeId: number, quantity: number, isBulk?: boolean) => void;
  reset: () => void;
  prestige: (confirmed?: boolean) => void;
  getAchievements: () => void;
  getPrestigeStats: (prestigeLevel?: number) => void;
  getPrestigeStatsSummary: () => void;
  getLeaderboard: (data: { type: LeaderboardType; limit: number; userId?: string }) => void;
  getUserLeaderboardPosition: (data: { type: LeaderboardType; userId: string }) => void;
  updateLeaderboard: (stats: UserLeaderboardStats) => void;
};

export type ServerToClientEvents = {
  update: (gameState: GameState) => void;
  error: (message: string) => void;
  refused: (reason: string) => void;
  welcome: (payload: { userId: string }) => void;
  loading: (isLoading: boolean) => void;
  achievementUnlocked: (achievement: Achievement) => void;
  achievementsList: (achievements: Achievement[], unlockedIds: number[]) => void;
  prestigeStats: (stats: PrestigeStats | null) => void;
  prestigeStatsSummary: (summary: {
    total_prestiges: number;
    total_time_played: number;
    total_power_earned: number;
    total_clicks: number;
    total_upgrades_purchased: number;
    average_prestige_duration: number;
    fastest_prestige: number;
    slowest_prestige: number;
    most_productive_prestige: number;
  }) => void;
  leaderboardUpdate: (data: LeaderboardResponse) => void;
  leaderboardError: (message: string) => void;
  userPositionUpdate: (data: { position: number; userData: LeaderboardEntry | null }) => void;
  userPositionError: (message: string) => void;
};

export type Session = {
  userId: string;
  lastClickTimestamps: number[];
  power: number;
  gameState: GameState;
  clickTimestamps: number[];
}

export type SessionsMap = Map<SocketWithSession, Session>;
export type SocketWithSession = Socket<ClientToServerEvents, ServerToClientEvents>;