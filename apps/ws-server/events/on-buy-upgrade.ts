import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { calculateUpgradeCost, getUpgradeById, recalculateStats } from "../utils/utils";

export class BuyUpgradeHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, upgradeId: number, quantity: number): void {
    const session = sessions.get(socket);
    if (!session) return;

    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) {
      socket.emit("refused", "Invalid upgrade");
      return;
    }

    let up = session.gameState.upgrades.find(u => u.id === upgradeId);
    if (!up) {
      up = { id: upgradeId, level: 0 };
      session.gameState.upgrades.push(up);
    }

    let totalCost = 0;
    let canBuy = 0;

    for (let i = 0; i < quantity; i++) {
      const cost = calculateUpgradeCost(upgrade, up.level + i);
      if (session.gameState.power >= totalCost + cost) {
        totalCost += cost;
        canBuy++;
      } else {
        break;
      }
    }

    if (canBuy === 0) {
      socket.emit("refused", "Not enough power");
      return;
    }

    session.gameState.power -= totalCost;
    up.level += canBuy;
    recalculateStats(session.gameState);
    
    socket.emit("update", session.gameState);
  }
}