import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { LeaderboardService } from "../lib/leaderboard";
import type { AuthenticatedSocket } from "../middleware/auth";
import { RateLimiter } from "../utils/rate-limiter";

const rateLimiter = new RateLimiter();

export class LeaderboardHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): Promise<void> {
    const session = sessions.get(socket);
    if (!session) {
      console.log("[LEADERBOARD] No session found for socket");
      return;
    }

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    const rateCheck = rateLimiter.checkLeaderboardRate(userId);
    if (!rateCheck.allowed) {
      console.log(`[LEADERBOARD] Rate limit exceeded for user ${userId}: ${rateCheck.reason}`);
      socket.emit("leaderboardError", rateCheck.reason || "Rate limit exceeded");
      return;
    }

    try {
      const requestData = data as { type?: string; limit?: number; userId?: string } || {};
      const type = (requestData.type as any) || "total_power";
      const limit = requestData.limit || 50;

      console.log(`[LEADERBOARD] Processing request for user ${userId}, type: ${type}, limit: ${limit}, timestamp: ${new Date().toISOString()}`);

      LeaderboardService.invalidateCacheForType(type);

      const leaderboard = await LeaderboardService.getLeaderboard(type, limit);

      let userPosition: number | null = null;
      let userData: any = null;

      if (LeaderboardService.isUserEligible(userId)) {
        const hasValidProfile = await LeaderboardService.hasValidProfile(userId);

        if (hasValidProfile) {
          const positionResult = await LeaderboardService.getUserPosition(userId, type);
          userPosition = positionResult.position;
          userData = positionResult.userData;
        }
      }

      const response = {
        leaderboard,
        userPosition,
        userData,
        type,
      };

      console.log(`[LEADERBOARD] Successfully processed request for user ${userId}, sending ${leaderboard.length} entries for type ${type}`);
      console.log(`[LEADERBOARD] First entry:`, leaderboard[0] ? `${leaderboard[0].username} (${leaderboard[0].user_id})` : 'None');
      socket.emit("leaderboardUpdate", response);
      
    } catch (error) {
      console.error(`[LEADERBOARD] Error processing leaderboard for ${userId}:`, error);
      socket.emit("leaderboardError", "Failed to get leaderboard data");
    }
  }
}

export class UserLeaderboardPositionHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): Promise<void> {
    const session = sessions.get(socket);
    if (!session) {
      console.log("[LEADERBOARD_POSITION] No session found for socket");
      return;
    }

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    const rateCheck = rateLimiter.checkLeaderboardRate(userId);
    if (!rateCheck.allowed) {
      console.log(`[LEADERBOARD_POSITION] Rate limit exceeded for user ${userId}: ${rateCheck.reason}`);
      socket.emit("userPositionError", rateCheck.reason || "Rate limit exceeded");
      return;
    }

    try {
      const requestData = data as { type?: string; userId?: string } || {};
      const type = (requestData.type as any) || "total_power";
      const requestedUserId = requestData.userId || userId;

      console.log(`[LEADERBOARD_POSITION] Fetching position for user ${requestedUserId}, type: ${type}`);

      if (!LeaderboardService.isUserEligible(requestedUserId)) {
        console.log(`[LEADERBOARD_POSITION] User ${requestedUserId} is not eligible for leaderboard (guest user)`);
        socket.emit("userPositionUpdate", { position: 0, userData: null });
        return;
      }

      const hasValidProfile = await LeaderboardService.hasValidProfile(requestedUserId);
      if (!hasValidProfile) {
        console.log(`[LEADERBOARD_POSITION] User ${requestedUserId} has no valid profile for leaderboard`);
        socket.emit("userPositionUpdate", { position: 0, userData: null });
        return;
      }

      const result = await LeaderboardService.getUserPosition(requestedUserId, type);

      console.log(`[LEADERBOARD_POSITION] User ${requestedUserId} position: ${result.position}`);
      socket.emit("userPositionUpdate", { 
        position: result.position, 
        userData: result.userData 
      });
      
    } catch (error) {
      console.error(`[LEADERBOARD_POSITION] Error processing user position for ${userId}:`, error);
      socket.emit("userPositionError", "Failed to get user position");
    }
  }
}

export class UpdateLeaderboardHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap, data?: unknown): Promise<void> {
    const session = sessions.get(socket);
    if (!session) {
      console.log("[UPDATE_LEADERBOARD] No session found for socket");
      return;
    }

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      console.log(`[UPDATE_LEADERBOARD] Updating leaderboard for user ${userId}`);
      
      await LeaderboardService.updateUserStats(userId, session.gameState);
      LeaderboardService.invalidateCache();

      console.log(`[UPDATE_LEADERBOARD] Successfully updated leaderboard for user ${userId}`);
    } catch (error) {
      console.error(`[UPDATE_LEADERBOARD] Error updating leaderboard for ${userId}:`, error);
      socket.emit("error", "Failed to update leaderboard");
    }
  }
} 