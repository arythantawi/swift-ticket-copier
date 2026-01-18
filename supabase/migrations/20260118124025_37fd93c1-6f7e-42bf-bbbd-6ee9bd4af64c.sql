-- Fix admin_activity_logs policy - allow any authenticated admin to insert their own activity logs
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON public.admin_activity_logs;

CREATE POLICY "Admins can insert own activity logs" 
ON public.admin_activity_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix schedules policy - allow super_admin to manage as well
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;

CREATE POLICY "Admins can manage schedules" 
ON public.schedules 
FOR ALL 
TO authenticated 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);