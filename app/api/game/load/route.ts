import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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
      console.error('Error loading game data:', error)
      return NextResponse.json({ error: 'Failed to load game data' }, { status: 500 })
    }

    return NextResponse.json({ 
      gameData: data?.game_data || null 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}