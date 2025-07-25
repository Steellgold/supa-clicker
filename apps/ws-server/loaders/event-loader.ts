import type { SessionsMap, SocketWithSession } from "@clicker/game/types";
import { BuyUpgradeHandler } from "../events/on-buy-upgrade";
import { ClickHandler } from "../events/on-click";
import { ResetHandler } from "../events/on-reset";

export class EventLoader {
  private clickHandler = new ClickHandler();
  private buyUpgradeHandler = new BuyUpgradeHandler();
  private resetHandler = new ResetHandler();

  registerEvents(socket: SocketWithSession, sessions: SessionsMap): void {
    socket.on("click", () => this.clickHandler.handle(socket, sessions));
    socket.on("buyUpgrade", (upgradeId: number, quantity: number, isBulk: boolean = false) => this.buyUpgradeHandler.handle(socket, sessions, upgradeId, quantity, isBulk));
    socket.on("reset", async () => await this.resetHandler.handle(socket, sessions));
  }
}