import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { SaveGameRequestSchema } from '@/lib/validation/game-schemas'
import { GAME_CONFIG } from '@/lib/config/game-config'

const userLastSaveTime = new Map<string, number>()

// Create admin client with service role key for secure operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const now = Date.now()
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const allowedOrigins = GAME_CONFIG.SECURITY.ALLOWED_ORIGINS
    
    if (!origin || !(allowedOrigins as readonly string[]).includes(origin)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
    }
    
    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return NextResponse.json({ error: 'Unauthorized referer' }, { status: 403 })
    }

    const csrfToken = request.headers.get('x-csrf-token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 })
    }

    // Verify user authentication using the regular client
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // CSRF token validation
    try {
      const tokenData = Buffer.from(csrfToken, 'base64').toString('utf8')
      const [tokenUserId, timestamp] = tokenData.split('|')
      
      if (tokenUserId !== user.id) {
        console.error('CSRF token user mismatch:', { tokenUserId, userIdFromAuth: user.id })
        return NextResponse.json({ error: 'Invalid CSRF token - user mismatch' }, { status: 403 })
      }
      
      // Expires after 1 hour
      const tokenAge = now - parseInt(timestamp)
      if (tokenAge > GAME_CONFIG.SECURITY.CSRF_TOKEN_EXPIRY) {
        console.error('CSRF token expired:', { tokenAge, timestamp, now })
        return NextResponse.json({ error: 'CSRF token expired' }, { status: 403 })
      }
    } catch (error) {
      console.error('CSRF token parsing error:', error)
      return NextResponse.json({ error: 'Invalid CSRF token format' }, { status: 403 })
    }

    const lastSaveTime = userLastSaveTime.get(user.id) || 0
    const timeSinceLastSave = now - lastSaveTime
    
    if (timeSinceLastSave < GAME_CONFIG.SECURITY.SAVE_RATE_LIMIT) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before saving again.' 
      }, { status: 429 })
    }
    
    userLastSaveTime.set(user.id, now)

    // Check if request has a body
    const contentLength = request.headers.get('content-length')
    if (!contentLength || contentLength === '0') {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON format in request body' 
      }, { status: 400 })
    }
    
    const validationResult = SaveGameRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid game data format',
        details: validationResult.error.message
      }, { status: 400 })
    }

    const { gameData } = validationResult.data

    const dataSize = JSON.stringify(gameData).length
    if (dataSize > GAME_CONFIG.SECURITY.MAX_DATA_SIZE) {
      return NextResponse.json({ error: 'Game data too large' }, { status: 413 })
    }

    // Get previous save for progression validation
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('clicker_saves')
      .select('id, game_data, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Database check error for user:', user.id)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Anti-cheat: Validate game progression
    if (existing?.game_data) {
      const prev = existing.game_data
      const timeSinceLastUpdate = now - new Date(existing.updated_at).getTime()
      
      // Allow reasonable time gaps for offline progress
      if (timeSinceLastUpdate < GAME_CONFIG.SECURITY.MAX_OFFLINE_PROGRESS) {
        // Calculate maximum possible power gain from RPS
        const maxPowerFromRPS = Math.floor(timeSinceLastUpdate / 1000) * prev.rps
        const actualPowerGain = gameData.currentPower - prev.currentPower
        
        // Allow some tolerance for clicks and bonuses
        const maxReasonableGain = maxPowerFromRPS * GAME_CONFIG.SECURITY.ANTI_CHEAT.TOLERANCE_MULTIPLIER + prev.clickPower * GAME_CONFIG.SECURITY.ANTI_CHEAT.MAX_CLICKS_TOLERANCE
        
        if (actualPowerGain > maxReasonableGain && actualPowerGain > GAME_CONFIG.SECURITY.ANTI_CHEAT.MIN_SUSPICIOUS_GAIN) {
          console.warn(`Suspicious power gain for user ${user.id}: expected max ${maxReasonableGain}, got ${actualPowerGain} in ${timeSinceLastUpdate}ms`)
          return NextResponse.json({ 
            error: 'Invalid game progression detected. Progress seems too fast.' 
          }, { status: 400 })
        }

        // Check for impossible stat jumps
        if (gameData.rps > prev.rps * GAME_CONFIG.SECURITY.ANTI_CHEAT.RPS_INCREASE_THRESHOLD && timeSinceLastUpdate < GAME_CONFIG.SECURITY.ANTI_CHEAT.RPS_INCREASE_TIME_WINDOW) {
          console.warn(`Suspicious RPS increase for user ${user.id}: ${prev.rps} -> ${gameData.rps} in ${timeSinceLastUpdate}ms`)
          return NextResponse.json({ 
            error: 'Suspicious activity detected. RPS increase too rapid.' 
          }, { status: 400 })
        }

        // Check for impossible click power jumps  
        if (gameData.clickPower > prev.clickPower * GAME_CONFIG.SECURITY.ANTI_CHEAT.CLICK_POWER_THRESHOLD && timeSinceLastUpdate < GAME_CONFIG.SECURITY.ANTI_CHEAT.CLICK_POWER_TIME_WINDOW) {
          console.warn(`Suspicious click power for user ${user.id}: ${prev.clickPower} -> ${gameData.clickPower}`)
          return NextResponse.json({ 
            error: 'Suspicious activity detected. Click power increase too rapid.' 
          }, { status: 400 })
        }
      }
    }

    let result
    if (existing) {
      result = await supabaseAdmin
        .from('clicker_saves')
        .update({
          game_data: gameData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    } else {
      result = await supabaseAdmin
        .from('clicker_saves')
        .insert({
          user_id: user.id,
          game_data: gameData,
          updated_at: new Date().toISOString()
        })
    }

    if (result.error) {
      console.error('Save operation failed for user:', user.id)
      return NextResponse.json({ error: 'Failed to save game data' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}