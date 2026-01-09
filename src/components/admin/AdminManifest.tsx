import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  RefreshCw,
  Calendar,
  MapPin,
  Users,
  FileDown,
  Clock,
  Phone,
  Car,
  User,
  Package,
  Luggage,
  AlertCircle
} from 'lucide-react';
import { generateManifestPdf, ManifestData, ManifestPassenger } from '@/lib/generateManifestPdf';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Booking {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string | null;
  notes: string | null;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  travel_date: string;
  passengers: number;
  payment_status: string;
  has_large_luggage: boolean | null;
  luggage_description: string | null;
  has_package_delivery: boolean | null;
  package_description: string | null;
  special_requests: string | null;
}

interface TripOperation {
  id: string;
  trip_date: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
}

const AdminManifest = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tripOperations, setTripOperations] = useState<TripOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [isManifestDialogOpen, setIsManifestDialogOpen] = useState(false);
  const [manifestConfig, setManifestConfig] = useState({
    agentName: 'Obie Travel',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .neq('payment_status', 'cancelled')
        .order('pickup_time', { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings((bookingsData || []) as Booking[]);

      // Fetch trip operations for driver info
      const { data: tripsData, error: tripsError } = await supabase
        .from('trip_operations')
        .select('id, trip_date, route_from, route_to, route_via, pickup_time, driver_name, driver_phone, vehicle_number')
        .order('trip_date', { ascending: false });

      if (tripsError) throw tripsError;
      setTripOperations((tripsData || []) as TripOperation[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAvailableDates = () => {
    const dates = new Set(bookings.map(b => b.travel_date));
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const getAvailableRoutes = () => {
    const routes = new Set(
      bookings
        .filter(b => b.travel_date === dateFilter)
        .map(b => `${b.route_from}-${b.route_to}`)
    );
    return Array.from(routes);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesDate = booking.travel_date === dateFilter;
    const matchesRoute = routeFilter === 'all' || 
      `${booking.route_from}-${booking.route_to}` === routeFilter;
    return matchesDate && matchesRoute;
  });

  // Group bookings by pickup time and full route (from, via, to)
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const key = `${booking.pickup_time}-${booking.route_from}-${booking.route_via || ''}-${booking.route_to}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Belum Bayar</Badge>;
      case 'waiting_verification':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Verifikasi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenManifestDialog = (bookingsGroup: Booking[]) => {
    if (bookingsGroup.length === 0) return;

    const firstBooking = bookingsGroup[0];
    
    // Try to find matching trip operation for driver info
    const matchingTrip = tripOperations.find(trip => 
      trip.trip_date === firstBooking.travel_date &&
      trip.route_from === firstBooking.route_from &&
      trip.route_to === firstBooking.route_to &&
      trip.pickup_time === firstBooking.pickup_time
    );

    setManifestConfig({
      agentName: 'Obie Travel',
      driverName: matchingTrip?.driver_name || '',
      driverPhone: matchingTrip?.driver_phone || '',
      vehicleNumber: matchingTrip?.vehicle_number || '',
    });

    setIsManifestDialogOpen(true);
  };

  const handleGenerateManifest = (bookingsGroup: Booking[]) => {
    if (bookingsGroup.length === 0) return;

    const firstBooking = bookingsGroup[0];

    const passengers: ManifestPassenger[] = bookingsGroup.map(booking => ({
      name: booking.customer_name,
      phone: booking.customer_phone,
      pickupAddress: booking.pickup_address,
      dropoffAddress: booking.dropoff_address,
      passengers: booking.passengers,
      notes: booking.notes,
      hasLargeLuggage: booking.has_large_luggage || false,
      luggageDescription: booking.luggage_description,
      hasPackageDelivery: booking.has_package_delivery || false,
      packageDescription: booking.package_description,
      specialRequests: booking.special_requests,
      paymentStatus: booking.payment_status,
    }));

    const manifestData: ManifestData = {
      agentName: manifestConfig.agentName,
      tripDate: firstBooking.travel_date,
      pickupTime: firstBooking.pickup_time,
      routeFrom: firstBooking.route_from,
      routeTo: firstBooking.route_to,
      routeVia: firstBooking.route_via,
      vehicleNumber: manifestConfig.vehicleNumber || null,
      driverName: manifestConfig.driverName || null,
      driverPhone: manifestConfig.driverPhone || null,
      passengers,
    };

    generateManifestPdf(manifestData);
    setIsManifestDialogOpen(false);
    toast.success('Manifes berhasil diunduh');
  };

  const getTotalPassengers = (bookingsGroup: Booking[]) => {
    return bookingsGroup.reduce((sum, b) => sum + b.passengers, 0);
  };

  const getPaidCount = (bookingsGroup: Booking[]) => {
    return bookingsGroup.filter(b => b.payment_status === 'paid').length;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Tanggal</Label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setRouteFilter('all');
              }}
              className="w-[180px]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rute</Label>
            <Select value={routeFilter} onValueChange={setRouteFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih rute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rute</SelectItem>
                {getAvailableRoutes().map(route => (
                  <SelectItem key={route} value={route}>
                    {route.replace('-', ' → ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Tanggal</p>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatDate(dateFilter).split(',')[0]}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Trip</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Object.keys(groupedBookings).length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Penumpang</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {filteredBookings.reduce((sum, b) => sum + b.passengers, 0)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">Lunas</p>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            {filteredBookings.filter(b => b.payment_status === 'paid').length}/{filteredBookings.length}
          </p>
        </div>
      </div>

      {/* Trips List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Tidak ada data perjalanan untuk tanggal ini</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookings).map(([key, bookingsGroup]) => {
            const firstBooking = bookingsGroup[0];
            const route = firstBooking.route_via 
              ? `${firstBooking.route_from} → ${firstBooking.route_via} → ${firstBooking.route_to}`
              : `${firstBooking.route_from} → ${firstBooking.route_to}`;

            return (
              <div key={key} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Trip Header */}
                <div className="bg-primary/5 dark:bg-primary/10 p-4 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-xl font-bold text-foreground">{firstBooking.pickup_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{route}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Penumpang</p>
                        <p className="text-lg font-bold text-foreground">{getTotalPassengers(bookingsGroup)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Lunas</p>
                        <p className="text-lg font-bold text-green-600">{getPaidCount(bookingsGroup)}/{bookingsGroup.length}</p>
                      </div>
                      <Button onClick={() => handleOpenManifestDialog(bookingsGroup)}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Cetak Manifes
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Passengers List */}
                <div className="divide-y divide-border">
                  {bookingsGroup.map((booking, index) => (
                    <div key={booking.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">{booking.customer_name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{booking.customer_phone}</span>
                                <span>•</span>
                                <Users className="w-3 h-3" />
                                <span>{booking.passengers} orang</span>
                              </div>
                            </div>
                            {getPaymentBadge(booking.payment_status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Jemput</p>
                                <p className="text-foreground">{booking.pickup_address}</p>
                              </div>
                            </div>
                            {booking.dropoff_address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Antar</p>
                                  <p className="text-foreground">{booking.dropoff_address}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Special Info */}
                          <div className="flex flex-wrap gap-2">
                            {booking.has_large_luggage && (
                              <Badge variant="outline" className="gap-1">
                                <Luggage className="w-3 h-3" />
                                Barang Besar
                                {booking.luggage_description && `: ${booking.luggage_description}`}
                              </Badge>
                            )}
                            {booking.has_package_delivery && (
                              <Badge variant="outline" className="gap-1">
                                <Package className="w-3 h-3" />
                                Titipan
                                {booking.package_description && `: ${booking.package_description}`}
                              </Badge>
                            )}
                            {booking.special_requests && (
                              <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                                <AlertCircle className="w-3 h-3" />
                                {booking.special_requests}
                              </Badge>
                            )}
                            {booking.notes && (
                              <Badge variant="secondary" className="gap-1">
                                📝 {booking.notes}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manifest Config Dialog */}
      <Dialog open={isManifestDialogOpen} onOpenChange={setIsManifestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cetak Manifes</DialogTitle>
            <DialogDescription>
              Lengkapi data sopir dan armada untuk manifes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Nama Agent Travel</Label>
              <Input
                id="agentName"
                value={manifestConfig.agentName}
                onChange={(e) => setManifestConfig({ ...manifestConfig, agentName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Nama Sopir</Label>
                <Input
                  id="driverName"
                  value={manifestConfig.driverName}
                  onChange={(e) => setManifestConfig({ ...manifestConfig, driverName: e.target.value })}
                  placeholder="Masukkan nama sopir"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">HP Sopir</Label>
                <Input
                  id="driverPhone"
                  value={manifestConfig.driverPhone}
                  onChange={(e) => setManifestConfig({ ...manifestConfig, driverPhone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Nomor Plat / Armada</Label>
              <Input
                id="vehicleNumber"
                value={manifestConfig.vehicleNumber}
                onChange={(e) => setManifestConfig({ ...manifestConfig, vehicleNumber: e.target.value })}
                placeholder="N 1234 AB"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManifestDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => {
              const key = Object.keys(groupedBookings)[0];
              if (key) {
                handleGenerateManifest(groupedBookings[key]);
              }
            }}>
              <FileDown className="w-4 h-4 mr-2" />
              Unduh PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManifest;
