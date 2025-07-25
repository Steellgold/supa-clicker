import type { GameState } from "@clicker/game/types";

export interface ClientToServerEvents {
  click: () => void;
  buyUpgrade: (upgradeId: number, quantity: number, isBulk: boolean) => void;
  reset: () => void;
  prestige: (confirmed: boolean) => void;
}

export interface ServerToClientEvents {
  update: (gameState: GameState) => void;
  error: (message: string) => void;
  refused: (reason: string) => void;
  welcome: (payload: { userId: string }) => void;
  loading: (isLoading: boolean) => void;
}

export type ServerSocket = import("socket.io").Socket<ClientToServerEvents, ServerToClientEvents>;
export type ClientSocket = import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents>;