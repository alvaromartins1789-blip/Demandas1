-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Active users can view all profiles" ON public.profiles;

-- Create a more restrictive SELECT policy
-- Users can view: their own profile, OR if they're admin, OR if they're gestor viewing same setor
CREATE POLICY "Users can view authorized profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (
    has_role(auth.uid(), 'gestor'::app_role) 
    AND setor_id = get_user_setor_id(auth.uid())
  )
);