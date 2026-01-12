import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({ user: null, isAdmin: false, isLoading: false });
          navigate('/admin/login');
          return;
        }

        // Check admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          setState({ user: null, isAdmin: false, isLoading: false });
          navigate('/admin/login');
          return;
        }

        setState({
          user: session.user,
          isAdmin: true,
          isLoading: false,
        });
      }
    );

    // THEN check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setState({ user: null, isAdmin: false, isLoading: false });
        navigate('/admin/login');
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        setState({ user: null, isAdmin: false, isLoading: false });
        navigate('/admin/login');
        return;
      }

      setState({
        user: session.user,
        isAdmin: true,
        isLoading: false,
      });
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return { ...state, signOut };
};
