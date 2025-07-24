import { GameEngine } from "@/lib/game-engine"
import { GameSecurityMiddleware } from "@/lib/middleware/security"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return GameSecurityMiddleware.createErrorResponse("Unauthorized", 401)
    }

    await GameEngine.ensureUserProfile(user.id)
    const gameState = await GameEngine.loadUserGameState(user.id)

    return GameSecurityMiddleware.createSuccessResponse({ gameData: gameState })
  } catch (error) {
    console.error("Load processing error:", error)

    if (error instanceof Error && error.message.includes("not found")) {
      return GameSecurityMiddleware.createSuccessResponse({ gameData: null })
    }
    
    return GameSecurityMiddleware.createErrorResponse("Failed to load game data", 500)
  }
}