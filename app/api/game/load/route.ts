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

    // Try to load existing save data
    const { data, error } = await supabase
      .from('clicker_saves')
      .select('current_power, total_power, total_clicks, clicks_per_second, prestige_level, upgrades, special_items, achievements, last_save_time')
      .eq('user_id', user.id)
      .maybeSingle()

    let validatedGameData = null;
    
    if (error) {
      console.error('Load operation failed for user:', user.id, error)
      // Don't return error for table/column not found - just return null data
      if (error.code === '42P01' || error.message?.includes('column') || error.message?.includes('table')) {
        console.log('Table or columns not found, returning null game data for user:', user.id)
        return NextResponse.json({ gameData: null })
      }
      return NextResponse.json({ error: 'Failed to load game data' }, { status: 500 })
    }

    if (data) {
      try {
        // Reconstruct game state from database columns
        const gameState = {
          currentPower: Number(data.current_power) || 0,
          totalPower: Number(data.total_power) || 0,
          totalClicks: Number(data.total_clicks) || 0,
          clickPower: 1, // Default click power
          rps: Number(data.clicks_per_second) || 0,
          prestigeLevel: data.prestige_level || 0,
          upgrades: data.upgrades || {},
          specialItems: data.special_items || {},
          unlockedAchievements: Array.isArray(data.achievements) ? data.achievements : [],
          lastSaveTime: Number(data.last_save_time) || Date.now(),
          resourcesPerSecond: Number(data.clicks_per_second) || 0,
          currentResources: Number(data.current_power) || 0,
          comboCount: 0,
          lastClickTime: Number(data.last_save_time) || Date.now(),
          timeBoostActive: false,
          timeBoostEndTime: 0,
          timeBoostMultiplier: 1
        };

        const validationResult = GameStateSchema.safeParse(gameState);
        if (validationResult.success) {
          validatedGameData = validationResult.data;
        } else {
          console.error('Invalid game data for user:', user.id, validationResult.error);
          // Return default game state if validation fails
          validatedGameData = null;
        }
      } catch (parseError) {
        console.error('Error parsing game data for user:', user.id, parseError);
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