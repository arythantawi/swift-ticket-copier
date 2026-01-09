import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Log activity function
  const logActivity = async (
    action: string, 
    status: string, 
    userId?: string, 
    userEmail?: string,
    details?: Record<string, unknown>
  ) => {
    try {
      // Using any cast as types may not be updated yet
      await (supabase.from('admin_activity_logs') as any).insert({
        user_id: userId || null,
        user_email: userEmail || null,
        action,
        status,
        user_agent: navigator.userAgent,
        details: details || null,
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message;
        
        setLoginError(errorMessage);
        
        // Log failed login attempt
        await logActivity('admin_login', 'failed', undefined, email, {
          error: error.message,
        });
        
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: errorMessage,
        });
        return;
      }

      if (data.user) {
        // Check if user has admin role using direct query instead of RPC
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.error('Error checking role:', roleError);
          setLoginError('Gagal memeriksa hak akses');
          
          await logActivity('admin_login', 'error', data.user.id, data.user.email, {
            error: 'Failed to check admin role',
            roleError: roleError.message,
          });
          
          await supabase.auth.signOut();
          return;
        }

        if (!roleData) {
          setLoginError('Akun Anda tidak memiliki hak akses admin');
          
          await logActivity('admin_login', 'unauthorized', data.user.id, data.user.email, {
            reason: 'User does not have admin role',
          });
          
          toast({
            variant: 'destructive',
            title: 'Akses Ditolak',
            description: 'Akun Anda tidak memiliki hak akses admin',
          });
          
          await supabase.auth.signOut();
          return;
        }

        // Log successful login
        await logActivity('admin_login', 'success', data.user.id, data.user.email);

        toast({
          title: 'Berhasil',
          description: 'Login berhasil! Mengalihkan ke dashboard...',
        });
        
        // Navigate to admin dashboard
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Terjadi kesalahan saat login');
      
      await logActivity('admin_login', 'error', undefined, email, {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already logged in as admin, show loading while redirecting
  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-1">Travel Express Dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Masuk ke Dashboard</CardTitle>
            <CardDescription>
              Masukkan kredensial admin Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Akses khusus administrator
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
