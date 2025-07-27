import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { getPrestigeMultiplier } from "@clicker/game/utils";
import { checkAchievements } from "../lib/achievements";
import { updateCurrentPrestigeStats } from "../lib/prestige-stats";
import type { AuthenticatedSocket } from "../middleware/auth";
import { clickEventSchema, sanitizeGameState, validateInput } from "../schemas/validation";
import { GameService } from "../services/game";
import { rateLimiter } from "../utils/rate-limiter";
import { recalculateStats } from "../utils/utils";

export class ClickHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): Promise<void> {
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

      // Session-specific counters
      session.session_current_power += powerGained;
      session.session_clicks += 1;

      // Check for achievements
      const newlyUnlocked = checkAchievements(session.gameState, (session as any).session_start_time, {
        session_current_power: session.session_current_power,
        session_upgrades_purchased: session.session_upgrades_purchased,
        session_clicks: session.session_clicks
      });
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

      try {
        await GameService.saveGameState(userId, session.gameState);
        console.log(`[CLICK] Saved game state for user ${userId} after click`);
      } catch (error) {
        console.error(`[CLICK] Failed to save game state for user ${userId}:`, error);
      }

      socket.emit("update", session.gameState);
    } catch (error) {
      console.error(`[CLICK] Validation error for user ${userId}:`, error);
      socket.emit("refused", "Invalid click data");
    }
  }
}