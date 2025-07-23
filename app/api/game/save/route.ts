import { GameEngine } from "@/lib/game-engine"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { SaveGameRequestSchema } from "@/lib/validation/game-schemas"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { payload } = body

    const validationResult = SaveGameRequestSchema.safeParse({ gameData: payload })
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.issues)
      return NextResponse.json({ 
        error: "Invalid game data format",
        details: validationResult.error.issues
      }, { status: 400 })
    }

    const validatedGameData = validationResult.data.gameData

    // Check data size
    const dataSize = JSON.stringify(validatedGameData).length
    if (dataSize > 1024 * 1024) { // 1MB limit
      return NextResponse.json({ error: "Game data too large" }, { status: 413 })
    }

    // Save using GameEngine (handles all validation and security)
    await GameEngine.saveUserGameState(user.id, validatedGameData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}