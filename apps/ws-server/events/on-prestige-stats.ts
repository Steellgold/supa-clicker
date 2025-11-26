import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { getPrestigeLevelStats, getPrestigeStatsSummary } from "../lib/prestige-stats";
import type { AuthenticatedSocket } from "../middleware/auth";

export class PrestigeStatsHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, prestigeLevel?: number): void {
    const session = sessions.get(socket);
    if (!session) {
      console.log("[PRESTIGE_STATS] No session found for socket");
      return;
    }

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      if (prestigeLevel !== undefined) {
        // Get stats for specific prestige level
        const stats = getPrestigeLevelStats(session.gameState, prestigeLevel);
        socket.emit("prestigeStats", stats);
      } else {
        // Get summary of all prestige stats
        const summary = getPrestigeStatsSummary(session.gameState);
        socket.emit("prestigeStatsSummary", summary);
      }
      
    } catch (error) {
      console.error(`[PRESTIGE_STATS] Error processing prestige stats for ${userId}:`, error);
      socket.emit("error", "Failed to get prestige statistics");
    }
  }
} 