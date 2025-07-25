import type { GameState } from "./game";

export interface ClientToServerEvents {
  click: () => void;
  buyUpgrade: (upgradeId: number, quantity: number) => void;
  reset: () => void;
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