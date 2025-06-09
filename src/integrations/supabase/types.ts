export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          auto_start_delay: number | null
          created_at: string
          current_set: number
          field: string
          game_number: number | null
          group_letter: string | null
          id: string
          is_complete: boolean
          is_running: boolean
          phase: string
          sets: Json
          start_time: string | null
          team1_id: string | null
          team1_score: number
          team2_id: string | null
          team2_score: number
          winner_id: string | null
        }
        Insert: {
          auto_start_delay?: number | null
          created_at?: string
          current_set?: number
          field: string
          game_number?: number | null
          group_letter?: string | null
          id?: string
          is_complete?: boolean
          is_running?: boolean
          phase: string
          sets?: Json
          start_time?: string | null
          team1_id?: string | null
          team1_score?: number
          team2_id?: string | null
          team2_score?: number
          winner_id?: string | null
        }
        Update: {
          auto_start_delay?: number | null
          created_at?: string
          current_set?: number
          field?: string
          game_number?: number | null
          group_letter?: string | null
          id?: string
          is_complete?: boolean
          is_running?: boolean
          phase?: string
          sets?: Json
          start_time?: string | null
          team1_id?: string | null
          team1_score?: number
          team2_id?: string | null
          team2_score?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          group_letter: string
          id: string
          losses: number
          name: string
          points_against: number
          points_for: number
          sets_lost: number
          sets_won: number
          wins: number
        }
        Insert: {
          created_at?: string
          group_letter: string
          id?: string
          losses?: number
          name: string
          points_against?: number
          points_for?: number
          sets_lost?: number
          sets_won?: number
          wins?: number
        }
        Update: {
          created_at?: string
          group_letter?: string
          id?: string
          losses?: number
          name?: string
          points_against?: number
          points_for?: number
          sets_lost?: number
          sets_won?: number
          wins?: number
        }
        Relationships: []
      }
      tournament_settings: {
        Row: {
          admin_password: string
          auto_start_delay: number
          created_at: string
          current_phase: string
          id: string
          is_active: boolean
          number_of_courts: number
          number_of_groups: number
          number_of_sets: number
          points_to_win: number
          points_to_win_set: number
          sets_to_win: number
          teams_advancing_from_group: number
          time_limit: number
          updated_at: string
          win_condition: string
        }
        Insert: {
          admin_password?: string
          auto_start_delay?: number
          created_at?: string
          current_phase?: string
          id?: string
          is_active?: boolean
          number_of_courts?: number
          number_of_groups?: number
          number_of_sets?: number
          points_to_win?: number
          points_to_win_set?: number
          sets_to_win?: number
          teams_advancing_from_group?: number
          time_limit?: number
          updated_at?: string
          win_condition?: string
        }
        Update: {
          admin_password?: string
          auto_start_delay?: number
          created_at?: string
          current_phase?: string
          id?: string
          is_active?: boolean
          number_of_courts?: number
          number_of_groups?: number
          number_of_sets?: number
          points_to_win?: number
          points_to_win_set?: number
          sets_to_win?: number
          teams_advancing_from_group?: number
          time_limit?: number
          updated_at?: string
          win_condition?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_round_robin_for_group: {
        Args: { group_letter: string; court_offset?: number }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
