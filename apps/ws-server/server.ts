import type { ClientToServerEvents, GameState, ServerToClientEvents } from "@clicker/game/types";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { EventLoader } from "./loaders/event-loader";
import { GameService } from "./services/game";
import { recalculateStats } from "./utils/utils";

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

export interface Session {
  userId: string;
  lastClickTimestamps: number[];
  power: number;
  gameState: GameState;
  clickTimestamps: number[];
}

const sessions = new Map<Socket<ClientToServerEvents, ServerToClientEvents>, Session>();
const eventLoader = new EventLoader();

io.use((socket, next) => {
  const token = socket.handshake.query.token as string | undefined;
  if (!token) {
    return next(new Error("No token provided"));
  }
  (socket as Socket<ClientToServerEvents, ServerToClientEvents> & { userId: string }).userId = token;
  next();
});

function createInitialGameState(): GameState {
  return {
    ppc: 1,
    pps: 0,
    power: 0,
    total_power: 0,
    upgrades: [],
  };
}

io.on("connection", async (socket) => {
  const userId = (socket as typeof socket & { userId: string }).userId;
  console.log(`[WS] User connected: ${userId}`);

  socket.emit("loading", true);

  try {
    let gameState = await GameService.loadGameState(userId);
    
    if (!gameState) {
      gameState = createInitialGameState();
      console.log(`[WS] New user, creating initial state for: ${userId}`);
    } else {
      recalculateStats(gameState);
      console.log(`[WS] Loaded existing state for: ${userId}`);
    }

    const session: Session = {
      userId,
      lastClickTimestamps: [],
      power: gameState.power,
      gameState,
      clickTimestamps: []
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
      clickTimestamps: []
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
        await GameService.saveGameState(session.userId, session.gameState);
        console.log(`[WS] Successfully saved data for: ${userId}`);
      } catch (error) {
        console.error(`[WS] Error saving data for ${userId}:`, error);
      }
      
      sessions.delete(socket);
    }
    console.log(`[WS] User disconnected: ${userId}`);
  });
});

setInterval(async () => {
  const savePromises: Promise<void>[] = [];
  
  for (const [socket, session] of sessions.entries()) {
    if (session.gameState.pps > 0) {
      session.gameState.power += session.gameState.pps;
      session.gameState.total_power += session.gameState.pps;
    }
    
    socket.emit("update", session.gameState);
    
    if (Date.now() % 10000 < 1000) {
      savePromises.push(
        GameService.saveGameState(session.userId, session.gameState)
          .catch(error => {
            console.error(`Failed to auto-save for user ${session.userId}:`, error);
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

httpServer.listen(8080, () => {
  console.log("Socket.io server running on ws://localhost:8080");
  console.log("Supabase integration enabled");
});