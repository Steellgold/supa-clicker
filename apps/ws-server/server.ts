import type { ClientToServerEvents, GameState, ServerToClientEvents } from "@clicker/game/types";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { EventLoader } from "./loaders/event-loader";
import { authenticateSocket, type AuthenticatedSocket } from "./middleware/auth";
import { sanitizeGameState } from "./schemas/validation";
import { GameService } from "./services/game";
import { auditLogger } from "./utils/audit-logger";
import { rateLimiter } from "./utils/rate-limiter";
import { recalculateStats } from "./utils/utils";

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { 
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL || "https://supaclicker.vercel.app"] 
      : "*" 
  },
});

export interface Session {
  userId: string;
  lastClickTimestamps: number[];
  power: number;
  gameState: GameState;
  clickTimestamps: number[];
  lastValidation: number;
}

const sessions = new Map<Socket<ClientToServerEvents, ServerToClientEvents>, Session>();
const eventLoader = new EventLoader();

// Use proper authentication middleware
io.use(authenticateSocket);

function createInitialGameState(): GameState {
  const now = Date.now();
  return {
    ppc: 1,
    pps: 0,
    power: 0,
    total_power: 0,
    upgrades: [],
    prestige_level: 0,
    lifetime_power: 0,
    lifetime_clicks: 0,
    unlocked_achievements: [],
    prestige_stats: [{
      prestige_level: 0,
      start_time: now,
      end_time: 0,
      duration_seconds: 0,
      total_power_earned: 0,
      total_clicks: 0,
      upgrades_purchased: 0,
      power_spent_on_upgrades: 0,
      max_pps_reached: 0,
      max_ppc_reached: 1,
      final_upgrades: [],
      achievements_unlocked: []
    }],
    current_prestige_start_time: now,
    current_prestige_clicks: 0,
    current_prestige_upgrades_purchased: 0,
    current_prestige_power_spent: 0,
  };
}

io.on("connection", async (socket) => {
  const authSocket = socket as AuthenticatedSocket;
  const userId = authSocket.userId;
  const userIp = socket.handshake.address;
  const guestId = socket.handshake.query.guestId as string | undefined;
  
  // Check IP connection limits
  const ipCheck = rateLimiter.checkIPConnections(userIp);
  if (!ipCheck.allowed) {
    auditLogger.logSecurityViolation(userId, 'IP_CONNECTION_LIMIT', { ip: userIp }, userIp);
    socket.emit("error", ipCheck.reason || "Unknown reason");
    socket.disconnect();
    return;
  }

  auditLogger.logAuth(userId, 'login', { ip: userIp, guestId });
  console.log(`[WS] User connected: ${userId}`);
  console.log(`[WS] Guest ID received: ${guestId}`);
  console.log(`[WS] Migration check: guestId=${guestId}, userId=${userId}, different=${guestId !== userId}`);

  socket.emit("loading", true);

  let migratedGameState: GameState | null = null;
  if (guestId && guestId !== userId) {
    console.log(`[WS] Starting migration from guest ${guestId} to user ${userId}`);
    migratedGameState = await GameService.smartMigrateGameState(guestId, userId);
    console.log(`[WS] Migration result:`, migratedGameState ? 'Success' : 'Failed/No data');
  } else {
    console.log(`[WS] No migration needed - guestId: ${guestId}, userId: ${userId}`);
  }

  try {
    if (authSocket.user.email) {
      await GameService.ensureUserProfile(userId);
    }
    
    let gameState = migratedGameState || await GameService.loadGameState(userId);
    
    if (!gameState) {
      gameState = createInitialGameState();
      console.log(`[WS] New user, creating initial state for: ${userId}`);
    } else {
      recalculateStats(gameState);
      console.log(`[WS] Loaded existing state for: ${userId}`);
    }

    // Validate game state integrity on load
    if (!sanitizeGameState(gameState)) {
      auditLogger.logDataIntegrity(userId, 'INVALID_LOAD_STATE', { gameState });
      gameState = createInitialGameState();
      console.warn(`[SECURITY] Invalid game state detected for user ${userId}, reset to initial state`);
    }

    const session: Session = {
      userId,
      lastClickTimestamps: [],
      power: gameState.power,
      gameState,
      clickTimestamps: [],
      lastValidation: Date.now()
    };

    sessions.set(socket, session);

    socket.emit("loading", false);
    socket.emit("welcome", { userId });
    socket.emit("update", gameState);

    eventLoader.registerEvents(socket, sessions);

  } catch (error) {
    console.error(`[WS] Error loading user data for ${userId}:`, error);
    socket.emit("loading", false);
    socket.emit("error", "Failed to load game data");
    
    const gameState = createInitialGameState();
    const session: Session = {
      userId,
      lastClickTimestamps: [],
      power: 0,
      gameState,
      clickTimestamps: [],
      lastValidation: Date.now()
    };
    
    sessions.set(socket, session);
    socket.emit("welcome", { userId });
    socket.emit("update", gameState);
    
    eventLoader.registerEvents(socket, sessions);
  }

  socket.on("disconnect", async () => {
    const session = sessions.get(socket);
    if (session) {
      console.log(`[WS] User disconnecting: ${userId}, saving data...`);
      
      try {
        // Final validation before save
        if (sanitizeGameState(session.gameState)) {
          await GameService.saveGameState(session.userId, session.gameState);
          console.log(`[WS] Successfully saved data for: ${userId}`);
        } else {
          auditLogger.logDataIntegrity(userId, 'INVALID_DISCONNECT_STATE', { gameState: session.gameState });
          console.error(`[SECURITY] Invalid game state at disconnect for user ${userId}, not saving`);
        }
      } catch (error) {
        console.error(`[WS] Error saving data for ${userId}:`, error);
        auditLogger.logDataIntegrity(userId, 'SAVE_ERROR', { error: error?.toString() });
      }
      
      sessions.delete(socket);
      rateLimiter.releaseIPConnection(userIp);
    }
    
    auditLogger.logAuth(userId, 'logout', { ip: userIp });
    console.log(`[WS] User disconnected: ${userId}`);
  });
});

