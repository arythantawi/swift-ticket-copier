-- Drop existing policy and recreate with super_admin support
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;

CREATE POLICY "Admins can manage banners" 
ON public.banners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));