import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { GameStateSchema } from '@/lib/validation/game-schemas'

export const GET = async() => {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use regular client for read operations (no need for admin privileges)
    const { data, error } = await supabase
      .from('clicker_saves')
      .select('game_data')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Load operation failed for user:', user.id)
      return NextResponse.json({ error: 'Failed to load game data' }, { status: 500 })
    }

    let validatedGameData = null;
    if (data?.game_data) {
      const validationResult = GameStateSchema.safeParse(data.game_data);
      if (validationResult.success) {
        validatedGameData = validationResult.data;
      } else {
        console.error('Invalid game data in database for user:', user.id);
        validatedGameData = null;
      }
    }

    return NextResponse.json({ 
      gameData: validatedGameData
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}