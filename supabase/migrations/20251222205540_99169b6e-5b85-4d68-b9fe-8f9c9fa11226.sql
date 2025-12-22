-- Create enum types for demandas
CREATE TYPE public.status_demanda AS ENUM (
  'triagem',
  'triagem-tecnica',
  'pdd',
  'desenvolvimento',
  'homologacao',
  'golive',
  'concluido',
  'reprovado'
);

CREATE TYPE public.prioridade AS ENUM ('baixa', 'media', 'alta', 'urgente');

CREATE TYPE public.categoria AS ENUM ('aplicativo', 'automacao', 'dashboard');

CREATE TYPE public.tipo_demanda AS ENUM ('criacao', 'ajuste', 'manutencao');

CREATE TYPE public.status_aprovacao AS ENUM ('pendente', 'aprovado', 'reprovado');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  area TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create demandas table
CREATE TABLE public.demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_projeto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivo_esperado TEXT NOT NULL,
  area_solicitante TEXT NOT NULL,
  categoria public.categoria NOT NULL,
  tipo public.tipo_demanda NOT NULL,
  prioridade public.prioridade NOT NULL,
  kpi_impactado TEXT,
  eficiencia_esperada TEXT,
  status public.status_demanda NOT NULL DEFAULT 'triagem',
  
  -- Users
  solicitante_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responsavel_tecnico_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Triagem de Negócio
  status_triagem public.status_aprovacao DEFAULT 'pendente',
  observacoes_triagem TEXT,
  prioridade_atualizada public.prioridade,
  
  -- Triagem Técnica
  status_triagem_tecnica public.status_aprovacao,
  dependencias TEXT,
  justificativa_tecnica TEXT,
  evidencia_tecnica TEXT,
  
  -- Desenvolvimento
  estimativa_horas INTEGER,
  horas_reais INTEGER,
  
  -- Homologação
  status_homologacao public.status_aprovacao,
  link_gravacao TEXT,
  
  -- Go Live
  documentacao_ajustes TEXT,
  feedbacks TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on demandas
ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;

-- Demandas policies - All authenticated users can view all demandas
CREATE POLICY "Authenticated users can view all demandas"
  ON public.demandas FOR SELECT
  TO authenticated
  USING (true);

-- Users can create demandas
CREATE POLICY "Users can create demandas"
  ON public.demandas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = solicitante_id);

-- Users can update their own demandas or if they are the responsavel_tecnico
CREATE POLICY "Users can update their demandas"
  ON public.demandas FOR UPDATE
  TO authenticated
  USING (auth.uid() = solicitante_id OR auth.uid() = responsavel_tecnico_id);

-- Users can delete their own demandas
CREATE POLICY "Users can delete their own demandas"
  ON public.demandas FOR DELETE
  TO authenticated
  USING (auth.uid() = solicitante_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demandas_updated_at
  BEFORE UPDATE ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for demandas
ALTER PUBLICATION supabase_realtime ADD TABLE public.demandas;