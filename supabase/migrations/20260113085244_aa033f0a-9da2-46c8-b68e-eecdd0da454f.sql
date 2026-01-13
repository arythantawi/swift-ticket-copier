-- Insert admin role for user ary020502@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('29f00e7d-2aff-411a-801a-9de0613b06d4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;