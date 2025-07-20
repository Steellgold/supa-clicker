import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback - params:', { code: !!code, token_hash: !!token_hash, type })

  try {
    const supabase = await createClient()
    
    if (token_hash && type) {
      console.log('Processing PKCE flow with token_hash')
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        console.error('PKCE verification error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=pkce_verification_failed`)
      }
    } else if (code) {
      console.log('Processing implicit flow with code')
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=code_exchange_failed`)
      }
    }
    else {
      console.error('No valid auth parameters found')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_parameters`)
    }

    console.log('Auth successful, redirecting to:', next)

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
  }
}
