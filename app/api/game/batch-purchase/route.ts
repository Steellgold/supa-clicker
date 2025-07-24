import { ServerClientDecryption } from "@/lib/crypto/server-client-decryption";
import { GameEngine } from "@/lib/game-engine";
import type { SecurityValidationResult } from "@/lib/middleware/security";
import { GameSecurityMiddleware, withGameSecurity } from "@/lib/middleware/security";
import { EncryptedBatchPurchaseRequestSchema } from "@/lib/validation/game-schemas";
import type { GameState } from "@/type/game";
import { NextRequest, NextResponse } from "next/server";

// Define the type for a purchase request
interface PurchaseRequest {
  type: "upgrade" | "specialItem";
  upgradeId?: number;
  specialItemId?: number;
  quantity?: number;
}

/**
 * Batch purchase handler: receives an encrypted gameState and a list of purchases, applies them atomically, and returns the updated state and purchase results.
 */
async function batchPurchaseHandler(request: NextRequest, validation: SecurityValidationResult): Promise<NextResponse> {
  try {
    const userId = validation.user?.id;
    let gameState: GameState | undefined;
    let purchases: PurchaseRequest[] = [];
    const body = validation.action?.payload || (await request.json());

    // Only support encrypted payloads (no legacy mode)
    if (body.encryptedPayload && body.type === "batch-purchase" && body.clientEncryption) {
      // Validate encrypted batch schema
      const parseResult = EncryptedBatchPurchaseRequestSchema.safeParse(body);
      if (!parseResult.success) {
        return GameSecurityMiddleware.createErrorResponse("Invalid encrypted batch format", 400);
      }
      if (!userId) {
        return GameSecurityMiddleware.createErrorResponse("Missing user for decryption", 400);
      }
      // Decrypt
      const decrypted = ServerClientDecryption.decryptClientData(userId, body.encryptedPayload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gameState = (decrypted as any).gameState;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      purchases = (decrypted as any).purchases;
    } else {
      // Reject unencrypted/legacy requests
      return GameSecurityMiddleware.createErrorResponse("Unencrypted batch purchase is not allowed", 400);
    }

    if (!userId || !gameState || !Array.isArray(purchases)) {
      return GameSecurityMiddleware.createErrorResponse("Missing user, gameState, or purchases array", 400);
    }

    // 1. Save the provided game state for the user (atomicity handled in GameEngine)
    await GameEngine.saveUserGameState(userId, gameState);

    // 2. Reload the up-to-date state from DB
    let currentState = await GameEngine.loadUserGameState(userId, false);

    // 3. Apply each purchase in order, collecting results
    const results = [];
    for (const purchase of purchases) {
      let result;
      if (purchase.type === "upgrade") {
        result = await GameEngine.purchaseUpgrade(userId, purchase.upgradeId!, purchase.quantity || 1, currentState);
      } else if (purchase.type === "specialItem") {
        result = await GameEngine.purchaseSpecialItem(userId, purchase.specialItemId!);
      } else {
        result = { success: false, error: "Invalid purchase type" };
      }
      // If successful, update currentState to reflect the new state
      if (result.success && result.newState) {
        currentState = result.newState;
      }
      results.push({ ...purchase, ...result });
    }

    // 4. Save the final state after all purchases (required for persistence)
    await GameEngine.saveUserGameState(userId, currentState);

    // 5. Return the final state and the result of each purchase
    return GameSecurityMiddleware.createSuccessResponse({
      gameState: currentState,
      purchaseResults: results
    });
  } catch (error) {
    console.error("Batch purchase error:", error);
    return GameSecurityMiddleware.createErrorResponse("Failed to process batch purchase", 500);
  }
}

export const POST = withGameSecurity(batchPurchaseHandler); 