-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new policy that allows super_admin to manage all roles
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Also update admin_profiles policy to allow super_admin full access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.admin_profiles;

CREATE POLICY "Super admins can manage all profiles" 
ON public.admin_profiles 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.admin_profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Allow users to insert their own profile  
CREATE POLICY "Users can insert own profile" 
ON public.admin_profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());