-- Create function to check if current user is active
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND ativo = true
  )
$$;

-- Change default for new profiles to ativo = false
ALTER TABLE public.profiles ALTER COLUMN ativo SET DEFAULT false;

-- Update the handle_new_user function to set ativo = false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    false  -- New users are inactive by default
  );
  RETURN NEW;
END;
$$;

-- Drop existing permissive policies and create new ones that check if user is active

-- Demandas: Only active users can view
DROP POLICY IF EXISTS "Authenticated users can view all demandas" ON public.demandas;
CREATE POLICY "Active users can view all demandas" 
ON public.demandas 
FOR SELECT 
USING (
  is_user_active(auth.uid()) OR has_role(auth.uid(), 'super_admin')
);

-- Demandas: Only active users can create
DROP POLICY IF EXISTS "Users can create demandas" ON public.demandas;
CREATE POLICY "Active users can create demandas" 
ON public.demandas 
FOR INSERT 
WITH CHECK (
  auth.uid() = solicitante_id AND 
  (is_user_active(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
);

-- Demandas: Only active users can update
DROP POLICY IF EXISTS "Users can update their demandas" ON public.demandas;
CREATE POLICY "Active users can update their demandas" 
ON public.demandas 
FOR UPDATE 
USING (
  (auth.uid() = solicitante_id OR auth.uid() = responsavel_tecnico_id) AND
  (is_user_active(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
);

-- Demandas: Only active users can delete
DROP POLICY IF EXISTS "Users can delete their own demandas" ON public.demandas;
CREATE POLICY "Active users can delete their own demandas" 
ON public.demandas 
FOR DELETE 
USING (
  auth.uid() = solicitante_id AND
  (is_user_active(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
);

-- Profiles: Active users and super admins can view profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Active users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always see their own profile (to check if active)
  auth.uid() = id OR
  is_user_active(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin')
);