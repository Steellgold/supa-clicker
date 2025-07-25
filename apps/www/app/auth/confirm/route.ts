import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/"

  console.log("Auth confirm - params:", { token_hash: !!token_hash, type })

  if (!token_hash || !type) {
    console.error("Missing token_hash or type parameters")
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_parameters`)
  }

  try {
    const supabase = await createClient()
    
    console.log("Verifying OTP with token_hash and type:", type)
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email"
    })
    
    if (error) {
      console.error("OTP verification error:", error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=otp_verification_failed`)
    }

    console.log("Auth successful, redirecting to:", next)
    
    const forwardedHost = request.headers.get("x-forwarded-host")
    const isLocalEnv = process.env.NODE_ENV === "development"
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
  } catch (error) {
    console.error("Auth confirm error:", error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
  }
}