import { GameEngine } from "@/lib/game-engine"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ created: false, message: "No user authenticated" }, { status: 200 })
    }

    const created = await GameEngine.ensureUserProfile(user.id)
    revalidatePath("/")
    return NextResponse.json({ created, userId: user.id }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ created: false, error: String(error) }, { status: 500 })
  }
} 