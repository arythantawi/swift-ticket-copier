-- Add RLS policies for database_backups table
-- Only super_admin can access backups using has_role function
CREATE POLICY "Super admins can view backups"
  ON public.database_backups FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can create backups"
  ON public.database_backups FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete backups"
  ON public.database_backups FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Assign super_admin role to ary020502@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role 
FROM auth.users 
WHERE email = 'ary020502@gmail.com'
ON CONFLICT DO NOTHING;