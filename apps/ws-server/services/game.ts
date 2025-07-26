import type { DatabaseUpgrade, GameState } from "@clicker/game/types";
import { supabase } from "../lib/supabase";

export class GameService {
  static async ensureUserProfile(userId: string): Promise<void> {
    try {
      // Check if user profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing profile:", fetchError);
        return;
      }

      if (existingProfile) {
        console.log(`User profile already exists for: ${userId}`);
        return;
      }

      const safeUsername = `user${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;

      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          username: safeUsername,
          display_name: `User ${userId.slice(0, 8)}`,
          bio: "",
          avatar_url: null
        });

      if (insertError) {
        console.error("Error creating user profile:", insertError);
        return;
      }

      console.log(`Created user profile for: ${userId}`);
    } catch (error) {
      console.error("Error ensuring user profile:", error);
    }
  }

  static async saveGameState(userId: string, gameState: GameState): Promise<void> {
    try {
      const { error } = await supabase
        .from("game_states")
        .upsert({
          user_id: userId,
          ppc: gameState.ppc,
          pps: gameState.pps,
          power: gameState.power,
          total_power: gameState.total_power,
          upgrades: gameState.upgrades,
          prestige_level: gameState.prestige_level,
          lifetime_power: gameState.lifetime_power,
          lifetime_clicks: gameState.lifetime_clicks || 0,
          unlocked_achievements: gameState.unlocked_achievements?.map(String) || [],
          prestige_stats: gameState.prestige_stats || [],
          current_prestige_start_time: gameState.current_prestige_start_time ? new Date(gameState.current_prestige_start_time).toISOString() : new Date().toISOString(),
          current_prestige_clicks: gameState.current_prestige_clicks || 0,
          current_prestige_upgrades_purchased: gameState.current_prestige_upgrades_purchased || 0,
          current_prestige_power_spent: gameState.current_prestige_power_spent || 0,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving game state:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to save game state:", error);
      throw error;
    }
  }

  static async loadGameState(userId: string): Promise<GameState | null> {
    try {
      const { data, error } = await supabase
        .from("game_states")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No game state found for user:", userId);
          return null;
        }
        console.error("Error loading game state:", error);
        throw error;
      }

      return {
        ppc: data.ppc,
        pps: data.pps,
        power: data.power,
        total_power: data.total_power,
        upgrades: data.upgrades as DatabaseUpgrade[] || [],
        prestige_level: data.prestige_level || 0,
        lifetime_power: data.lifetime_power || data.total_power || 0,
        lifetime_clicks: data.lifetime_clicks || 0,
        unlocked_achievements: data.unlocked_achievements?.map(Number) || [],
        prestige_stats: data.prestige_stats as any[] || [],
        current_prestige_start_time: data.current_prestige_start_time ? new Date(data.current_prestige_start_time).getTime() : Date.now(),
        current_prestige_clicks: data.current_prestige_clicks || 0,
        current_prestige_upgrades_purchased: data.current_prestige_upgrades_purchased || 0,
        current_prestige_power_spent: data.current_prestige_power_spent || 0,
      };
    } catch (error) {
      console.error("Failed to load game state:", error);
      return null;
    }
  }

  static async deleteGameState(userId: string): Promise<void> {
    try {
      console.log(`[DELETE] Attempting to delete game state for user: ${userId}`);
      const { error } = await supabase
        .from("game_states")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting game state:", error);
        throw error;
      }
      console.log(`[DELETE] Successfully deleted game state for user: ${userId}`);
    } catch (error) {
      console.error("Failed to delete game state:", error);
      throw error;
    }
  }

  static async migrateGameState(guestId: string, userId: string): Promise<void> {
    try {
      // Load the guest data first
      const guestData = await this.loadGameState(guestId);
      if (!guestData) {
        console.log(`No guest data found for ${guestId}, nothing to migrate`);
        return;
      }

      // Create new entry with the authenticated user ID and guest data
      const { error: insertError } = await supabase
        .from("game_states")
        .upsert({
          user_id: userId, // Use the authenticated user ID
          ppc: guestData.ppc,
          pps: guestData.pps,
          power: guestData.power,
          total_power: guestData.total_power,
          upgrades: guestData.upgrades,
          prestige_level: guestData.prestige_level,
          lifetime_power: guestData.lifetime_power,
          unlocked_achievements: guestData.unlocked_achievements?.map(String) || [],
          prestige_stats: guestData.prestige_stats || [],
          current_prestige_start_time: guestData.current_prestige_start_time ? new Date(guestData.current_prestige_start_time).toISOString() : new Date().toISOString(),
          current_prestige_clicks: guestData.current_prestige_clicks || 0,
          current_prestige_upgrades_purchased: guestData.current_prestige_upgrades_purchased || 0,
          current_prestige_power_spent: guestData.current_prestige_power_spent || 0,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error migrating game state:", insertError);
        throw insertError;
      }

      // Delete the guest data after successful migration
      await this.deleteGameState(guestId);
      console.log(`Successfully migrated game state from ${guestId} to ${userId}`);
    } catch (error) {
      console.error("Failed to migrate game state:", error);
      throw error;
    }
  }

  static async smartMigrateGameState(guestId: string, userId: string): Promise<GameState | null> {
    try {
      // Check if authenticated user already has data
      const existingUserData = await this.loadGameState(userId);
      
      if (existingUserData) {
        console.log(`User ${userId} already has game data, skipping migration`);
        return existingUserData;
      }

      // Check if guest has data to migrate
      const guestData = await this.loadGameState(guestId);
      
      if (!guestData) {
        console.log(`No guest data found for ${guestId}, nothing to migrate`);
        return null;
      }

      // Perform migration
      await this.migrateGameState(guestId, userId);
      
      // Return the migrated data
      return await this.loadGameState(userId);
    } catch (error) {
      console.error("Failed to smart migrate game state:", error);
      return null;
    }
  }
}