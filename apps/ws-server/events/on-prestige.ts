import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { canPrestige, performPrestige } from "@clicker/game/utils";
import type { AuthenticatedSocket } from "../middleware/auth";
import { prestigeEventSchema, validateInput } from "../schemas/validation";
import { GameService } from "../services/game";

export class PrestigeHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): Promise<void> {
    const session = sessions.get(socket);
    if (!session) return;

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      validateInput(prestigeEventSchema, data || {});
      
      if (!canPrestige(session.gameState)) {
        socket.emit("error", "Prestige requirements not met");
        console.warn(`[PRESTIGE] User ${userId} attempted prestige but requirements not met`);
        return;
      }

      const newGameState = performPrestige(session.gameState);
      
      session.gameState = newGameState;
      
      try {
        await GameService.saveGameState(userId, newGameState);
      } catch (error) {
        console.error(`[PRESTIGE] Failed to save game state after prestige for user ${userId}:`, error);
        socket.emit("error", "Failed to save prestige state");
        return;
      }
      
      socket.emit("update", newGameState);
      console.log(`[PRESTIGE] User ${userId} performed prestige to level ${newGameState.prestige_level}`);
    } catch (error) {
      console.error(`[PRESTIGE] Error processing prestige for ${userId}:`, error);
      socket.emit("error", "Prestige failed");
    }
  }
}