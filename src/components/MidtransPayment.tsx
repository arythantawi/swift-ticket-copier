import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, AlertCircle, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError: (result: unknown) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

interface MidtransPaymentProps {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  itemDetails?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: (error: string) => void;
}

const MidtransPayment = ({
  orderId,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone,
  itemDetails,
  onSuccess,
  onPending,
  onError,
}: MidtransPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'pending' | 'error'>('idle');
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);
  const [clientKey, setClientKey] = useState<string | null>(null);

  // Fetch client key from edge function
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-midtrans-client-key');
        if (error) throw error;
        if (data?.client_key) {
          setClientKey(data.client_key);
        }
      } catch (err) {
        console.error('Failed to fetch Midtrans client key:', err);
      }
    };
    fetchClientKey();
  }, []);

  // Load Midtrans Snap script when client key is available
  useEffect(() => {
    if (!clientKey) return;

    const existingScript = document.getElementById('midtrans-snap');
    if (existingScript) {
      // Update client key if script already exists
      existingScript.setAttribute('data-client-key', clientKey);
      setIsSnapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'midtrans-snap';
    // Use sandbox URL for testing, production for live
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => setIsSnapLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap');
      toast.error('Gagal memuat payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script on cleanup to avoid reloading
    };
  }, [clientKey]);

  const openSnapPopup = useCallback((token: string) => {
    if (!isSnapLoaded || !window.snap) {
      console.error('Snap not loaded');
      return;
    }

    window.snap.pay(token, {
      onSuccess: (result) => {
        console.log('Payment success:', result);
        setPaymentStatus('success');
        toast.success('Pembayaran berhasil!');
        onSuccess?.();
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        setPaymentStatus('pending');
        toast.info('Pembayaran sedang diproses');
        onPending?.();
      },
      onError: (result) => {
        console.error('Payment error:', result);
        setPaymentStatus('error');
        toast.error('Pembayaran gagal');
        onError?.('Payment failed');
      },
      onClose: () => {
        console.log('Payment popup closed');
        if (paymentStatus === 'processing') {
          setPaymentStatus('idle');
          toast.info('Pembayaran dibatalkan');
        }
      },
    });
  }, [isSnapLoaded, paymentStatus, onSuccess, onPending, onError]);

  const createTransaction = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      const { data, error } = await supabase.functions.invoke('create-midtrans-transaction', {
        body: {
          order_id: orderId,
          gross_amount: grossAmount,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          item_details: itemDetails || [
            {
              id: 'TICKET',
              name: `Tiket Travel ${orderId}`,
              price: grossAmount,
              quantity: 1,
            }
          ],
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create transaction');

      setSnapToken(data.token);
      setRedirectUrl(data.redirect_url);
      
      // Try to open Snap popup
      if (isSnapLoaded && window.snap && data.token) {
        openSnapPopup(data.token);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      setPaymentStatus('error');
      toast.error('Gagal membuat transaksi pembayaran');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const openRedirectUrl = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
          Pembayaran Berhasil!
        </h3>
        <p className="text-green-600 dark:text-green-300">
          Terima kasih, pembayaran Anda telah dikonfirmasi.
        </p>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
          Menunggu Pembayaran
        </h3>
        <p className="text-yellow-600 dark:text-yellow-300 mb-4">
          Silakan selesaikan pembayaran Anda.
        </p>
        {redirectUrl && (
          <Button onClick={openRedirectUrl} variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Lanjutkan Pembayaran
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pembayaran Online</h3>
            <p className="text-sm text-muted-foreground">Powered by Midtrans</p>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Pembayaran</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(grossAmount)}</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          <p className="mb-2">Metode pembayaran yang tersedia:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'QRIS', icon: '📱' },
              { name: 'GoPay', icon: '💚' },
              { name: 'OVO', icon: '💜' },
              { name: 'DANA', icon: '💙' },
              { name: 'Bank Transfer', icon: '🏦' },
              { name: 'Kartu Kredit', icon: '💳' },
            ].map((method) => (
              <span key={method.name} className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg text-xs">
                <span>{method.icon}</span>
                <span>{method.name}</span>
              </span>
            ))}
          </div>
        </div>

        <Button
          onClick={createTransaction}
          disabled={isLoading || !clientKey}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Bayar Sekarang
            </>
          )}
        </Button>

        {!clientKey && (
          <p className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Memuat payment gateway...
          </p>
        )}

        {/* Fallback redirect button */}
        {redirectUrl && !isSnapLoaded && (
          <Button
            onClick={openRedirectUrl}
            variant="outline"
            className="w-full mt-2 gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Halaman Pembayaran
          </Button>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Transaksi aman & terenkripsi
      </p>
    </div>
  );
};

export default MidtransPayment;
