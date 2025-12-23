-- Step 1: Drop ALL policies that reference app_role on user_roles
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Setor admins can manage usuario roles in their setor" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gestores can manage equipe roles in their setor" ON public.user_roles;

-- Step 2: Drop ALL policies that reference app_role on user_invites
DROP POLICY IF EXISTS "Super admins can manage invites" ON public.user_invites;
DROP POLICY IF EXISTS "Super admins can view all invites" ON public.user_invites;
DROP POLICY IF EXISTS "Setor admins can view invites for their setor" ON public.user_invites;
DROP POLICY IF EXISTS "Setor admins can create usuario invites for their setor" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON public.user_invites;
DROP POLICY IF EXISTS "Admins can view all invites" ON public.user_invites;
DROP POLICY IF EXISTS "Gestores can view invites for their setor" ON public.user_invites;
DROP POLICY IF EXISTS "Gestores can create equipe invites for their setor" ON public.user_invites;

-- Step 3: Drop ALL policies that use has_role function on other tables
DROP POLICY IF EXISTS "Super admins can manage banned emails" ON public.banned_emails;
DROP POLICY IF EXISTS "Admins can manage banned emails" ON public.banned_emails;

DROP POLICY IF EXISTS "Users with roles can view demandas" ON public.demandas;
DROP POLICY IF EXISTS "Active users can create demandas" ON public.demandas;
DROP POLICY IF EXISTS "Active users can update their demandas" ON public.demandas;
DROP POLICY IF EXISTS "Active users can delete their own demandas" ON public.demandas;

DROP POLICY IF EXISTS "Active users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view active setores" ON public.setores;
DROP POLICY IF EXISTS "Super admins can insert setores" ON public.setores;
DROP POLICY IF EXISTS "Super admins can update setores" ON public.setores;
DROP POLICY IF EXISTS "Super admins can delete setores" ON public.setores;
DROP POLICY IF EXISTS "Admins can insert setores" ON public.setores;
DROP POLICY IF EXISTS "Admins can update setores" ON public.setores;
DROP POLICY IF EXISTS "Admins can delete setores" ON public.setores;

-- Step 4: Drop the helper functions that use app_role
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.is_setor_admin(uuid, uuid);

-- Step 5: Create new enum type
CREATE TYPE public.app_role_new AS ENUM ('admin', 'gestor', 'equipe');

-- Step 6: Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new 
  USING (
    CASE role::text
      WHEN 'super_admin' THEN 'admin'::public.app_role_new
      WHEN 'admin_setor' THEN 'gestor'::public.app_role_new
      WHEN 'usuario' THEN 'equipe'::public.app_role_new
    END
  );

-- Step 7: Update user_invites table to use new enum
ALTER TABLE public.user_invites 
  ALTER COLUMN role TYPE public.app_role_new 
  USING (
    CASE role::text
      WHEN 'super_admin' THEN 'admin'::public.app_role_new
      WHEN 'admin_setor' THEN 'gestor'::public.app_role_new
      WHEN 'usuario' THEN 'equipe'::public.app_role_new
    END
  );

-- Step 8: Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 9: Recreate helper functions with new role names
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.is_setor_gestor(_user_id uuid, _setor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = 'gestor' 
      AND setor_id = _setor_id
  )
$$;

-- Step 10: Recreate RLS policies for banned_emails
CREATE POLICY "Admins can manage banned emails" 
ON public.banned_emails 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Step 11: Recreate RLS policies for demandas
CREATE POLICY "Users with roles can view demandas" 
ON public.demandas 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (is_user_active(auth.uid()) AND has_any_role(auth.uid()))
);

CREATE POLICY "Active users can create demandas" 
ON public.demandas 
FOR INSERT 
WITH CHECK (
  (auth.uid() = solicitante_id) 
  AND (is_user_active(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Active users can update their demandas" 
ON public.demandas 
FOR UPDATE 
USING (
  ((auth.uid() = solicitante_id) OR (auth.uid() = responsavel_tecnico_id)) 
  AND (is_user_active(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Active users can delete their own demandas" 
ON public.demandas 
FOR DELETE 
USING (
  (auth.uid() = solicitante_id) 
  AND (is_user_active(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Step 12: Recreate RLS policies for profiles
CREATE POLICY "Active users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id) 
  OR is_user_active(auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 13: Recreate RLS policies for setores
CREATE POLICY "Authenticated users can view active setores" 
ON public.setores 
FOR SELECT 
USING ((ativo = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert setores" 
ON public.setores 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update setores" 
ON public.setores 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete setores" 
ON public.setores 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 14: Recreate RLS policies for user_invites
CREATE POLICY "Admins can manage invites" 
ON public.user_invites 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestores can view invites for their setor" 
ON public.user_invites 
FOR SELECT 
USING (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND (setor_id = get_user_setor_id(auth.uid()))
);

CREATE POLICY "Gestores can create equipe invites for their setor" 
ON public.user_invites 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND (role = 'equipe'::app_role) 
  AND (setor_id = get_user_setor_id(auth.uid()))
);

-- Step 15: Recreate RLS policies for user_roles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestores can manage equipe roles in their setor" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND (role = 'equipe'::app_role) 
  AND (setor_id = get_user_setor_id(auth.uid()))
)
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND (role = 'equipe'::app_role) 
  AND (setor_id = get_user_setor_id(auth.uid()))
);

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR (has_role(auth.uid(), 'gestor'::app_role) AND (setor_id = get_user_setor_id(auth.uid())))
);