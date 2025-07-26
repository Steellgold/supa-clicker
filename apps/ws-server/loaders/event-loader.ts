import type { SessionsMap, SocketWithSession } from "@clicker/game/types";
import { AchievementsHandler } from "../events/on-achievements";
import { BuyUpgradeHandler } from "../events/on-buy-upgrade";
import { ClickHandler } from "../events/on-click";
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
  }
}