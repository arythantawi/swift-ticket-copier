import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SignInResult {
  error: AuthError | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const withTimeout = async <T,>(promise: Promise<T>, ms = 5000): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error('timeout')), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data !== null;
    } catch (err) {
      console.error('Error in checkAdminRole:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get existing session first
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);

          try {
            const adminStatus = await withTimeout(checkAdminRole(existingSession.user.id), 5000);
            if (isMounted) setIsAdmin(adminStatus);
          } catch (e) {
            console.error('Admin role check timed out/failed:', e);
            if (isMounted) setIsAdmin(false);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('AuthProvider initialization failed:', e);
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('Auth state changed:', event);

      if (!isMounted) return;

      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user) {
        // Check admin status before completing the state change (with timeout so UI never hangs)
        try {
          const adminStatus = await withTimeout(checkAdminRole(sess.user.id), 5000);
          if (isMounted) setIsAdmin(adminStatus);
        } catch (e) {
          console.error('Admin role check timed out/failed:', e);
          if (isMounted) setIsAdmin(false);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth called outside AuthProvider - returning safe defaults');
    return {
      user: null,
      session: null,
      isAdmin: false,
      isLoading: false,
      signIn: async () => ({ error: { message: 'Auth context not ready' } as any }),
      signOut: async () => {},
    };
  }
  return context;
};
