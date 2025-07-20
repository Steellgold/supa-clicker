import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { GameCryptoSecurity } from '@/lib/security/crypto-signature'
import { GAME_CONFIG } from '@/lib/config/game-config'

const userLastKeyRequest = new Map<string, number>()

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const GET = async (request: NextRequest) => {
  try {
    const now = Date.now()
    const origin = request.headers.get('origin')
    const allowedOrigins = GAME_CONFIG.SECURITY.ALLOWED_ORIGINS
    
    if (!origin || !(allowedOrigins as readonly string[]).includes(origin)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
    }

    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lastKeyRequest = userLastKeyRequest.get(user.id) || 0
    const timeSinceLastRequest = now - lastKeyRequest
    
    if (timeSinceLastRequest < 5000) { // 5 secondes minimum
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before requesting a new key.' 
      }, { status: 429 })
    }
    
    userLastKeyRequest.set(user.id, now)

    const { data: existingKey, error: selectError } = await supabaseAdmin
      .from('user_crypto_keys')
      .select('crypto_key, created_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Database error checking crypto key:', selectError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    let cryptoKey: string
    let isNewKey = false

    if (existingKey?.crypto_key) {
      cryptoKey = existingKey.crypto_key
      
      const keyAge = now - new Date(existingKey.created_at).getTime()
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      
      if (keyAge > thirtyDays) {
        cryptoKey = GameCryptoSecurity.generateUserSecret()
        isNewKey = true
        
        const { error: updateError } = await supabaseAdmin
          .from('user_crypto_keys')
          .update({
            crypto_key: cryptoKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Failed to update crypto key:', updateError)
          return NextResponse.json({ error: 'Failed to update crypto key' }, { status: 500 })
        }
      }
    } else {
      cryptoKey = GameCryptoSecurity.generateUserSecret()
      isNewKey = true

      const { error: insertError } = await supabaseAdmin
        .from('user_crypto_keys')
        .upsert({
          user_id: user.id,
          crypto_key: cryptoKey,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (insertError) {
        console.error('Failed to store crypto key:', insertError)
        return NextResponse.json({ error: 'Failed to generate crypto key' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      cryptoKey,
      isNewKey,
      expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
      message: isNewKey ? 'New crypto key generated' : 'Existing crypto key retrieved'
    })

  } catch (error) {
    console.error('Crypto key API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    const allowedOrigins = GAME_CONFIG.SECURITY.ALLOWED_ORIGINS
    
    if (!origin || !(allowedOrigins as readonly string[]).includes(origin)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
    }

    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newCryptoKey = GameCryptoSecurity.generateUserSecret()
    
    const { error: upsertError } = await supabaseAdmin
      .from('user_crypto_keys')
      .upsert({
        user_id: user.id,
        crypto_key: newCryptoKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Failed to regenerate crypto key:', upsertError)
      return NextResponse.json({ error: 'Failed to regenerate crypto key' }, { status: 500 })
    }

    return NextResponse.json({ 
      cryptoKey: newCryptoKey,
      message: 'New crypto key generated successfully'
    })

  } catch (error) {
    console.error('Crypto key regeneration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}