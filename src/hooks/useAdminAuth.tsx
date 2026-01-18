import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isSuperAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({ user: null, isAdmin: false, isSuperAdmin: false, isLoading: false });
          return; // Don't redirect here, let signOut handle it
        }

        // Use setTimeout to avoid potential deadlocks with Supabase auth
        setTimeout(async () => {
          if (!isMounted) return;
          
          // Check roles - admin and super_admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          const roles = roleData?.map(r => r.role) || [];
          const isAdmin = roles.includes('admin') || roles.includes('super_admin');
          const isSuperAdmin = roles.includes('super_admin');

          if (!isAdmin) {
            await supabase.auth.signOut();
            setState({ user: null, isAdmin: false, isSuperAdmin: false, isLoading: false });
            navigate('/admin/login');
            return;
          }

          setState({
            user: session.user,
            isAdmin: true,
            isSuperAdmin,
            isLoading: false,
          });
        }, 0);
      }
    );

    // THEN check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;
      
      if (!session?.user) {
        setState({ user: null, isAdmin: false, isSuperAdmin: false, isLoading: false });
        navigate('/admin/login');
        return;
      }

      // Check roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const roles = roleData?.map(r => r.role) || [];
      const isAdmin = roles.includes('admin') || roles.includes('super_admin');
      const isSuperAdmin = roles.includes('super_admin');

      if (!isAdmin) {
        await supabase.auth.signOut();
        setState({ user: null, isAdmin: false, isSuperAdmin: false, isLoading: false });
        navigate('/admin/login');
        return;
      }

      setState({
        user: session.user,
        isAdmin: true,
        isSuperAdmin,
        isLoading: false,
      });
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    // Reset state first to prevent any re-renders while logging out
    setState({ user: null, isAdmin: false, isSuperAdmin: false, isLoading: false });
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    // Force navigate to login page
    window.location.href = '/admin/login';
  };

  return { ...state, signOut };
};
