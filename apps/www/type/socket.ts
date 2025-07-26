import type { Achievement, GameState, PrestigeStats } from "@clicker/game/types";

export interface ClientToServerEvents {
  click: () => void;
  buyUpgrade: (upgradeId: number, quantity: number, isBulk?: boolean) => void;
  reset: () => void;
  prestige: (confirmed: boolean) => void;
  getAchievements: () => void;
  getPrestigeStats: (prestigeLevel?: number) => void;
  getPrestigeStatsSummary: () => void;
}

export interface ServerToClientEvents {
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
}

export type ServerSocket = import("socket.io").Socket<ClientToServerEvents, ServerToClientEvents>;
export type ClientSocket = import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents>;