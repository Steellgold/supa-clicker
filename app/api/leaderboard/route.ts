import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'total_power'; // 'total_clicks', 'total_power', 'prestige_level'
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    // Validate leaderboard type
    const validTypes = ['total_clicks', 'total_power', 'prestige_level'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid leaderboard type' },
        { status: 400 }
      );
    }

    // Get leaderboard data using the SQL function
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .rpc('get_leaderboard', {
        order_by: type,
        limit_count: limit
      });

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    let userPosition = null;
    let userData = null;

    // If userId is provided, get user's position and data
    if (userId) {
      const { data: userRankData, error: userRankError } = await supabase
        .rpc('get_user_rank', {
          target_user_id: userId,
          order_by: type
        });

      if (!userRankError && userRankData && userRankData.length > 0) {
        userPosition = Number(userRankData[0].rank_position);
        userData = userRankData[0].user_data;
      }
    }

    return NextResponse.json({
      leaderboard: leaderboardData || [],
      userPosition,
      userData,
      type
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}