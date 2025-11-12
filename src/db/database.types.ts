export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      ai_requests: {
        Row: {
          ai_request_id: string
          created_at: string
          error_code: string | null
          request_payload: Json
          response_payload: Json | null
          status: Database["public"]["Enums"]["ai_request_status_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_request_id?: string
          created_at?: string
          error_code?: string | null
          request_payload: Json
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["ai_request_status_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_request_id?: string
          created_at?: string
          error_code?: string | null
          request_payload?: Json
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["ai_request_status_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string
          is_active: boolean
          preferred_language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          preferred_language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          preferred_language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          answer: string
          card_id: string
          created_at: string
          deleted_at: string | null
          generation_set_id: string | null
          origin: Database["public"]["Enums"]["card_origin_type"]
          question: string
          source_excerpt: string | null
          status: Database["public"]["Enums"]["card_status_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          card_id?: string
          created_at?: string
          deleted_at?: string | null
          generation_set_id?: string | null
          origin?: Database["public"]["Enums"]["card_origin_type"]
          question: string
          source_excerpt?: string | null
          status?: Database["public"]["Enums"]["card_status_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          card_id?: string
          created_at?: string
          deleted_at?: string | null
          generation_set_id?: string | null
          origin?: Database["public"]["Enums"]["card_origin_type"]
          question?: string
          source_excerpt?: string | null
          status?: Database["public"]["Enums"]["card_status_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_generation_set_id_fkey"
            columns: ["generation_set_id"]
            isOneToOne: false
            referencedRelation: "generation_sets"
            referencedColumns: ["generation_set_id"]
          },
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_log: {
        Row: {
          created_at: string
          event_data: Json
          event_id: number
          event_type: Database["public"]["Enums"]["event_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_id?: number
          event_type: Database["public"]["Enums"]["event_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_id?: number
          event_type?: Database["public"]["Enums"]["event_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      generation_sets: {
        Row: {
          ai_request_id: string | null
          created_at: string
          generation_set_id: string
          input_hash: string
          input_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_request_id?: string | null
          created_at?: string
          generation_set_id?: string
          input_hash: string
          input_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_request_id?: string | null
          created_at?: string
          generation_set_id?: string
          input_hash?: string
          input_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_sets_ai_request_id_fkey"
            columns: ["ai_request_id"]
            isOneToOne: false
            referencedRelation: "ai_requests"
            referencedColumns: ["ai_request_id"]
          },
          {
            foreignKeyName: "generation_sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      ai_request_status_type: "queued" | "processing" | "succeeded" | "failed"
      card_origin_type: "manual" | "ai" | "ai-edited"
      card_status_type: "proposed" | "accepted" | "rejected" | "deleted"
      event_type:
        | "ai_generation_requested"
        | "ai_generation_succeeded"
        | "ai_generation_failed"
        | "cards_proposed"
        | "cards_accepted"
        | "cards_rejected"
        | "card_created_manual"
        | "card_deleted"
        | "review_session_started"
        | "review_session_finished"
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
    Enums: {
      ai_request_status_type: ["queued", "processing", "succeeded", "failed"],
      card_origin_type: ["manual", "ai", "ai-edited"],
      card_status_type: ["proposed", "accepted", "rejected", "deleted"],
      event_type: [
        "ai_generation_requested",
        "ai_generation_succeeded",
        "ai_generation_failed",
        "cards_proposed",
        "cards_accepted",
        "cards_rejected",
        "card_created_manual",
        "card_deleted",
        "review_session_started",
        "review_session_finished",
      ],
    },
  },
} as const

