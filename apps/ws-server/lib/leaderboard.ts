import { supabase } from "./supabase";
import type { LeaderboardEntry, LeaderboardType } from "@clicker/game/types";

export class LeaderboardService {
  static async getLeaderboard(type: LeaderboardType = "total_power", limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const { data: gameStates, error: gameStatesError } = await supabase
        .from('game_states')
        .select(`
          user_id,
          total_power,
          lifetime_clicks,
          prestige_level,
          unlocked_achievements,
          pps,
          updated_at
        `)
        .not('user_id', 'like', '%guest%')
        .not('user_id', 'like', '%anonymous%')
        .order(type === 'total_power' ? 'total_power' : 
               type === 'total_clicks' ? 'lifetime_clicks' : 
               'prestige_level', { ascending: false })
        .limit(limit * 2);

      if (gameStatesError) {
        console.error('[LEADERBOARD] Error fetching game states:', gameStatesError);
        throw gameStatesError;
      }

      if (!gameStates || gameStates.length === 0) {
        return [];
      }

      const userIds = gameStates.map(gs => gs.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, display_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('[LEADERBOARD] Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      const leaderboard: LeaderboardEntry[] = gameStates
        .map((gameState) => {
          const profile = profilesMap.get(gameState.user_id);
          const username = profile?.username;
          const displayName = profile?.display_name;
          
          if (!username || username === 'Unknown' || username.trim() === '') {
            return null;
          }

          return {
            user_id: gameState.user_id,
            username: username,
            display_name: displayName || username,
            total_clicks: gameState.lifetime_clicks || 0,
            total_power: gameState.total_power || 0,
            prestige_level: gameState.prestige_level || 0,
            achievements_count: gameState.unlocked_achievements?.length || 0,
            clicks_per_second: gameState.pps || 0,
            updated_at: gameState.updated_at || new Date().toISOString(),
          } as LeaderboardEntry;
        })
        .filter((entry): entry is LeaderboardEntry => entry !== null)
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      console.error('[LEADERBOARD] Error in getLeaderboard:', error);
      throw error;
    }
  }

  static async getUserPosition(userId: string, type: LeaderboardType = "total_power"): Promise<{ position: number; userData: LeaderboardEntry | null }> {
    try {
      if (userId.includes('guest') || userId.includes('anonymous')) {
        return { position: 0, userData: null };
      }

      const { data: gameStates, error: gameStatesError } = await supabase
        .from('game_states')
        .select(`
          user_id,
          total_power,
          lifetime_clicks,
          prestige_level,
          unlocked_achievements,
          pps,
          updated_at
        `)
        .not('user_id', 'like', '%guest%')
        .not('user_id', 'like', '%anonymous%')
        .order(type === 'total_power' ? 'total_power' : 
               type === 'total_clicks' ? 'lifetime_clicks' : 
               'prestige_level', { ascending: false });

      if (gameStatesError) {
        console.error('[LEADERBOARD] Error fetching game states for position:', gameStatesError);
        throw gameStatesError;
      }

      if (!gameStates || gameStates.length === 0) {
        return { position: 0, userData: null };
      }

      const userIds = gameStates.map(gs => gs.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, display_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('[LEADERBOARD] Error fetching user profiles for position:', profilesError);
        throw profilesError;
      }

      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      let validPosition = 0;
      let userData: LeaderboardEntry | null = null;

      for (const gameState of gameStates) {
        const profile = profilesMap.get(gameState.user_id);
        const username = profile?.username;
        
        if (!username || username === 'Unknown' || username.trim() === '') {
          continue;
        }

        validPosition++;

        if (gameState.user_id === userId) {
          userData = {
            user_id: gameState.user_id,
            username: username,
            display_name: profile?.display_name || username,
            total_clicks: gameState.lifetime_clicks || 0,
            total_power: gameState.total_power || 0,
            prestige_level: gameState.prestige_level || 0,
            achievements_count: gameState.unlocked_achievements?.length || 0,
            clicks_per_second: gameState.pps || 0,
            updated_at: gameState.updated_at || new Date().toISOString(),
          };
          break;
        }
      }

      return {
        position: userData ? validPosition : 0,
        userData
      };
    } catch (error) {
      console.error('[LEADERBOARD] Error in getUserPosition:', error);
      throw error;
    }
  }

  static async updateUserStats(userId: string, gameState: any): Promise<void> {
    try {
      if (userId.includes('guest') || userId.includes('anonymous')) {
        console.log('[LEADERBOARD] Skipping leaderboard update for guest user:', userId);
        return;
      }

      console.log('[LEADERBOARD] User stats updated for leaderboard:', userId);
    } catch (error) {
      console.error('[LEADERBOARD] Error updating user stats:', error);
      throw error;
    }
  }

  static isUserEligible(userId: string): boolean {
    return !userId.includes('guest') && !userId.includes('anonymous');
  }

  static async hasValidProfile(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return false;
      }

      const username = profile.username;
      return Boolean(username && username !== 'Unknown' && username.trim() !== '');
    } catch (error) {
      console.error('[LEADERBOARD] Error checking user profile validity:', error);
      return false;
    }
  }
} 