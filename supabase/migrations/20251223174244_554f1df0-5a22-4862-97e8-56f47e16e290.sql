-- Criar tabela de histórico de auditoria para demandas
CREATE TABLE public.demanda_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  usuario_nome TEXT NOT NULL,
  acao TEXT NOT NULL,
  status_anterior TEXT,
  status_novo TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar campos de auditoria na tabela demandas
ALTER TABLE public.demandas 
ADD COLUMN triado_por_id UUID,
ADD COLUMN triado_por_nome TEXT,
ADD COLUMN triado_em TIMESTAMPTZ,
ADD COLUMN triagem_tecnica_por_id UUID,
ADD COLUMN triagem_tecnica_por_nome TEXT,
ADD COLUMN triagem_tecnica_em TIMESTAMPTZ;

-- Habilitar RLS na tabela de histórico
ALTER TABLE public.demanda_historico ENABLE ROW LEVEL SECURITY;

-- Política: Usuários com roles podem visualizar histórico
CREATE POLICY "Users with roles can view demanda history"
ON public.demanda_historico
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (is_user_active(auth.uid()) AND has_any_role(auth.uid()))
);

-- Política: Apenas admin e gestor podem inserir histórico
CREATE POLICY "Admin and gestor can insert history"
ON public.demanda_historico
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestor'::app_role)
);

-- Criar índice para performance
CREATE INDEX idx_demanda_historico_demanda_id ON public.demanda_historico(demanda_id);
CREATE INDEX idx_demanda_historico_created_at ON public.demanda_historico(created_at DESC);