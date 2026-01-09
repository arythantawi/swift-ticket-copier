import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail, Smartphone, Key, Loader2, RefreshCw } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, authReady, mfaRequired, signIn, verifyOtp, enrollMfa, verifyMfaEnrollment, resetMfa } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // MFA Enrollment states
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (authReady && !isLoading && user && isAdmin && !mfaRequired) {
      navigate('/admin');
    }
  }, [user, isAdmin, isLoading, authReady, mfaRequired, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: result.error.message,
        });
        return;
      }

      if ('mfaRequired' in result && result.mfaRequired) {
        // MFA already set up and verified, show OTP input
        return;
      }

      // Need to enroll or re-enroll MFA (handles both new enrollment and unverified factors)
      const needsEnrollment = 'needsEnrollment' in result && result.needsEnrollment;
      const hasUnverifiedFactor = 'hasUnverifiedFactor' in result && result.hasUnverifiedFactor;
      
      if (needsEnrollment || hasUnverifiedFactor) {
        const mfaData = await enrollMfa();
        if (mfaData) {
          setQrCode(mfaData.qrCode);
          setSecret(mfaData.secret);
          setFactorId(mfaData.factorId);
          setShowMfaSetup(true);
          return;
        }

        // If enroll failed because factor already exists, we should show OTP verification UI
        if (mfaRequired) {
          toast({
            title: '2FA sudah aktif',
            description: 'Buka Google Authenticator dan masukkan kode 6 digit.',
          });
          return;
        }

        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal menampilkan QR 2FA. Coba login ulang.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await verifyOtp(otpCode);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Verifikasi Gagal',
          description: 'Kode OTP tidak valid',
        });
        setOtpCode('');
        return;
      }

      toast({
        title: 'Berhasil',
        description: 'Login berhasil!',
      });
      navigate('/admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset2FA = async () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Masukkan email dan password terlebih dahulu',
      });
      return;
    }

    setIsResetting(true);
    try {
      // First sign in
      const result = await signIn(email, password);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: result.error.message,
        });
        return;
      }

      // Reset MFA (unenroll all, enroll new)
      const mfaData = await resetMfa();
      if (mfaData) {
        setQrCode(mfaData.qrCode);
        setSecret(mfaData.secret);
        setFactorId(mfaData.factorId);
        setShowMfaSetup(true);
        toast({
          title: '2FA Direset',
          description: 'Scan QR code baru dengan Google Authenticator',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal reset 2FA',
        });
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleEnrollmentVerify = async () => {
    if (enrollmentCode.length !== 6) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await verifyMfaEnrollment(enrollmentCode, factorId);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Verifikasi Gagal',
          description: 'Kode OTP tidak valid',
        });
        setEnrollmentCode('');
        return;
      }

      toast({
        title: 'Berhasil',
        description: '2FA berhasil diaktifkan!',
      });
      setShowMfaSetup(false);
      navigate('/admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (user && !authReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

        {/* MFA Setup Card */}
        {showMfaSetup ? (
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-2">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Setup 2FA</CardTitle>
              <CardDescription>
                Scan QR code dengan Google Authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-inner">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Secret Key (backup):</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all font-mono">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast({ title: 'Disalin!' });
                    }}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-3">
                <Label>Masukkan kode dari aplikasi:</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={enrollmentCode}
                    onChange={setEnrollmentCode}
                    maxLength={6}
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

              <Button
                onClick={handleEnrollmentVerify}
                disabled={enrollmentCode.length !== 6 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Aktifkan 2FA'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : mfaRequired ? (
          /* OTP Verification Card */
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mx-auto mb-2">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Verifikasi 2FA</CardTitle>
              <CardDescription>
                Masukkan kode dari Google Authenticator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  value={otpCode}
                  onChange={setOtpCode}
                  maxLength={6}
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

              <Button
                onClick={handleVerifyOtp}
                disabled={otpCode.length !== 6 || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Verifikasi'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Login Card */
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle>Masuk ke Dashboard</CardTitle>
              <CardDescription>
                Masukkan kredensial admin Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || isResetting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">atau</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleReset2FA}
                  disabled={isSubmitting || isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mereset 2FA...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset 2FA (QR Baru)
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Dilindungi dengan autentikasi 2 faktor
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
