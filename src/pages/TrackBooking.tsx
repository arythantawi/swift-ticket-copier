import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface BookingData {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  travel_date: string;
  pickup_time: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_address: string;
  dropoff_address: string | null;
  passengers: number;
  total_price: number;
  payment_status: string;
  created_at: string;
}

const TrackBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error("Masukkan Order ID");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .rpc('get_booking_by_order_id', { p_order_id: orderId.trim().toUpperCase() });

      if (error) {
        console.error('Error fetching booking:', error);
        toast.error("Gagal mencari pesanan");
        setBooking(null);
        return;
      }

      if (data && data.length > 0) {
        setBooking(data[0] as BookingData);
      } else {
        setBooking(null);
        toast.error("Pesanan tidak ditemukan");
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error("Terjadi kesalahan");
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
            <CheckCircle className="w-3 h-3" />
            Terverifikasi
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1">
            <AlertCircle className="w-3 h-3" />
            Menunggu Pembayaran
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {status}
          </Badge>
        );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Cek Status Pesanan</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Lacak Pesanan Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Masukkan Order ID (contoh: TRV-20260112-XXXX)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Booking Result */}
        {searched && !isLoading && (
          <>
            {booking ? (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">Detail Pesanan</CardTitle>
                    {getStatusBadge(booking.payment_status)}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {booking.order_id}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Informasi Pelanggan
                    </h3>
                    <p className="font-semibold">{booking.customer_name}</p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {booking.customer_phone}
                    </p>
                  </div>

                  {/* Travel Info */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Informasi Perjalanan
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {format(new Date(booking.travel_date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{booking.pickup_time} WIB</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{booking.passengers} Penumpang</span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Rute Perjalanan
                    </h3>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="w-0.5 h-8 bg-border" />
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="font-medium">{booking.route_from}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.pickup_address}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{booking.route_to}</p>
                          {booking.dropoff_address && (
                            <p className="text-sm text-muted-foreground">
                              {booking.dropoff_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.route_via && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Via {booking.route_via}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                    <span className="font-medium">Total Pembayaran</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>

                  {/* Status Message */}
                  {booking.payment_status === 'pending' && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Info:</strong> Silakan lakukan pembayaran dan unggah bukti transfer. 
                        Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam.
                      </p>
                    </div>
                  )}

                  {booking.payment_status === 'verified' && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Pembayaran Terverifikasi!</strong> Tiket Anda sudah aktif. 
                        Simpan Order ID ini sebagai referensi saat keberangkatan.
                      </p>
                    </div>
                  )}

                  {booking.payment_status === 'rejected' && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Pembayaran Ditolak.</strong> Silakan hubungi customer service 
                        untuk informasi lebih lanjut.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Pesanan Tidak Ditemukan</h3>
                  <p className="text-muted-foreground text-sm">
                    Pastikan Order ID yang Anda masukkan sudah benar.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Help Text */}
        {!searched && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Masukkan Order ID yang Anda terima saat melakukan pemesanan.</p>
            <p className="mt-1">Format: TRV-YYYYMMDD-XXXX</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackBooking;
