import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield, Smartphone } from 'lucide-react';
import logo44Trans from '@/assets/logo-44trans.png';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Helper function to log admin activity
const logAdminLogin = async (email: string) => {
  try {
    await (supabase as any).from('admin_activity_logs').insert({
      user_email: email,
      action: 'login',
      details: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error logging login:', error);
  }
};

// Helper function to update MFA status in admin_profiles
const updateMFAStatus = async (userId: string, enabled: boolean) => {
  try {
    await (supabase as any)
      .from('admin_profiles')
      .update({ is_mfa_enabled: enabled })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating MFA status:', error);
  }
};

type LoginStep = 'credentials' | 'mfa-verify' | 'mfa-enroll';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // MFA states
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [totpCode, setTotpCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [newFactorId, setNewFactorId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Email atau password salah');
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Gagal login, silakan coba lagi');
        setIsLoading(false);
        return;
      }

      // Check if user has admin or super_admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .in('role', ['admin', 'super_admin']);

      if (roleError || !roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        setError('Anda tidak memiliki akses admin');
        setIsLoading(false);
        return;
      }

      // Check if user is super_admin
      const isSuperAdmin = roleData.some(r => r.role === 'super_admin');

      // Check MFA factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('Error listing factors:', factorsError);
        setError('Gagal memeriksa status 2FA');
        setIsLoading(false);
        return;
      }

      const totpFactors = factorsData?.totp || [];
      const verifiedFactor = totpFactors.find(f => f.status === 'verified');
      
      if (verifiedFactor) {
        // User has MFA enabled, require verification
        setFactorId(verifiedFactor.id);
        setLoginStep('mfa-verify');
        setIsLoading(false);
      } else if (isSuperAdmin) {
        // Only super_admin MUST have MFA - require enrollment
        await enrollMFA();
      } else {
        // Regular admin without MFA can proceed directly
        await logAdminLogin(authData.user.email || '');
        toast.success('Login berhasil!');
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan, silakan coba lagi');
      setIsLoading(false);
    }
  };

  const enrollMFA = async () => {
    try {
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Google Authenticator'
      });

      if (enrollError) {
        console.error('MFA enroll error:', enrollError);
        setError('Gagal mendaftarkan 2FA');
        setIsLoading(false);
        return;
      }

      if (enrollData?.totp?.qr_code && enrollData?.totp?.secret) {
        setQrCode(enrollData.totp.qr_code);
        setSecret(enrollData.totp.secret);
        setNewFactorId(enrollData.id);
        setLoginStep('mfa-enroll');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Enroll error:', err);
      setError('Gagal mendaftarkan 2FA');
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (totpCode.length !== 6) {
      setError('Masukkan 6 digit kode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId!,
      });

      if (challengeError) {
        console.error('Challenge error:', challengeError);
        setError('Gagal memverifikasi, silakan coba lagi');
        setIsLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId!,
        challengeId: challengeData.id,
        code: totpCode,
      });

      if (verifyError) {
        setError('Kode tidak valid, silakan coba lagi');
        setTotpCode('');
        setIsLoading(false);
        return;
      }

      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logAdminLogin(user.email || '');
      }

      toast.success('Login berhasil!');
      navigate('/admin');
    } catch (err) {
      console.error('Verify error:', err);
      setError('Terjadi kesalahan, silakan coba lagi');
      setIsLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (totpCode.length !== 6) {
      setError('Masukkan 6 digit kode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: newFactorId!,
      });

      if (challengeError) {
        console.error('Challenge error:', challengeError);
        setError('Gagal memverifikasi, silakan coba lagi');
        setIsLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: newFactorId!,
        challengeId: challengeData.id,
        code: totpCode,
      });

      if (verifyError) {
        setError('Kode tidak valid, silakan coba lagi');
        setTotpCode('');
        setIsLoading(false);
        return;
      }

      // Get current user and update MFA status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateMFAStatus(user.id, true);
        await logAdminLogin(user.email || '');
      }

      toast.success('2FA berhasil diaktifkan! Login berhasil.');
      navigate('/admin');
    } catch (err) {
      console.error('Verify enrollment error:', err);
      setError('Terjadi kesalahan, silakan coba lagi');
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await supabase.auth.signOut();
    setLoginStep('credentials');
    setTotpCode('');
    setError('');
    setQrCode(null);
    setSecret(null);
  };

  // Render credentials form
  const renderCredentialsForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
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
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );

  // Render MFA verification form
  const renderMFAVerifyForm = () => (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Buka aplikasi Google Authenticator dan masukkan 6 digit kode yang ditampilkan
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={totpCode}
          onChange={(value) => setTotpCode(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}>
          Kembali
        </Button>
        <Button onClick={verifyMFA} className="flex-1" disabled={isLoading || totpCode.length !== 6}>
          {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
        </Button>
      </div>
    </div>
  );

  // Render MFA enrollment form
  const renderMFAEnrollForm = () => (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <h3 className="font-semibold">Aktifkan Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Scan QR code di bawah dengan Google Authenticator atau aplikasi TOTP lainnya
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        </div>
      )}

      {secret && (
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground mb-1">Atau masukkan kode ini secara manual:</p>
          <code className="text-sm font-mono break-all select-all">{secret}</code>
        </div>
      )}

      <div className="space-y-2">
        <Label>Masukkan 6 digit kode dari aplikasi</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={totpCode}
            onChange={(value) => setTotpCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isLoading}>
          Batal
        </Button>
        <Button onClick={verifyEnrollment} className="flex-1" disabled={isLoading || totpCode.length !== 6}>
          {isLoading ? 'Mengaktifkan...' : 'Aktifkan 2FA'}
        </Button>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (loginStep) {
      case 'mfa-verify':
        return 'Verifikasi 2FA';
      case 'mfa-enroll':
        return 'Setup 2FA';
      default:
        return 'Admin Login';
    }
  };

  const getDescription = () => {
    switch (loginStep) {
      case 'mfa-verify':
        return 'Masukkan kode dari Google Authenticator';
      case 'mfa-enroll':
        return 'Amankan akun dengan Two-Factor Authentication';
      default:
        return 'Masuk ke panel administrasi';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full border-2 border-primary/50 bg-white p-1 shadow-lg flex items-center justify-center">
            <img 
              src={logo44Trans} 
              alt="44 Trans Jawa Bali" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loginStep === 'credentials' && renderCredentialsForm()}
          {loginStep === 'mfa-verify' && renderMFAVerifyForm()}
          {loginStep === 'mfa-enroll' && renderMFAEnrollForm()}

          {loginStep === 'credentials' && (
            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                ← Kembali ke Beranda
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;