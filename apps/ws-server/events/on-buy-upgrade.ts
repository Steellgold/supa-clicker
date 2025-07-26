import type { EventHandler, SessionsMap, SocketWithSession } from "@clicker/game/types";
import { checkAchievements } from "../lib/achievements";
import { updateCurrentPrestigeStats } from "../lib/prestige-stats";
import type { AuthenticatedSocket } from "../middleware/auth";
import { buyUpgradeEventSchema, sanitizeGameState, validateInput } from "../schemas/validation";
import { rateLimiter } from "../utils/rate-limiter";
import { calculateBulkUpgradeCost, calculateUpgradeCost, getUpgradeById, recalculateStats } from "../utils/utils";

export class BuyUpgradeHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap, upgradeId: number, quantity: number, isBulk: boolean = false): void {
    const session = sessions.get(socket);
    if (!session) return;

    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    try {
      // Validate input parameters
      const validatedData = validateInput(buyUpgradeEventSchema, { upgradeId, quantity, isBulk });
      upgradeId = validatedData.upgradeId;
      quantity = validatedData.quantity;
      isBulk = validatedData.isBulk || false;

      // Purchase rate limiting with bulk consideration
      const rateCheck = rateLimiter.checkPurchaseRate(userId, isBulk, quantity);
      if (!rateCheck.allowed) {
        socket.emit("refused", rateCheck.reason || "Unknown reason");
        return;
      }

      // Validate upgrade exists
      const upgrade = getUpgradeById(upgradeId);
      if (!upgrade) {
        socket.emit("refused", "Invalid upgrade");
        console.warn(`[SECURITY] User ${userId} attempted to buy invalid upgrade: ${upgradeId}`);
        return;
      }

      // Find or create user upgrade entry
      let up = session.gameState.upgrades.find(u => u.id === upgradeId);
      if (!up) {
        up = { id: upgradeId, level: 0 };
        session.gameState.upgrades.push(up);
      }

      // Check maximum purchase limits if defined
      if (upgrade.max && up.level >= upgrade.max) {
        socket.emit("refused", "Maximum purchases reached for this upgrade");
        return;
      }

      // Validate current power amount before calculation
      const powerBeforePurchase = session.gameState.power;
      if (powerBeforePurchase < 0) {
        console.error(`[SECURITY] Negative power detected for user ${userId}: ${powerBeforePurchase}`);
        socket.emit("refused", "Invalid game state");
        return;
      }

      // Calculate affordable purchases with unified logic
      let totalCost = 0;
      let canBuy = 0;

      if (isBulk && quantity > 1) {
        // Use centralized bulk calculation
        const bulkResult = calculateBulkUpgradeCost(upgrade, up.level, quantity, powerBeforePurchase);
        totalCost = bulkResult.totalCost;
        canBuy = bulkResult.actualQuantity;
      } else {
        // Single purchase
        const cost = calculateUpgradeCost(upgrade, up.level);
        if (cost > 0 && Number.isFinite(cost) && powerBeforePurchase >= cost) {
          totalCost = cost;
          canBuy = 1;
        }
      }

      if (canBuy === 0) {
        socket.emit("refused", "Not enough power");
        return;
      }

      // Double-check affordability before transaction
      if (session.gameState.power < totalCost) {
        console.error(`[SECURITY] Power mismatch for user ${userId}. Has: ${session.gameState.power}, Needs: ${totalCost}`);
        socket.emit("refused", "Power verification failed");
        return;
      }

      // Execute transaction atomically
      session.gameState.power -= totalCost;
      up.level += canBuy;

      updateCurrentPrestigeStats(
        session.gameState, 0, 0, true, totalCost
      );

      // Validate post-transaction state
      if (session.gameState.power < 0) {
        console.error(`[SECURITY] Transaction resulted in negative power for user ${userId}`);
        // Rollback
        session.gameState.power += totalCost;
        up.level -= canBuy;
        socket.emit("refused", "Transaction failed");
        return;
      }

      // Recalculate stats and validate game state
      recalculateStats(session.gameState);

      // Check for achievements
      const newlyUnlocked = checkAchievements(session.gameState);
      console.log(`[ACHIEVEMENT] Found ${newlyUnlocked.length} newly unlocked achievements for user ${userId} (buy upgrade)`);
      
      for (const achievement of newlyUnlocked) {
        if (!session.gameState.unlocked_achievements.includes(achievement.id)) {
          session.gameState.unlocked_achievements.push(achievement.id);
          console.log(`[ACHIEVEMENT] Emitting achievementUnlocked event for user ${userId}: ${achievement.name} (buy upgrade)`);
          socket.emit("achievementUnlocked", achievement);
          console.log(`[ACHIEVEMENT] User ${userId} unlocked: ${achievement.name}`);
        } else {
          console.log(`[ACHIEVEMENT] Achievement ${achievement.name} already unlocked for user ${userId} (buy upgrade)`);
        }
      }
      
      if (!sanitizeGameState(session.gameState)) {
        console.error(`[SECURITY] Game state validation failed after purchase for user ${userId}`);
        socket.emit("refused", "Invalid game state after purchase");
        return;
      }

      // Log all purchases for debugging
      console.log(`[SERVER] Purchase by user ${userId}: ${canBuy}x upgrade ${upgradeId} for ${totalCost} power (bulk: ${isBulk}, requested: ${quantity})`);
      
      // Log significant purchases for monitoring
      if (totalCost > 1000000 || canBuy > 10) {
        console.log(`[AUDIT] Large purchase by user ${userId}: ${canBuy}x upgrade ${upgradeId} for ${totalCost} power (bulk: ${isBulk})`);
      }

      socket.emit("update", session.gameState);

    } catch (error) {
      console.error(`[PURCHASE] Validation error for user ${userId}:`, error);
      socket.emit("refused", "Invalid purchase data");
    }
  }
}