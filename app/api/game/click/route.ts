import { NextRequest } from "next/server"
import { GameEngine } from "@/lib/game-engine"
import { withGameSecurity, GameSecurityMiddleware, SecurityValidationResult } from "@/lib/middleware/security"

async function clickHandler(request: NextRequest, validation: SecurityValidationResult) {
  try {
    // Process click through secure game engine
    const result = await GameEngine.processClick(validation.user.id)

    return GameSecurityMiddleware.createSuccessResponse({
      gained: result.gained,
      gameState: result.newState,
      effects: result.effects
    })
  } catch (error) {
    console.error("Click processing error:", error)
    return GameSecurityMiddleware.createErrorResponse(
      "Failed to process click",
      500
    )
  }
}

// Export the secured endpoint
export const POST = withGameSecurity(clickHandler)