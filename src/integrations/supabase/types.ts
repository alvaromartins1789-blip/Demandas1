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
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
