-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_setor', 'usuario');

-- 2. Criar tabela setores
CREATE TABLE public.setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Adicionar colunas setor_id e ativo na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true;

-- 4. Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, setor_id)
);

-- 5. Criar tabela user_invites
CREATE TABLE public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Habilitar RLS em todas as tabelas
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- 7. Criar função has_role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 8. Criar função is_setor_admin
CREATE OR REPLACE FUNCTION public.is_setor_admin(_user_id UUID, _setor_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = 'admin_setor' 
      AND setor_id = _setor_id
  )
$$;

-- 9. Criar função get_user_setor_id
CREATE OR REPLACE FUNCTION public.get_user_setor_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setor_id FROM public.profiles WHERE id = _user_id
$$;

-- 10. Políticas RLS para setores
CREATE POLICY "Authenticated users can view active setores"
ON public.setores FOR SELECT TO authenticated
USING (ativo = true OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert setores"
ON public.setores FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update setores"
ON public.setores FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete setores"
ON public.setores FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 11. Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'admin_setor') AND setor_id = public.get_user_setor_id(auth.uid()))
);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Setor admins can manage usuario roles in their setor"
ON public.user_roles FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'admin_setor') 
  AND role = 'usuario' 
  AND setor_id = public.get_user_setor_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin_setor') 
  AND role = 'usuario' 
  AND setor_id = public.get_user_setor_id(auth.uid())
);

-- 12. Políticas RLS para user_invites
CREATE POLICY "Super admins can view all invites"
ON public.user_invites FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage invites"
ON public.user_invites FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Setor admins can view invites for their setor"
ON public.user_invites FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin_setor') 
  AND setor_id = public.get_user_setor_id(auth.uid())
);

CREATE POLICY "Setor admins can create usuario invites for their setor"
ON public.user_invites FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin_setor') 
  AND role = 'usuario' 
  AND setor_id = public.get_user_setor_id(auth.uid())
);

-- 13. Atualizar política de profiles para incluir setor_id e ativo
CREATE POLICY "Super admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 14. Trigger para atualizar updated_at em setores
CREATE TRIGGER update_setores_updated_at
BEFORE UPDATE ON public.setores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Atribuir super_admin ao primeiro usuário (você)
INSERT INTO public.user_roles (user_id, role)
VALUES ('21be861c-7f73-4ade-b843-96ffdd71295a', 'super_admin');