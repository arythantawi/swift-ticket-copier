import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, Calendar, User, Phone, Mail, MapPinned, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentInfoBooking from '@/components/PaymentInfoBooking';
import PaymentUpload from '@/components/PaymentUpload';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Price per passenger based on route (simplified)
const PRICE_PER_PASSENGER: { [key: string]: number } = {
  'Surabaya-Denpasar': 250000,
  'Malang-Denpasar': 275000,
  'Malang-Surabaya': 100000,
  'Surabaya-Malang': 100000,
  'Blitar-Surabaya': 125000,
  'Surabaya-Blitar': 125000,
  'Kediri-Surabaya': 125000,
  'Surabaya-Kediri': 125000,
  'Banyuwangi-Surabaya': 175000,
  'Surabaya-Banyuwangi': 175000,
  'Trenggalek-Surabaya': 150000,
  'Surabaya-Trenggalek': 150000,
  'Ponorogo-Surabaya': 150000,
  'Surabaya-Ponorogo': 150000,
  'Jember-Surabaya': 150000,
  'Surabaya-Jember': 150000,
  'Jakarta-Surabaya': 400000,
  'Surabaya-Jakarta': 400000,
  'Jogja-Surabaya': 200000,
  'Surabaya-Jogja': 200000,
  'default': 150000,
};

const getPrice = (from: string, to: string): number => {
  const key = `${from}-${to}`;
  return PRICE_PER_PASSENGER[key] || PRICE_PER_PASSENGER['default'];
};

type BookingStep = 'form' | 'payment' | 'success';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>('form');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentUploaded, setPaymentUploaded] = useState(false);
  
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const via = searchParams.get('via') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  
  const pricePerPerson = getPrice(from, to);
  const totalPrice = pricePerPerson * passengers;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pickupAddress: '',
    notes: '',
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.pickupAddress) {
      toast.error('Mohon lengkapi data yang diperlukan');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          pickup_address: formData.pickupAddress,
          notes: formData.notes || null,
          route_from: from,
          route_to: to,
          route_via: via || null,
          pickup_time: pickupTime,
          travel_date: date,
          passengers: passengers,
          total_price: totalPrice,
          payment_status: 'pending',
          order_id: `TRV-${Date.now()}`,
        }])
        .select('order_id')
        .single();

      if (error) throw error;

      setOrderId(data.order_id);
      setCurrentStep('payment');
      toast.success('Pemesanan berhasil dibuat!');

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Gagal membuat pemesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentUploadSuccess = () => {
    setPaymentUploaded(true);
    setCurrentStep('success');
  };

  // Success Screen
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container max-w-2xl">
            <div className="elevated-card p-8 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Pembayaran Sedang Diverifikasi
              </h1>
              <p className="text-muted-foreground mb-6">
                Terima kasih, {formData.name}. Bukti pembayaran Anda sedang kami periksa. 
                Konfirmasi akan dikirim melalui WhatsApp dalam 1x24 jam.
              </p>
              
              <div className="bg-secondary/50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-semibold text-foreground mb-4">Detail Pemesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-bold">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rute</span>
                    <span className="font-medium">{from} → {via && `${via} → `}{to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal</span>
                    <span className="font-medium">{formatDate(date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jam Penjemputan</span>
                    <span className="font-medium">{pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah Penumpang</span>
                    <span className="font-medium">{passengers} orang</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-accent">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => navigate('/')} className="btn-gold">
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Payment Screen
  if (currentStep === 'payment') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep('form')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Form
            </Button>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Payment Info */}
              <div>
                <PaymentInfoBooking orderId={orderId} totalPrice={totalPrice} />
              </div>

              {/* Upload & Summary */}
              <div className="space-y-6">
                <PaymentUpload 
                  orderId={orderId} 
                  onUploadSuccess={handlePaymentUploadSuccess}
                />

                {/* Trip Summary */}
                <div className="elevated-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">
                    Ringkasan Perjalanan
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rute</span>
                      <span className="font-medium text-foreground">
                        {from} {via && `→ ${via}`} → {to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal</span>
                      <span className="font-medium text-foreground">{formatDate(date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jam Penjemputan</span>
                      <span className="font-medium text-foreground">{pickupTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Penumpang</span>
                      <span className="font-medium text-foreground">{passengers} orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Harga/orang</span>
                      <span className="font-medium text-foreground">{formatPrice(pricePerPerson)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Booking Form Screen
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="md:col-span-2">
              <div className="glass-card rounded-2xl p-6">
                <h1 className="font-display text-2xl font-bold text-foreground mb-6">
                  Form Pemesanan
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Nomor WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email (Opsional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@contoh.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Alamat Penjemputan *
                    </label>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleInputChange}
                        placeholder="Masukkan alamat lengkap untuk penjemputan"
                        className="pl-10 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Catatan Tambahan
                    </label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Catatan khusus untuk perjalanan Anda"
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-gold py-6 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="elevated-card p-6 sticky top-24">
                <h3 className="font-display font-semibold text-foreground mb-4">
                  Ringkasan Perjalanan
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rute</p>
                      <p className="font-medium text-foreground">
                        {from} {via && `→ ${via}`} → {to}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal</p>
                      <p className="font-medium text-foreground">{formatDate(date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jam Penjemputan</p>
                      <p className="font-medium text-foreground">{pickupTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jumlah Penumpang</p>
                      <p className="font-medium text-foreground">{passengers} orang</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harga/orang</span>
                    <span className="text-foreground">{formatPrice(pricePerPerson)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penumpang</span>
                    <span className="text-foreground">× {passengers}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent text-xl">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;