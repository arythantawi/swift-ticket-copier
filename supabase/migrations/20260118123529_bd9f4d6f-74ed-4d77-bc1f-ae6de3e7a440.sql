-- Drop existing policies on trip_operations
DROP POLICY IF EXISTS "Admins can view all trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Admins can insert trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Admins can update trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Admins can delete trip_operations" ON public.trip_operations;

-- Create stricter policies - only super_admin can access driver data
CREATE POLICY "Super admins can view trip_operations" 
ON public.trip_operations 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert trip_operations" 
ON public.trip_operations 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update trip_operations" 
ON public.trip_operations 
FOR UPDATE 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete trip_operations" 
ON public.trip_operations 
FOR DELETE 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'::app_role));