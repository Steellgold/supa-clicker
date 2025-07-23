import { GameEngine } from "@/lib/game-engine"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user profile exists (this will create it if it doesn"t exist)
    await GameEngine.ensureUserProfile(user.id)

    // Load initial game state to ensure everything is set up
    const gameState = await GameEngine.loadUserGameState(user.id)

    return NextResponse.json({ 
      success: true, 
      profile: {
        id: user.id,
        email: user.email,
        username: `user_${user.id.substring(0, 8)}`,
        display_name: `Player ${user.id.substring(0, 8)}`
      },
      gameState
    })
  } catch (error) {
    console.error("Profile initialization error:", error)
    return NextResponse.json({ 
      error: "Failed to initialize profile",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError && profileError.code !== "PGRST116") {
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    if (!profile) {
      return NextResponse.json({ 
        exists: false,
        message: "Profile not found. Please initialize."
      })
    }

    return NextResponse.json({ 
      exists: true,
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        prestige_level: profile.prestige_level,
        achievements_count: profile.achievements_count,
        created_at: profile.created_at
      }
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}