import { GameEngine } from "@/lib/game-engine"
import { GameSecurityMiddleware, PayloadSchemas, SecurityValidationResult, withGameSecurity } from "@/lib/middleware/security"
import { GameState } from "@/type/game"
import { NextRequest } from "next/server"

async function purchaseHandler(request: NextRequest, validation: SecurityValidationResult) {
  try {
    const body = validation.action!.payload
    
    // Validate purchase payload
    const payloadValidation = PayloadSchemas.purchase.validate(body)
    if (!payloadValidation.isValid) {
      return GameSecurityMiddleware.createErrorResponse(payloadValidation.error!)
    }

    // Use purchaseType instead of type in the payload
    const { purchaseType, upgradeId, specialItemId, quantity, currentGameState } = body;
    const purchaseQuantity = quantity && Number.isInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;
    const upgradeIdNum = typeof upgradeId === "number" ? upgradeId : Number(upgradeId);
    const specialItemIdNum = typeof specialItemId === "number" ? specialItemId : Number(specialItemId);
    
    // Secure cast of gameState - trust the validation middleware
    const clientGameState = currentGameState && typeof currentGameState === "object" && !Array.isArray(currentGameState) 
      ? currentGameState as GameState  // Safe cast after validation
      : undefined;

    let result;

    switch (purchaseType) {
      case "upgrade":
        result = await GameEngine.purchaseUpgrade(validation.user!.id, upgradeIdNum, purchaseQuantity, clientGameState);
        break;
      case "specialItem":
        result = await GameEngine.purchaseSpecialItem(validation.user!.id, specialItemIdNum);
        break;
      default:
        return GameSecurityMiddleware.createErrorResponse("Invalid purchase type", 400)
    }

    if (!result.success) {
      return GameSecurityMiddleware.createErrorResponse(
        result.error || "Purchase failed",
        400
      )
    }

    return GameSecurityMiddleware.createSuccessResponse({
      purchased: result.purchased,
      gameState: result.newState,
      cost: result.cost
    })
  } catch (error) {
    console.error("Purchase processing error:", error)
    return GameSecurityMiddleware.createErrorResponse(
      "Failed to process purchase",
      500
    )
  }
}

// Export the secured endpoint
export const POST = withGameSecurity(purchaseHandler)