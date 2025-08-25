import { createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const adminClient = await createAdminClient()
    const { data: { user }, error: authError } = await adminClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user profile already exists
    const { data: existingProfile, error: fetchError } = await adminClient
      .from("user_profiles")
      .select("id, username")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing profile:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingProfile) {
      return NextResponse.json({ 
        created: false, 
        message: "Profile already exists",
        profile: existingProfile 
      })
    }

    const safeUsername = `user${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

    // Create new user profile with default values
    const { data: newProfile, error: insertError } = await adminClient
      .from("user_profiles")
      .insert({
        id: user.id,
        username: safeUsername,
        display_name: user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`,
        bio: "",
        avatar_url: null
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user profile:", insertError)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    return NextResponse.json({ 
      created: true, 
      message: "Profile created successfully",
      profile: newProfile 
    })

  } catch (error) {
    console.error("Error in ensure-profile API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 