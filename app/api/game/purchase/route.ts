import { NextRequest } from "next/server"
import { GameEngine } from "@/lib/game-engine"
import { withGameSecurity, GameSecurityMiddleware, SecurityValidationResult, PayloadSchemas } from "@/lib/middleware/security"

async function purchaseHandler(request: NextRequest, validation: SecurityValidationResult) {
  try {
    const body = validation.action!.payload
    
    // Validate purchase payload
    const payloadValidation = PayloadSchemas.purchase.validate(body)
    if (!payloadValidation.isValid) {
      return GameSecurityMiddleware.createErrorResponse(payloadValidation.error!)
    }

    const { type, upgradeId, specialItemId, quantity } = body

    let result
    if (type === 'upgrade') {
      const purchaseQuantity = quantity && Number.isInteger(quantity) && quantity > 0 ? quantity : 1
      result = await GameEngine.purchaseUpgrade(validation.user.id, upgradeId, purchaseQuantity)
    } else {
      result = await GameEngine.purchaseSpecialItem(validation.user.id, specialItemId)
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