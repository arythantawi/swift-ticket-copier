-- Create admin_activity_logs table for monitoring admin login activities
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'login', 'logout', 'password_reset', 'admin_created', etc.
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin can view activity logs
CREATE POLICY "Super admins can view activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- Create admin_profiles table for storing admin phone numbers and settings
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT,
  is_mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all admin profiles
CREATE POLICY "Super admins can view all admin profiles"
  ON public.admin_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR auth.uid() = user_id);

CREATE POLICY "Super admins can insert admin profiles"
  ON public.admin_profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update admin profiles"
  ON public.admin_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin') OR auth.uid() = user_id);

CREATE POLICY "Super admins can delete admin profiles"
  ON public.admin_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert super admin profile
INSERT INTO public.admin_profiles (user_id, phone_number, is_mfa_enabled)
SELECT id, '082132535473', true
FROM auth.users
WHERE email = 'ary020502@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET phone_number = '082132535473', is_mfa_enabled = true;