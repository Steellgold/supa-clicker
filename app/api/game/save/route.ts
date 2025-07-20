import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { SaveGameRequestSchema } from "@/lib/validation/game-schemas"
import { validateSignedGameRequest } from "@/lib/security/crypto-signature"
import { GAME_CONFIG } from "@/lib/config/game-config"

const userLastSaveTime = new Map<string, number>()

// Create admin client with service role key for secure operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const now = Date.now()
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    const allowedOrigins = GAME_CONFIG.SECURITY.ALLOWED_ORIGINS
    
    if (!origin || !(allowedOrigins as readonly string[]).includes(origin)) {
      return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 })
    }
    
    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return NextResponse.json({ error: "Unauthorized referer" }, { status: 403 })
    }

    // Verify user authentication using the regular client
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameSignatureHeader = request.headers.get("x-game-signature")
    if (!gameSignatureHeader) {
      return NextResponse.json({ error: "Missing game signature" }, { status: 403 })
    }

    let signedRequest
    try {
      signedRequest = JSON.parse(gameSignatureHeader)
    } catch (error) {
      console.error("Invalid signature format:", error)
      return NextResponse.json({ error: "Invalid signature format" }, { status: 403 })
    }

    const { data: userKey, error: keyError } = await supabaseAdmin
      .from("user_crypto_keys")
      .select("public_key")
      .eq("user_id", user.id)
      .single()

    if (keyError || !userKey?.public_key) {
      return NextResponse.json({ 
        error: "Crypto key not found. Please refresh your security key." 
      }, { status: 403 })
    }

    // Validate the signed request
    const signatureValidation = validateSignedGameRequest(signedRequest, userKey.public_key)
    if (!signatureValidation.isValid) {
      console.warn(`Invalid signature from user ${user.id}: ${signatureValidation.reason}`)
      return NextResponse.json({ 
        error: `Security validation failed: ${signatureValidation.reason}` 
      }, { status: 403 })
    }

    if (signatureValidation.data?.type !== "save") {
      return NextResponse.json({ error: "Invalid action type for save endpoint" }, { status: 400 })
    }

    const lastSaveTime = userLastSaveTime.get(user.id) || 0
    const timeSinceLastSave = now - lastSaveTime
    
    if (timeSinceLastSave < GAME_CONFIG.SECURITY.SAVE_RATE_LIMIT) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please wait before saving again." 
      }, { status: 429 })
    }
    
    userLastSaveTime.set(user.id, now)

    const gameData = signatureValidation.data.payload

    const validationResult = SaveGameRequestSchema.safeParse({ gameData })
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Invalid game data format",
        details: validationResult.error.message
      }, { status: 400 })
    }

    const validatedGameData = validationResult.data.gameData

    const dataSize = JSON.stringify(validatedGameData).length
    if (dataSize > GAME_CONFIG.SECURITY.MAX_DATA_SIZE) {
      return NextResponse.json({ error: "Game data too large" }, { status: 413 })
    }

    // Get previous save for progression validation
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("clicker_saves")
      .select("id, current_power, total_power, clicks_per_second, updated_at")
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError) {
      console.error("Database check error for user:", user.id)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Skip anti-cheat for now to focus on basic functionality

    // Convert game data to individual columns
    const saveData = {
      current_power: validatedGameData.currentPower,
      total_power: validatedGameData.totalPower,
      total_clicks: validatedGameData.totalClicks,
      clicks_per_second: validatedGameData.rps,
      prestige_level: validatedGameData.prestigeLevel,
      upgrades: validatedGameData.upgrades,
      special_items: validatedGameData.specialItems,
      achievements: validatedGameData.unlockedAchievements,
      last_save_time: validatedGameData.lastSaveTime,
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      result = await supabaseAdmin
        .from("clicker_saves")
        .update(saveData)
        .eq("user_id", user.id)
    } else {
      result = await supabaseAdmin
        .from("clicker_saves")
        .insert({
          user_id: user.id,
          ...saveData,
          created_at: new Date().toISOString()
        })
    }

    if (result.error) {
      console.error("Save operation failed for user:", user.id)
      return NextResponse.json({ error: "Failed to save game data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}