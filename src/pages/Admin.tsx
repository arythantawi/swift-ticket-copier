import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  ExternalLink, 
  Calendar, 
  Users, 
  MapPin, 
  Phone,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface Booking {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pickup_address: string;
  notes: string | null;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  travel_date: string;
  passengers: number;
  total_price: number;
  payment_status: string;
  payment_proof_url: string | null;
  payment_proof_drive_id: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Gagal memuat data pemesanan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: newStatus })
        .eq('order_id', orderId);

      if (error) throw error;
      
      toast.success(`Status berhasil diubah ke ${getStatusLabel(newStatus)}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengubah status');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Pembayaran';
      case 'waiting_verification': return 'Menunggu Verifikasi';
      case 'paid': return 'Lunas';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Menunggu Pembayaran</Badge>;
      case 'waiting_verification':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Menunggu Verifikasi</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Lunas</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <Button onClick={fetchBookings} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari Order ID, nama, atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                <SelectItem value="waiting_verification">Menunggu Verifikasi</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Pesanan</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu Pembayaran</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
              {bookings.filter(b => b.payment_status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-400">Menunggu Verifikasi</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {bookings.filter(b => b.payment_status === 'waiting_verification').length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400">Lunas</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">
              {bookings.filter(b => b.payment_status === 'paid').length}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data pemesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Order Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono font-bold text-foreground">{booking.order_id}</p>
                      </div>
                      {getStatusBadge(booking.payment_status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{booking.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.passengers} penumpang</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${booking.customer_phone}`} className="text-primary hover:underline">
                            {booking.customer_phone}
                          </a>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {booking.route_from} → {booking.route_via && `${booking.route_via} → `}{booking.route_to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatDate(booking.travel_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">Jemput: {booking.pickup_time}</span>
                        </div>
                      </div>
                    </div>

                    {booking.pickup_address && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Alamat Penjemputan:</p>
                        <p className="text-sm text-foreground">{booking.pickup_address}</p>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Catatan:</p>
                        <p className="text-sm text-foreground">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-accent">{formatPrice(booking.total_price)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Dibuat: {formatDateTime(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-64 space-y-3 lg:border-l lg:border-border lg:pl-6">
                    {booking.payment_proof_url && (
                      <a
                        href={booking.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Bukti Transfer
                      </a>
                    )}

                    {booking.payment_status === 'waiting_verification' && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => updatePaymentStatus(booking.order_id, 'paid')}
                          disabled={isUpdating === booking.order_id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Verifikasi Lunas
                        </Button>
                        <Button
                          onClick={() => updatePaymentStatus(booking.order_id, 'pending')}
                          disabled={isUpdating === booking.order_id}
                          variant="outline"
                          className="w-full"
                        >
                          Tolak Bukti
                        </Button>
                      </div>
                    )}

                    {booking.payment_status === 'pending' && (
                      <Button
                        onClick={() => updatePaymentStatus(booking.order_id, 'cancelled')}
                        disabled={isUpdating === booking.order_id}
                        variant="destructive"
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Batalkan
                      </Button>
                    )}

                    {booking.payment_status === 'cancelled' && (
                      <Button
                        onClick={() => updatePaymentStatus(booking.order_id, 'pending')}
                        disabled={isUpdating === booking.order_id}
                        variant="outline"
                        className="w-full"
                      >
                        Aktifkan Kembali
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;