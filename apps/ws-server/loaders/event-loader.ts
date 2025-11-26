import type { SessionsMap, SocketWithSession } from "@clicker/game/types";
import { AchievementsHandler } from "../events/on-achievements";
import { BuyUpgradeHandler } from "../events/on-buy-upgrade";
import { ClickHandler } from "../events/on-click";
import { LeaderboardHandler, UpdateLeaderboardHandler, UserLeaderboardPositionHandler } from "../events/on-leaderboard";
import { PrestigeHandler } from "../events/on-prestige";
import { PrestigeStatsHandler } from "../events/on-prestige-stats";
import { ResetHandler } from "../events/on-reset";

export class EventLoader {
  private clickHandler = new ClickHandler();
  private buyUpgradeHandler = new BuyUpgradeHandler();
  private resetHandler = new ResetHandler();
  private prestigeHandler = new PrestigeHandler();
  private achievementsHandler = new AchievementsHandler();
  private prestigeStatsHandler = new PrestigeStatsHandler();
  private leaderboardHandler = new LeaderboardHandler();
  private userLeaderboardPositionHandler = new UserLeaderboardPositionHandler();
  private updateLeaderboardHandler = new UpdateLeaderboardHandler();

  registerEvents(socket: SocketWithSession, sessions: SessionsMap): void {
    console.log("🔌 [EVENT_LOADER] Registering events for socket");
    
    socket.on("click", () => this.clickHandler.handle(socket, sessions));
    socket.on("buyUpgrade", (upgradeId: number, quantity: number, isBulk: boolean = false) => this.buyUpgradeHandler.handle(socket, sessions, upgradeId, quantity, isBulk));
    socket.on("reset", async () => await this.resetHandler.handle(socket, sessions));
    socket.on("prestige", async (data) => await this.prestigeHandler.handle(socket, sessions, data));
    
    socket.on("getAchievements", () => {
      this.achievementsHandler.handle(socket, sessions);
    });
    
    socket.on("getPrestigeStats", (prestigeLevel?: number) => {
      this.prestigeStatsHandler.handle(socket, sessions, prestigeLevel);
    });
    
    socket.on("getPrestigeStatsSummary", () => {
      this.prestigeStatsHandler.handle(socket, sessions);
    });

    // Leaderboard events
    socket.on("getLeaderboard", async (data) => {
      console.log(`[EVENT_LOADER] Received getLeaderboard event with data:`, data, `Socket ID:`, socket.id);
      console.log(`[EVENT_LOADER] Socket connected:`, socket.connected, `Socket ID:`, socket.id);
      try {
        await this.leaderboardHandler.handle(socket, sessions, data);
      } catch (error) {
        console.error(`[EVENT_LOADER] Error in getLeaderboard handler:`, error);
        socket.emit("leaderboardError", "Internal server error");
      }
    });

    socket.on("getUserLeaderboardPosition", async (data) => {
      console.log(`[EVENT_LOADER] Received getUserLeaderboardPosition event with data:`, data, `Socket ID:`, socket.id);
      try {
        await this.userLeaderboardPositionHandler.handle(socket, sessions, data);
      } catch (error) {
        console.error(`[EVENT_LOADER] Error in getUserLeaderboardPosition handler:`, error);
        socket.emit("userPositionError", "Internal server error");
      }
    });

    socket.on("updateLeaderboard", async (data) => {
      console.log(`[EVENT_LOADER] Received updateLeaderboard event with data:`, data, `Socket ID:`, socket.id);
      try {
        await this.updateLeaderboardHandler.handle(socket, sessions, data);
      } catch (error) {
        console.error(`[EVENT_LOADER] Error in updateLeaderboard handler:`, error);
        socket.emit("error", "Internal server error");
      }
    });
  }
}