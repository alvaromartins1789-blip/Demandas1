-- Create function to check if user has any role assigned
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Drop the existing SELECT policy on demandas
DROP POLICY IF EXISTS "Active users can view all demandas" ON public.demandas;

-- Create new SELECT policy that requires user to have a role
CREATE POLICY "Users with roles can view demandas" 
ON public.demandas 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR (
    is_user_active(auth.uid()) 
    AND has_any_role(auth.uid())
  )
);