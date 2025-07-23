export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      game_progression: {
        Row: {
          achievements_unlocked_session: number | null
          active_boosts: Json | null
          chat_messages_sent: number | null
          click_power: number | null
          combo_active: boolean | null
          combo_count: number | null
          created_at: string | null
          current_power: number | null
          duck_streak_days: number | null
          duck_types_collected: number | null
          ducks_collected: number | null
          first_to_unlock_upgrade: boolean | null
          golden_duck_streak: number | null
          golden_ducks_found: number | null
          id: string
          last_click_time: string | null
          last_save_time: string | null
          leaderboard_rank: number | null
          new_upgrade_types_unlocked: number | null
          power_per_second: number | null
          prestige_level: number | null
          prestige_points: number | null
          resets_session: number | null
          resources_session: number | null
          resources_spent_on_upgrades: number | null
          secret_achievements_found: number | null
          total_clicks: number | null
          total_duck_types: number | null
          total_power: number | null
          total_prestige_points: number | null
          total_prestige_power: number | null
          total_prestiges: number | null
          total_resets: number | null
          total_upgrades_bought: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements_unlocked_session?: number | null
          active_boosts?: Json | null
          chat_messages_sent?: number | null
          click_power?: number | null
          combo_active?: boolean | null
          combo_count?: number | null
          created_at?: string | null
          current_power?: number | null
          duck_streak_days?: number | null
          duck_types_collected?: number | null
          ducks_collected?: number | null
          first_to_unlock_upgrade?: boolean | null
          golden_duck_streak?: number | null
          golden_ducks_found?: number | null
          id?: string
          last_click_time?: string | null
          last_save_time?: string | null
          leaderboard_rank?: number | null
          new_upgrade_types_unlocked?: number | null
          power_per_second?: number | null
          prestige_level?: number | null
          prestige_points?: number | null
          resets_session?: number | null
          resources_session?: number | null
          resources_spent_on_upgrades?: number | null
          secret_achievements_found?: number | null
          total_clicks?: number | null
          total_duck_types?: number | null
          total_power?: number | null
          total_prestige_points?: number | null
          total_prestige_power?: number | null
          total_prestiges?: number | null
          total_resets?: number | null
          total_upgrades_bought?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements_unlocked_session?: number | null
          active_boosts?: Json | null
          chat_messages_sent?: number | null
          click_power?: number | null
          combo_active?: boolean | null
          combo_count?: number | null
          created_at?: string | null
          current_power?: number | null
          duck_streak_days?: number | null
          duck_types_collected?: number | null
          ducks_collected?: number | null
          first_to_unlock_upgrade?: boolean | null
          golden_duck_streak?: number | null
          golden_ducks_found?: number | null
          id?: string
          last_click_time?: string | null
          last_save_time?: string | null
          leaderboard_rank?: number | null
          new_upgrade_types_unlocked?: number | null
          power_per_second?: number | null
          prestige_level?: number | null
          prestige_points?: number | null
          resets_session?: number | null
          resources_session?: number | null
          resources_spent_on_upgrades?: number | null
          secret_achievements_found?: number | null
          total_clicks?: number | null
          total_duck_types?: number | null
          total_power?: number | null
          total_prestige_points?: number | null
          total_prestige_power?: number | null
          total_prestiges?: number | null
          total_resets?: number | null
          total_upgrades_bought?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          achievements_count: number | null
          id: string
          last_updated: string | null
          playtime_seconds: number | null
          prestige_level: number | null
          season: string | null
          total_clicks: number | null
          total_power: number | null
          user_id: string
        }
        Insert: {
          achievements_count?: number | null
          id?: string
          last_updated?: string | null
          playtime_seconds?: number | null
          prestige_level?: number | null
          season?: string | null
          total_clicks?: number | null
          total_power?: number | null
          user_id: string
        }
        Update: {
          achievements_count?: number | null
          id?: string
          last_updated?: string | null
          playtime_seconds?: number | null
          prestige_level?: number | null
          season?: string | null
          total_clicks?: number | null
          total_power?: number | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      prestige_stats: {
        Row: {
          achievements: Json
          duration_seconds: number
          end_time: string
          id: string
          pps: number
          prestige_level: number
          special_items: Json
          start_time: string
          total_clicks: number
          total_power: number
          total_ppc: number | null
          total_pps: number | null
          upgrades: Json
          upgrades_breakdown: Json | null
          user_id: string
        }
        Insert: {
          achievements: Json
          duration_seconds: number
          end_time: string
          id?: string
          pps: number
          prestige_level: number
          special_items: Json
          start_time: string
          total_clicks: number
          total_power: number
          total_ppc?: number | null
          total_pps?: number | null
          upgrades: Json
          upgrades_breakdown?: Json | null
          user_id: string
        }
        Update: {
          achievements?: Json
          duration_seconds?: number
          end_time?: string
          id?: string
          pps?: number
          prestige_level?: number
          special_items?: Json
          start_time?: string
          total_clicks?: number
          total_power?: number
          total_ppc?: number | null
          total_pps?: number | null
          upgrades?: Json
          upgrades_breakdown?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestige_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestige_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number
          id: string
          unlock_value: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: number
          id?: string
          unlock_value?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: number
          id?: string
          unlock_value?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_active: string | null
          prestige_level: number | null
          settings: Json | null
          total_playtime_seconds: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_active?: string | null
          prestige_level?: number | null
          settings?: Json | null
          total_playtime_seconds?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_active?: string | null
          prestige_level?: number | null
          settings?: Json | null
          total_playtime_seconds?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_special_items: {
        Row: {
          effect_multiplier: number | null
          first_purchased_at: string | null
          id: string
          last_purchased_at: string | null
          quantity: number | null
          special_item_id: number
          total_spent: number | null
          user_id: string
        }
        Insert: {
          effect_multiplier?: number | null
          first_purchased_at?: string | null
          id?: string
          last_purchased_at?: string | null
          quantity?: number | null
          special_item_id: number
          total_spent?: number | null
          user_id: string
        }
        Update: {
          effect_multiplier?: number | null
          first_purchased_at?: string | null
          id?: string
          last_purchased_at?: string | null
          quantity?: number | null
          special_item_id?: number
          total_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_upgrades: {
        Row: {
          first_purchased_at: string | null
          id: string
          last_purchased_at: string | null
          quantity: number | null
          total_spent: number | null
          upgrade_id: number
          user_id: string
        }
        Insert: {
          first_purchased_at?: string | null
          id?: string
          last_purchased_at?: string | null
          quantity?: number | null
          total_spent?: number | null
          upgrade_id: number
          user_id: string
        }
        Update: {
          first_purchased_at?: string | null
          id?: string
          last_purchased_at?: string | null
          quantity?: number | null
          total_spent?: number | null
          upgrade_id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
          display_name: string | null
          last_updated: string | null
          playtime_seconds: number | null
          prestige_level: number | null
          rank: number | null
          total_clicks: number | null
          total_power: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      user_stats_view: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
          click_power: number | null
          display_name: string | null
          game_started: string | null
          id: string | null
          last_activity: string | null
          power_per_second: number | null
          prestige_level: number | null
          special_items_owned: number | null
          total_clicks: number | null
          total_power: number | null
          upgrades_owned: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_setup_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
        }[]
      }
      get_leaderboard: {
        Args: { p_type: string; p_limit?: number }
        Returns: {
          user_id: string
          username: string
          display_name: string
          avatar_url: string
          total_power: number
          total_clicks: number
          prestige_level: number
        }[]
      }
      get_user_profile_by_username: {
        Args: { p_username: string }
        Returns: {
          id: string
          username: string
          display_name: string
          avatar_url: string
          created_at: string
          total_power: number
          total_clicks: number
          prestige_level: number
          achievements_count: number
        }[]
      }
      increment_total_spent: {
        Args: {
          p_user_id: string
          p_upgrade_id: number
          p_amount: number
          p_special?: boolean
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: {
          p_user_id: string
          p_username: string
          p_display_name: string
          p_bio: string
          p_avatar_url: string
        }
        Returns: {
          username: string
          display_name: string
          bio: string
          avatar_url: string
        }[]
      }
      validate_progression_increase: {
        Args: {
          p_user_id: string
          p_old_power: number
          p_new_power: number
          p_action_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
