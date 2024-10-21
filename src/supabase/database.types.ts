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
      country: {
        Row: {
          continent: string | null
          country_code: string
          country_id: number
          country_name: string
          official_language: string | null
          population: number | null
          region: string | null
        }
        Insert: {
          continent?: string | null
          country_code: string
          country_id?: number
          country_name: string
          official_language?: string | null
          population?: number | null
          region?: string | null
        }
        Update: {
          continent?: string | null
          country_code?: string
          country_id?: number
          country_name?: string
          official_language?: string | null
          population?: number | null
          region?: string | null
        }
        Relationships: []
      }
      event: {
        Row: {
          draw_size: number | null
          event_end_date: string | null
          event_gender: string | null
          event_id: number
          event_start_date: string | null
          event_type_id: number
          event_year: number | null
          external_id: string | null
          length: number | null
          location: string | null
          name: string | null
          prize_money: number | null
          surface_type_id: number
        }
        Insert: {
          draw_size?: number | null
          event_end_date?: string | null
          event_gender?: string | null
          event_id?: number
          event_start_date?: string | null
          event_type_id: number
          event_year?: number | null
          external_id?: string | null
          length?: number | null
          location?: string | null
          name?: string | null
          prize_money?: number | null
          surface_type_id: number
        }
        Update: {
          draw_size?: number | null
          event_end_date?: string | null
          event_gender?: string | null
          event_id?: number
          event_start_date?: string | null
          event_type_id?: number
          event_year?: number | null
          external_id?: string | null
          length?: number | null
          location?: string | null
          name?: string | null
          prize_money?: number | null
          surface_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_type"
            referencedColumns: ["event_type_id"]
          },
          {
            foreignKeyName: "event_surface_type_id_fkey"
            columns: ["surface_type_id"]
            isOneToOne: false
            referencedRelation: "surface_type"
            referencedColumns: ["surface_type_id"]
          },
        ]
      }
      event_type: {
        Row: {
          event_type: string
          event_type_id: number
        }
        Insert: {
          event_type: string
          event_type_id?: number
        }
        Update: {
          event_type?: string
          event_type_id?: number
        }
        Relationships: []
      }
      match: {
        Row: {
          event_id: number
          external_id: string | null
          match_duration: unknown | null
          match_end_time: string | null
          match_id: number
          match_start_time: string | null
          player_a_id: number | null
          player_b_id: number | null
          round_id: number | null
          winner_id: number | null
        }
        Insert: {
          event_id?: number
          external_id?: string | null
          match_duration?: unknown | null
          match_end_time?: string | null
          match_id?: number
          match_start_time?: string | null
          player_a_id?: number | null
          player_b_id?: number | null
          round_id?: number | null
          winner_id?: number | null
        }
        Update: {
          event_id?: number
          external_id?: string | null
          match_duration?: unknown | null
          match_end_time?: string | null
          match_id?: number
          match_start_time?: string | null
          player_a_id?: number | null
          player_b_id?: number | null
          round_id?: number | null
          winner_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "match_player_a_id_fkey"
            columns: ["player_a_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_player_b_id_fkey"
            columns: ["player_b_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "match_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "match_round"
            referencedColumns: ["round_id"]
          },
          {
            foreignKeyName: "match_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_id"]
          },
        ]
      }
      match_round: {
        Row: {
          round_id: number
          round_name: string
        }
        Insert: {
          round_id?: number
          round_name: string
        }
        Update: {
          round_id?: number
          round_name?: string
        }
        Relationships: []
      }
      player: {
        Row: {
          country_id: number | null
          date_of_birth: string | null
          external_id: string | null
          first_name: string | null
          full_name: string | null
          handedness: string | null
          height_cm: number | null
          last_known_ranking: number | null
          last_name: string | null
          last_update_time: string | null
          name_code: string | null
          place_of_birth: string | null
          player_id: number
          sex: string | null
          source: string | null
          weight_kg: number | null
        }
        Insert: {
          country_id?: number | null
          date_of_birth?: string | null
          external_id?: string | null
          first_name?: string | null
          full_name?: string | null
          handedness?: string | null
          height_cm?: number | null
          last_known_ranking?: number | null
          last_name?: string | null
          last_update_time?: string | null
          name_code?: string | null
          place_of_birth?: string | null
          player_id?: number
          sex?: string | null
          source?: string | null
          weight_kg?: number | null
        }
        Update: {
          country_id?: number | null
          date_of_birth?: string | null
          external_id?: string | null
          first_name?: string | null
          full_name?: string | null
          handedness?: string | null
          height_cm?: number | null
          last_known_ranking?: number | null
          last_name?: string | null
          last_update_time?: string | null
          name_code?: string | null
          place_of_birth?: string | null
          player_id?: number
          sex?: string | null
          source?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["country_id"]
          },
        ]
      }
      player_rank_history: {
        Row: {
          player_id: number | null
          rank_history_id: number
          ranking: number | null
          ranking_date: string | null
        }
        Insert: {
          player_id?: number | null
          rank_history_id?: number
          ranking?: number | null
          ranking_date?: string | null
        }
        Update: {
          player_id?: number | null
          rank_history_id?: number
          ranking?: number | null
          ranking_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_rank_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_statistic: {
        Row: {
          grand_slam_titles: number | null
          last_updated: string | null
          losses: number | null
          player_id: number | null
          stat_id: string
          surface_type_id: number
          titles_won: number | null
          top_10_wins: number | null
          total_matches_played: number | null
          win_percentage: number | null
          wins: number | null
        }
        Insert: {
          grand_slam_titles?: number | null
          last_updated?: string | null
          losses?: number | null
          player_id?: number | null
          stat_id: string
          surface_type_id: number
          titles_won?: number | null
          top_10_wins?: number | null
          total_matches_played?: number | null
          win_percentage?: number | null
          wins?: number | null
        }
        Update: {
          grand_slam_titles?: number | null
          last_updated?: string | null
          losses?: number | null
          player_id?: number | null
          stat_id?: string
          surface_type_id?: number
          titles_won?: number | null
          top_10_wins?: number | null
          total_matches_played?: number | null
          win_percentage?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_statistic_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_statistic_surface_type_id_fkey"
            columns: ["surface_type_id"]
            isOneToOne: false
            referencedRelation: "surface_type"
            referencedColumns: ["surface_type_id"]
          },
        ]
      }
      set_score: {
        Row: {
          external_id: string | null
          match_id: number
          player_a_score: number | null
          player_b_score: number | null
          set_number: number | null
          set_score_id: number
          tie_break_points_a: number | null
          tie_break_points_b: number | null
        }
        Insert: {
          external_id?: string | null
          match_id?: number
          player_a_score?: number | null
          player_b_score?: number | null
          set_number?: number | null
          set_score_id?: number
          tie_break_points_a?: number | null
          tie_break_points_b?: number | null
        }
        Update: {
          external_id?: string | null
          match_id?: number
          player_a_score?: number | null
          player_b_score?: number | null
          set_number?: number | null
          set_score_id?: number
          tie_break_points_a?: number | null
          tie_break_points_b?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_score_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match"
            referencedColumns: ["match_id"]
          },
        ]
      }
      surface_type: {
        Row: {
          surface_type: string
          surface_type_id: number
        }
        Insert: {
          surface_type: string
          surface_type_id?: number
        }
        Update: {
          surface_type?: string
          surface_type_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      match_details: {
        Row: {
          event_id: number | null
          match_start_time: string | null
          name: string | null
          player_a_full_name: string | null
          player_a_score: number | null
          player_b_full_name: string | null
          player_b_score: number | null
          round_name: string | null
          set_number: number | null
          tie_break_points_a: number | null
          tie_break_points_b: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
        ]
      }
    }
    Functions: {
      get_aggregated_match_scores: {
        Args: Record<PropertyKey, never>
        Returns: {
          match_id: number
          player_a_full_name: string
          player_b_full_name: string
          round_name: string
          event_name: string
          event_gender: string
          event_year: number
          player_a_scores: number[]
          player_b_scores: number[]
          match_start_time: string
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
