import { useRef, useEffect, useState } from 'react';
import { Copy, Check, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import gsap from 'gsap';

interface PaymentInfoProps {
  orderId: string;
  totalPrice: number;
}

const PaymentInfoBooking = ({ orderId, totalPrice }: PaymentInfoProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bank: 'BCA',
    accountNumber: '0613002917',
    accountName: 'Muhammad Nur Huda',
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} berhasil disalin!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div ref={sectionRef} className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Order ID</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">{orderId}</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(orderId, 'Order ID')}>
            {copiedField === 'Order ID' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
        <p className="text-3xl font-bold text-accent">{formatPrice(totalPrice)}</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Transfer Bank</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Bank</p>
            <p className="text-lg font-bold text-foreground">{bankDetails.bank}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Nomor Rekening</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold font-mono text-foreground">{bankDetails.accountNumber}</p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.accountNumber, 'Nomor Rekening')}>
                {copiedField === 'Nomor Rekening' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Atas Nama</p>
            <p className="text-lg font-bold text-foreground">{bankDetails.accountName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoBooking;