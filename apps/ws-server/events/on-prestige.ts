import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { canPrestige, performPrestige } from "@clicker/game/utils";
import { checkAchievements } from "../lib/achievements";
import { finalizePrestigeStats, initializeNewPrestigeStats } from "../lib/prestige-stats";
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

      const finalizedStats = finalizePrestigeStats(session.gameState);
      console.log(`[PRESTIGE] Finalized stats for user ${userId} at prestige ${finalizedStats.prestige_level}:`, {
        duration: finalizedStats.duration_seconds,
        powerEarned: finalizedStats.total_power_earned,
        clicks: finalizedStats.total_clicks,
        upgrades: finalizedStats.upgrades_purchased
      });

      const newGameState = performPrestige(session.gameState);
      session.gameState = newGameState;
      
      initializeNewPrestigeStats(session.gameState);
      
      const newlyUnlocked = checkAchievements(session.gameState, (session as any).session_start_time);
      for (const achievement of newlyUnlocked) {
        if (!session.gameState.unlocked_achievements.includes(achievement.id)) {
          session.gameState.unlocked_achievements.push(achievement.id);
          socket.emit("achievementUnlocked", achievement);
          console.log(`[ACHIEVEMENT] User ${userId} unlocked: ${achievement.name}`);
        }
      }
      
      try {
        await GameService.saveGameState(userId, newGameState);
        console.log(`[PRESTIGE] Successfully saved game state after prestige for user ${userId}`);
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