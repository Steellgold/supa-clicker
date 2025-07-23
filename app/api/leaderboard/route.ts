import { createClient } from "@/lib/supabase/server";
import console from "console";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "total_power";
  const limit = Number(searchParams.get("limit") || 50);

  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_type: type,
    p_limit: limit,
  }).select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data });
}