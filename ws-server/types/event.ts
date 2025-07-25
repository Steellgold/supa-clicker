import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, Session } from "../server";

export type SocketWithSession = Socket<ClientToServerEvents, ServerToClientEvents>;
export type SessionsMap = Map<SocketWithSession, Session>;

export interface EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, ...args: unknown[]): void | Promise<void>;
}