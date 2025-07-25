import type { DatabaseUpgrade, GameState } from "@clicker/game/types";
import { supabase } from "../lib/supabase";

export class GameService {
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
        lifetime_power: data.lifetime_power || data.total_power || 0
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
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Error creating new game state for ${userId}:`, insertError);
        throw insertError;
      }

      // Delete the old guest data
      console.log(`[MIGRATION] Deleting old guest data for ${guestId}`);
      await this.deleteGameState(guestId);
      console.log(`Successfully migrated game state from ${guestId} to ${userId}`);
      
    } catch (error) {
      console.error(`Failed to migrate game state from ${guestId} to ${userId}:`, error);
      throw error;
    }
  }

  static async smartMigrateGameState(guestId: string, userId: string): Promise<GameState | null> {
    try {
      const userState = await this.loadGameState(userId);
      const guestState = await this.loadGameState(guestId);

      if (!guestState) {
        console.log(`[MIGRATION] No guest data found for ${guestId}`);
        return userState;
      }

      if (!userState) {
        console.log(`[MIGRATION] No user data found, migrating guest data from ${guestId} to ${userId}`);
        await this.migrateGameState(guestId, userId);
        return await this.loadGameState(userId); // Reload to get the migrated state
      }

      const guestProgress = guestState.lifetime_power || guestState.total_power;
      const userProgress = userState.lifetime_power || userState.total_power;
      const shouldMigrateGuest = guestProgress > userProgress;
      
      if (shouldMigrateGuest) {
        console.log(`[MIGRATION] Guest has more progress (${guestProgress} vs ${userProgress}), migrating guest data`);

        await this.deleteGameState(userId);
        await this.migrateGameState(guestId, userId);
        return await this.loadGameState(userId); // Reload to get the migrated state
      } else {
        console.log(`[MIGRATION] User has more progress (${userProgress} vs ${guestProgress}), keeping user data`);

        await this.deleteGameState(guestId);
        return userState;
      }
    } catch (error) {
      console.error(`Failed to smart migrate game state from ${guestId} to ${userId}:`, error);
      return null; // Return null to force creation of new state if migration fails
    }
  }
}