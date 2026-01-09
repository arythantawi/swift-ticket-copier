import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SignInResult {
  error: AuthError | null;
  mfaRequired?: boolean;
  hasUnverifiedFactor?: boolean;
  factorId?: string;
  needsEnrollment?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  verifyOtp: (code: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  enrollMfa: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  verifyMfaEnrollment: (code: string, factorId: string) => Promise<{ error: AuthError | null }>;
  getUnverifiedFactor: () => Promise<{ factorId: string } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error('Error in checkAdminRole:', err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const adminStatus = await checkAdminRole(session.user.id);
          setIsAdmin(adminStatus);

          // Enforce MFA based on Authenticator Assurance Level (AAL)
          const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (!error && data) {
            const needsMfa = data.currentLevel === 'aal1' && data.nextLevel === 'aal2';
            setMfaRequired(needsMfa);
          } else {
            setMfaRequired(false);
          }
        } else {
          setIsAdmin(false);
          setMfaRequired(false);
        }
      } catch (e) {
        console.error('AuthProvider onAuthStateChange failed:', e);
        setIsAdmin(false);
        setMfaRequired(false);
      } finally {
        setIsLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);

            const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (!error && data) {
              const needsMfa = data.currentLevel === 'aal1' && data.nextLevel === 'aal2';
              setMfaRequired(needsMfa);
            } else {
              setMfaRequired(false);
            }
          } else {
            setIsAdmin(false);
            setMfaRequired(false);
          }
        } catch (e) {
          console.error('AuthProvider getSession failed:', e);
          setIsAdmin(false);
          setMfaRequired(false);
        } finally {
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.error('AuthProvider getSession promise failed:', e);
        setIsAdmin(false);
        setMfaRequired(false);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Check if MFA is set up (verified factors)
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = factorsData?.totp?.filter(f => (f.status as string) === 'verified') || [];
    const unverifiedFactors = factorsData?.totp?.filter(f => (f.status as string) === 'unverified') || [];
    
    if (verifiedFactors.length > 0) {
      // User has verified MFA, need to verify OTP
      setMfaRequired(true);
      return { error: null, mfaRequired: true };
    }
    
    if (unverifiedFactors.length > 0) {
      // Has unverified factor - return info to show enrollment with existing factor
      return { error: null, mfaRequired: false, hasUnverifiedFactor: true, factorId: unverifiedFactors[0].id };
    }

    // No MFA at all - need to enroll
    return { error: null, mfaRequired: false, needsEnrollment: true };
  };

  const verifyOtp = async (code: string) => {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    
    if (!factorsData?.totp || factorsData.totp.length === 0) {
      return { error: { message: 'No TOTP factor found' } as AuthError };
    }

    const factor = factorsData.totp[0];
    
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError) {
      return { error: challengeError };
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challengeData.id,
      code,
    });

    if (!error) {
      setMfaRequired(false);
    }

    return { error };
  };

  const enrollMfa = async (): Promise<{ qrCode: string; secret: string; factorId: string } | null> => {
    console.log('Starting MFA enrollment...');

    // First, unenroll any existing unverified factors
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    console.log('Existing factors:', factorsData);

    const unverifiedFactors = factorsData?.totp?.filter(f => (f.status as string) === 'unverified') || [];

    for (const factor of unverifiedFactors) {
      console.log('Unenrolling unverified factor:', factor.id);
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    // Now enroll a new factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Admin TOTP',
    });

    if (error) {
      console.error('MFA enrollment error:', error);
      // If factor name already exists, it usually means TOTP is already enrolled (verified).
      // In that case we should move user to OTP verification flow.
      if ((error as any).code === 'mfa_factor_name_conflict') {
        setMfaRequired(true);
      }
      return null;
    }

    console.log('MFA enrolled:', data.id);
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  };

  const getUnverifiedFactor = async (): Promise<{ factorId: string } | null> => {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const unverifiedFactors = factorsData?.totp?.filter(f => (f.status as string) === 'unverified') || [];
    
    if (unverifiedFactors.length > 0) {
      return { factorId: unverifiedFactors[0].id };
    }
    return null;
  };

  const verifyMfaEnrollment = async (code: string, factorId: string) => {
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      return { error: challengeError };
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setMfaRequired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        mfaRequired,
        signIn,
        verifyOtp,
        signOut,
        enrollMfa,
        verifyMfaEnrollment,
        getUnverifiedFactor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In normal runtime this should never happen. If it does (e.g. transient HMR state),
    // fail safe by returning a non-loading anonymous state so routes can redirect.
    console.warn('useAuth called outside AuthProvider - returning safe defaults');
    return {
      user: null,
      session: null,
      isAdmin: false,
      isLoading: false,
      mfaRequired: false,
      signIn: async () => ({ error: { message: 'Auth context not ready' } as any }),
      verifyOtp: async () => ({ error: { message: 'Auth context not ready' } as any }),
      signOut: async () => {},
      enrollMfa: async () => null,
      verifyMfaEnrollment: async () => ({ error: { message: 'Auth context not ready' } as any }),
      getUnverifiedFactor: async () => null,
    };
  }
  return context;
};
