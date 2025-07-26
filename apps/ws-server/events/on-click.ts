import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { getPrestigeMultiplier } from "@clicker/game/utils";
import { checkAchievements } from "../lib/achievements";
import { updateCurrentPrestigeStats } from "../lib/prestige-stats";
import type { AuthenticatedSocket } from "../middleware/auth";
import { clickEventSchema, sanitizeGameState, validateInput } from "../schemas/validation";
import { rateLimiter } from "../utils/rate-limiter";
import { recalculateStats } from "../utils/utils";

export class ClickHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): void {
    const session = sessions.get(socket);
    if (!session) return;

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      validateInput(clickEventSchema, data || {});

      const rateCheck = rateLimiter.checkClickRate(userId);
      if (!rateCheck.allowed) {
        socket.emit("refused", rateCheck.reason || "Unknown reason");
        
        const suspiciousLevel = rateLimiter.getSuspiciousActivityLevel(userId);
        if (suspiciousLevel > 3) {
          console.warn(`[SECURITY] High suspicious activity for user ${userId}: level ${suspiciousLevel}`);
        }
        return;
      }

      recalculateStats(session.gameState);

      const prestigeMultiplier = getPrestigeMultiplier(session.gameState.prestige_level);
      const powerGained = session.gameState.ppc * prestigeMultiplier;

      session.gameState.power += powerGained;
      session.gameState.total_power += powerGained;
      session.gameState.lifetime_power += powerGained;
      session.gameState.lifetime_clicks += 1;

      // Update prestige statistics
      updateCurrentPrestigeStats(
        session.gameState, powerGained, 1
      );

      // Check for achievements
      const newlyUnlocked = checkAchievements(session.gameState);
      console.log(`[ACHIEVEMENT] Found ${newlyUnlocked.length} newly unlocked achievements for user ${userId}`);
      
      for (const achievement of newlyUnlocked) {
        if (!session.gameState.unlocked_achievements.includes(achievement.id)) {
          session.gameState.unlocked_achievements.push(achievement.id);
          console.log(`[ACHIEVEMENT] Emitting achievementUnlocked event for user ${userId}: ${achievement.name}`);
          socket.emit("achievementUnlocked", achievement);
          console.log(`[ACHIEVEMENT] User ${userId} unlocked: ${achievement.name}`);
        } else {
          console.log(`[ACHIEVEMENT] Achievement ${achievement.name} already unlocked for user ${userId}`);
        }
      }

      if (!sanitizeGameState(session.gameState)) {
        console.error(`[SECURITY] Game state validation failed for user ${userId}`);
        socket.emit("refused", "Invalid game state detected");
        return;
      }

      socket.emit("update", session.gameState);
    } catch (error) {
      console.error(`[CLICK] Validation error for user ${userId}:`, error);
      socket.emit("refused", "Invalid click data");
    }
  }
}