setInterval(async () => {
  const savePromises: Promise<void>[] = [];
  const now = Date.now();
  
  for (const [socket, session] of sessions.entries()) {
    // Periodic session validation (every 5 minutes)
    if (now - session.lastValidation > 300000) {
      if (!sanitizeGameState(session.gameState)) {
        auditLogger.logDataIntegrity(session.userId, 'PERIODIC_VALIDATION_FAILED', { gameState: session.gameState });
        console.warn(`[SECURITY] Periodic validation failed for user ${session.userId}`);
        // Reset to last known good state or disconnect
        socket.emit("error", "Game state validation failed");
        socket.disconnect();
        continue;
      }
      session.lastValidation = now;
    }

    // Apply PPS rewards
    if (session.gameState.pps > 0) {
      const ppsReward = session.gameState.pps;
      
      // Sanity check on PPS values
      if (ppsReward > 1000000) {
        auditLogger.logSecurityViolation(session.userId, 'SUSPICIOUS_PPS', { pps: ppsReward });
        console.warn(`[SECURITY] Suspicious PPS value for user ${session.userId}: ${ppsReward}`);
      }
      
      session.gameState.power += ppsReward;
      session.gameState.total_power += ppsReward;
      session.gameState.lifetime_power += ppsReward;
    }
    
    socket.emit("update", session.gameState);
    
    // Auto-save every 10 seconds
    if (Date.now() % 10000 < 1000) {
      savePromises.push(
        GameService.saveGameState(session.userId, session.gameState)
          .catch(error => {
            console.error(`Failed to auto-save for user ${session.userId}:`, error);
            auditLogger.logDataIntegrity(session.userId, 'AUTO_SAVE_ERROR', { error: error?.toString() });
          })
      );
    }
  }
  
  if (savePromises.length > 0) {
    try {
      await Promise.all(savePromises);
    } catch (error) {
      console.error("Error in batch save:", error);
    }
  }
}, 1000);

setInterval(async () => {
  console.log(`[AUTO-SAVE] Saving ${sessions.size} active sessions...`);
  
  const savePromises = Array.from(sessions.values()).map(session =>
    GameService.saveGameState(session.userId, session.gameState)
      .catch(error => {
        console.error(`Auto-save failed for user ${session.userId}:`, error);
      })
  );
  
  try {
    await Promise.all(savePromises);
    console.log(`[AUTO-SAVE] Completed for ${sessions.size} sessions`);
  } catch (error) {
    console.error("[AUTO-SAVE] Batch save error:", error);
  }
}, 30000);

process.on("SIGINT", async () => {
  console.log("[SHUTDOWN] Saving all sessions before exit...");
  
  const savePromises = Array.from(sessions.values()).map(session =>
    GameService.saveGameState(session.userId, session.gameState)
      .catch(error => {
        console.error(`Shutdown save failed for user ${session.userId}:`, error);
      })
  );
  
  try {
    await Promise.all(savePromises);
    console.log("[SHUTDOWN] All data saved successfully");
  } catch (error) {
    console.error("[SHUTDOWN] Error saving data:", error);
  }
  
  process.exit(0);
});

httpServer.listen(process.env.WS_SERVER_PORT, () => {
  console.log("Socket.io server running on ws://" + process.env.WS_SERVER_URL + ":" + process.env.WS_SERVER_PORT);
  console.log("Supabase integration enabled");
});