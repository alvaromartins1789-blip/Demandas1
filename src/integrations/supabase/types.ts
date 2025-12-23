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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      banned_emails: {
        Row: {
          banned_by: string
          created_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          banned_by: string
          created_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          banned_by?: string
          created_at?: string
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      demandas: {
        Row: {
          area_solicitante: string
          categoria: Database["public"]["Enums"]["categoria"]
          created_at: string
          dependencias: string | null
          descricao: string
          documentacao_ajustes: string | null
          eficiencia_esperada: string | null
          estimativa_horas: number | null
          evidencia_tecnica: string | null
          feedbacks: string[] | null
          horas_reais: number | null
          id: string
          justificativa_tecnica: string | null
          kpi_impactado: string | null
          link_gravacao: string | null
          nome_projeto: string
          objetivo_esperado: string
          observacoes_triagem: string | null
          prioridade: Database["public"]["Enums"]["prioridade"]
          prioridade_atualizada:
            | Database["public"]["Enums"]["prioridade"]
            | null
          responsavel_tecnico_id: string | null
          solicitante_id: string
          status: Database["public"]["Enums"]["status_demanda"]
          status_homologacao:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          status_triagem: Database["public"]["Enums"]["status_aprovacao"] | null
          status_triagem_tecnica:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          tipo: Database["public"]["Enums"]["tipo_demanda"]
          updated_at: string
        }
        Insert: {
          area_solicitante: string
          categoria: Database["public"]["Enums"]["categoria"]
          created_at?: string
          dependencias?: string | null
          descricao: string
          documentacao_ajustes?: string | null
          eficiencia_esperada?: string | null
          estimativa_horas?: number | null
          evidencia_tecnica?: string | null
          feedbacks?: string[] | null
          horas_reais?: number | null
          id?: string
          justificativa_tecnica?: string | null
          kpi_impactado?: string | null
          link_gravacao?: string | null
          nome_projeto: string
          objetivo_esperado: string
          observacoes_triagem?: string | null
          prioridade: Database["public"]["Enums"]["prioridade"]
          prioridade_atualizada?:
            | Database["public"]["Enums"]["prioridade"]
            | null
          responsavel_tecnico_id?: string | null
          solicitante_id: string
          status?: Database["public"]["Enums"]["status_demanda"]
          status_homologacao?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          status_triagem?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          status_triagem_tecnica?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          tipo: Database["public"]["Enums"]["tipo_demanda"]
          updated_at?: string
        }
        Update: {
          area_solicitante?: string
          categoria?: Database["public"]["Enums"]["categoria"]
          created_at?: string
          dependencias?: string | null
          descricao?: string
          documentacao_ajustes?: string | null
          eficiencia_esperada?: string | null
          estimativa_horas?: number | null
          evidencia_tecnica?: string | null
          feedbacks?: string[] | null
          horas_reais?: number | null
          id?: string
          justificativa_tecnica?: string | null
          kpi_impactado?: string | null
          link_gravacao?: string | null
          nome_projeto?: string
          objetivo_esperado?: string
          observacoes_triagem?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          prioridade_atualizada?:
            | Database["public"]["Enums"]["prioridade"]
            | null
          responsavel_tecnico_id?: string | null
          solicitante_id?: string
          status?: Database["public"]["Enums"]["status_demanda"]
          status_homologacao?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          status_triagem?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          status_triagem_tecnica?:
            | Database["public"]["Enums"]["status_aprovacao"]
            | null
          tipo?: Database["public"]["Enums"]["tipo_demanda"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
          ativo: boolean
          created_at: string
          email: string
          id: string
          must_change_password: boolean | null
          nome: string
          setor_id: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          ativo?: boolean
          created_at?: string
          email: string
          id: string
          must_change_password?: boolean | null
          nome: string
          setor_id?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          must_change_password?: boolean | null
          nome?: string
          setor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          setor_id: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          setor_id?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          setor_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invites_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          setor_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          setor_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          setor_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_setor_id: { Args: { _user_id: string }; Returns: string }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_setor_gestor: {
        Args: { _setor_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "gestor" | "equipe"
      categoria: "aplicativo" | "automacao" | "dashboard"
      prioridade: "baixa" | "media" | "alta" | "urgente"
      status_aprovacao: "pendente" | "aprovado" | "reprovado"
      status_demanda:
        | "triagem"
        | "triagem-tecnica"
        | "pdd"
        | "desenvolvimento"
        | "homologacao"
        | "golive"
        | "concluido"
        | "reprovado"
      tipo_demanda: "criacao" | "ajuste" | "manutencao"
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
      app_role: ["admin", "gestor", "equipe"],
      categoria: ["aplicativo", "automacao", "dashboard"],
      prioridade: ["baixa", "media", "alta", "urgente"],
      status_aprovacao: ["pendente", "aprovado", "reprovado"],
      status_demanda: [
        "triagem",
        "triagem-tecnica",
        "pdd",
        "desenvolvimento",
        "homologacao",
        "golive",
        "concluido",
        "reprovado",
      ],
      tipo_demanda: ["criacao", "ajuste", "manutencao"],
    },
  },
} as const
