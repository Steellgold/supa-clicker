import { createAdminClient } from "@/lib/supabase/client"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const adminClient = createAdminClient()

    const { data, error } = await adminClient.rpc("get_user_profile_by_username", {
      p_username: username,
    })

    return NextResponse.json({
      username,
      data,
      error,
      hasData: !!data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
