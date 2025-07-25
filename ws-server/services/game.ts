import type { GameState } from '@/type/game';
import { supabase } from '../lib/supabase';

export class GameService {
  static async saveGameState(userId: string, gameState: GameState): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_states')
        .upsert({
          user_id: userId,
          ppc: gameState.ppc,
          pps: gameState.pps,
          power: gameState.power,
          total_power: gameState.total_power,
          upgrades: gameState.upgrades,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving game state:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save game state:', error);
      throw error;
    }
  }

  static async loadGameState(userId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No game state found for user:', userId);
          return null;
        }
        console.error('Error loading game state:', error);
        throw error;
      }

      return {
        ppc: data.ppc,
        pps: data.pps,
        power: data.power,
        total_power: data.total_power,
        upgrades: data.upgrades || []
      };
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  static async deleteGameState(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_states')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting game state:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete game state:', error);
      throw error;
    }
  }
}