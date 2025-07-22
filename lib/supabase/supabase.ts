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
      action_history: {
        Row: {
          action_type: string
          cost: number | null
          created_at: string | null
          gained_power: number | null
          id: string
          power_after: number | null
          power_before: number | null
          quantity: number | null
          session_id: string | null
          target_id: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          cost?: number | null
          created_at?: string | null
          gained_power?: number | null
          id?: string
          power_after?: number | null
          power_before?: number | null
          quantity?: number | null
          session_id?: string | null
          target_id?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          cost?: number | null
          created_at?: string | null
          gained_power?: number | null
          id?: string
          power_after?: number | null
          power_before?: number | null
          quantity?: number | null
          session_id?: string | null
          target_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progression: {
        Row: {
          active_boosts: Json | null
          click_power: number | null
          combo_active: boolean | null
          combo_count: number | null
          created_at: string | null
          current_power: number | null
          id: string
          last_click_time: string | null
          last_save_time: string | null
          power_per_second: number | null
          prestige_level: number | null
          prestige_points: number | null
          total_clicks: number | null
          total_power: number | null
          total_prestige_power: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_boosts?: Json | null
          click_power?: number | null
          combo_active?: boolean | null
          combo_count?: number | null
          created_at?: string | null
          current_power?: number | null
          id?: string
          last_click_time?: string | null
          last_save_time?: string | null
          power_per_second?: number | null
          prestige_level?: number | null
          prestige_points?: number | null
          total_clicks?: number | null
          total_power?: number | null
          total_prestige_power?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_boosts?: Json | null
          click_power?: number | null
          combo_active?: boolean | null
          combo_count?: number | null
          created_at?: string | null
          current_power?: number | null
          id?: string
          last_click_time?: string | null
          last_save_time?: string | null
          power_per_second?: number | null
          prestige_level?: number | null
          prestige_points?: number | null
          total_clicks?: number | null
          total_power?: number | null
          total_prestige_power?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_progression_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_progression_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit: {
        Row: {
          created_at: string | null
          description: string | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_audit_user_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
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
      user_sessions: {
        Row: {
          clicks_count: number | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string | null
          power_gained: number | null
          session_token: string | null
          started_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          clicks_count?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          power_gained?: number | null
          session_token?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          clicks_count?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          power_gained?: number | null
          session_token?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_special_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_special_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_upgrades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_upgrades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
          display_name: string | null
          last_updated: string | null
          prestige_level: number | null
          rank: number | null
          total_clicks: number | null
          total_power: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats_view: {
        Row: {
          achievements_count: number | null
          id: string | null
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
      update_leaderboard_entry: {
        Args: { p_user_id: string }
        Returns: undefined
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
