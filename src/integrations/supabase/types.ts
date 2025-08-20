export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      bombons: {
        Row: {
          base_id: string | null
          chocolate_id: string | null
          cor_id: string | null
          created_at: string
          ganache_id: string | null
          geleia_id: string | null
          id: string
          nome_guest: string | null
          prompt_gerado: string | null
          status: string | null
          telefone_guest: string | null
          updated_at: string
          url_imagem: string | null
          url_imagem_base64: string | null
          user_id: string
        }
        Insert: {
          base_id?: string | null
          chocolate_id?: string | null
          cor_id?: string | null
          created_at?: string
          ganache_id?: string | null
          geleia_id?: string | null
          id?: string
          nome_guest?: string | null
          prompt_gerado?: string | null
          status?: string | null
          telefone_guest?: string | null
          updated_at?: string
          url_imagem?: string | null
          url_imagem_base64?: string | null
          user_id: string
        }
        Update: {
          base_id?: string | null
          chocolate_id?: string | null
          cor_id?: string | null
          created_at?: string
          ganache_id?: string | null
          geleia_id?: string | null
          id?: string
          nome_guest?: string | null
          prompt_gerado?: string | null
          status?: string | null
          telefone_guest?: string | null
          updated_at?: string
          url_imagem?: string | null
          url_imagem_base64?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bombons_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "opcoes_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bombons_chocolate_id_fkey"
            columns: ["chocolate_id"]
            isOneToOne: false
            referencedRelation: "opcoes_chocolate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bombons_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "opcoes_cor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bombons_ganache_id_fkey"
            columns: ["ganache_id"]
            isOneToOne: false
            referencedRelation: "opcoes_ganache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bombons_geleia_id_fkey"
            columns: ["geleia_id"]
            isOneToOne: false
            referencedRelation: "opcoes_geleia"
            referencedColumns: ["id"]
          },
        ]
      }
      opcoes_base: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      opcoes_chocolate: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      opcoes_cor: {
        Row: {
          ativo: boolean | null
          codigo_hex: string | null
          created_at: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo_hex?: string | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo_hex?: string | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      opcoes_ganache: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      opcoes_geleia: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_configs: {
        Row: {
          base_prompt: string
          created_at: string
          id: string
          negative_prompt: string
          updated_at: string
        }
        Insert: {
          base_prompt?: string
          created_at?: string
          id?: string
          negative_prompt?: string
          updated_at?: string
        }
        Update: {
          base_prompt?: string
          created_at?: string
          id?: string
          negative_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_bombon: {
        Args: { p_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
