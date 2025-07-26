import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { checkAchievements, getAllAchievements, getUnlockedAchievements } from "../lib/achievements";
import type { AuthenticatedSocket } from "../middleware/auth";

export class AchievementsHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): void {
    const session = sessions.get(socket);
    if (!session) {
      console.log("[ACHIEVEMENTS] No session found for socket");
      return;
    }

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      // Check for newly unlocked achievements
      const newlyUnlocked = checkAchievements(session.gameState, (session as any).session_start_time);
      
      // Add newly unlocked achievements to the game state
      for (const achievement of newlyUnlocked) {
        if (!session.gameState.unlocked_achievements.includes(achievement.id)) {
          session.gameState.unlocked_achievements.push(achievement.id);
          socket.emit("achievementUnlocked", achievement);
          console.log(`[ACHIEVEMENT] User ${userId} unlocked: ${achievement.name}`);
        }
      }

      // Send all achievements with unlocked status
      const allAchievements = getAllAchievements();
      // const unlockedAchievements = getUnlockedAchievements(session.gameState.unlocked_achievements);
      
      socket.emit("achievementsList", allAchievements, session.gameState.unlocked_achievements);
      
    } catch (error) {
      console.error(`[ACHIEVEMENTS] Error processing achievements for ${userId}:`, error);
      socket.emit("error", "Failed to process achievements");
    }
  }
} 