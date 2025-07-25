import type { Socket } from "socket.io-client";
import type { GameState } from "./game";

export interface EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, ...args: any[]): void | Promise<void>;
}

export type ClientToServerEvents = {
  click: () => void;
  buyUpgrade: (upgradeId: number, quantity: number) => void;
  reset: () => void;
};

export type ServerToClientEvents = {
  update: (gameState: GameState) => void;
  error: (message: string) => void;
  refused: (reason: string) => void;
  welcome: (payload: { userId: string }) => void;
  loading: (isLoading: boolean) => void;
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