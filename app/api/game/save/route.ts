import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { SaveGameRequestSchema } from '@/lib/validation/game-schemas'

// Create admin client with service role key for secure operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication using the regular client
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const validationResult = SaveGameRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid game data format',
        details: validationResult.error.message
      }, { status: 400 })
    }

    const { gameData } = validationResult.data

    const dataSize = JSON.stringify(gameData).length
    if (dataSize > 1024 * 1024) {
      return NextResponse.json({ error: 'Game data too large' }, { status: 413 })
    }

    // Use admin client to update the database securely
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('clicker_saves')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Database check error for user:', user.id)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
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