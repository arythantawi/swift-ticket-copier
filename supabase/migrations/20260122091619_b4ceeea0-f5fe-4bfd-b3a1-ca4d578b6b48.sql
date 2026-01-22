-- Fix RLS policies for videos table to include super_admin role
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;

CREATE POLICY "Admins can manage videos"
ON public.videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));