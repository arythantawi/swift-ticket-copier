import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  RefreshCw,
  Search,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Fuel,
  Ship,
  UtensilsCrossed,
  Wallet,
  Car,
  CircleDollarSign,
  Calendar,
  FileDown
} from 'lucide-react';
import { generateOperationPdf } from '@/lib/generateOperationPdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface TripOperation {
  id: string;
  trip_date: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  total_passengers: number;
  income_tickets: number;
  income_other: number;
  expense_fuel: number;
  expense_ferry: number;
  expense_snack: number;
  expense_meals: number;
  expense_driver_commission: number;
  expense_driver_meals: number;
  expense_toll: number;
  expense_parking: number;
  expense_other: number;
  notes: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
  created_at: string;
  updated_at: string;
}

interface TripForm {
  trip_date: string;
  route_from: string;
  route_to: string;
  route_via: string;
  pickup_time: string;
  total_passengers: string;
  income_tickets: string;
  income_other: string;
  expense_fuel: string;
  expense_ferry: string;
  expense_snack: string;
  expense_meals: string;
  expense_driver_commission: string;
  expense_driver_meals: string;
  expense_toll: string;
  expense_parking: string;
  expense_other: string;
  notes: string;
  driver_name: string;
  vehicle_number: string;
}

const initialForm: TripForm = {
  trip_date: new Date().toISOString().split('T')[0],
  route_from: '',
  route_to: '',
  route_via: '',
  pickup_time: '',
  total_passengers: '0',
  income_tickets: '0',
  income_other: '0',
  expense_fuel: '0',
  expense_ferry: '0',
  expense_snack: '0',
  expense_meals: '0',
  expense_driver_commission: '0',
  expense_driver_meals: '0',
  expense_toll: '0',
  expense_parking: '0',
  expense_other: '0',
  notes: '',
  driver_name: '',
  vehicle_number: '',
};

const AdminOperations = () => {
  const [trips, setTrips] = useState<TripOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripOperation | null>(null);
  const [form, setForm] = useState<TripForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_operations')
        .select('*')
        .order('trip_date', { ascending: false })
        .order('pickup_time', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Gagal memuat data operasional');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleOpenDialog = (trip?: TripOperation) => {
    if (trip) {
      setEditingTrip(trip);
      setForm({
        trip_date: trip.trip_date,
        route_from: trip.route_from,
        route_to: trip.route_to,
        route_via: trip.route_via || '',
        pickup_time: trip.pickup_time,
        total_passengers: trip.total_passengers.toString(),
        income_tickets: trip.income_tickets.toString(),
        income_other: trip.income_other.toString(),
        expense_fuel: trip.expense_fuel.toString(),
        expense_ferry: trip.expense_ferry.toString(),
        expense_snack: trip.expense_snack.toString(),
        expense_meals: trip.expense_meals.toString(),
        expense_driver_commission: trip.expense_driver_commission.toString(),
        expense_driver_meals: trip.expense_driver_meals.toString(),
        expense_toll: trip.expense_toll.toString(),
        expense_parking: trip.expense_parking.toString(),
        expense_other: trip.expense_other.toString(),
        notes: trip.notes || '',
        driver_name: trip.driver_name || '',
        vehicle_number: trip.vehicle_number || '',
      });
    } else {
      setEditingTrip(null);
      setForm(initialForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrip(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.trip_date || !form.route_from || !form.route_to || !form.pickup_time) {
      toast.error('Mohon lengkapi semua field wajib');
      return;
    }

    setIsSaving(true);
    try {
      const tripData = {
        trip_date: form.trip_date,
        route_from: form.route_from.trim(),
        route_to: form.route_to.trim(),
        route_via: form.route_via.trim() || null,
        pickup_time: form.pickup_time.trim(),
        total_passengers: parseInt(form.total_passengers) || 0,
        income_tickets: parseInt(form.income_tickets) || 0,
        income_other: parseInt(form.income_other) || 0,
        expense_fuel: parseInt(form.expense_fuel) || 0,
        expense_ferry: parseInt(form.expense_ferry) || 0,
        expense_snack: parseInt(form.expense_snack) || 0,
        expense_meals: parseInt(form.expense_meals) || 0,
        expense_driver_commission: parseInt(form.expense_driver_commission) || 0,
        expense_driver_meals: parseInt(form.expense_driver_meals) || 0,
        expense_toll: parseInt(form.expense_toll) || 0,
        expense_parking: parseInt(form.expense_parking) || 0,
        expense_other: parseInt(form.expense_other) || 0,
        notes: form.notes.trim() || null,
        driver_name: form.driver_name.trim() || null,
        vehicle_number: form.vehicle_number.trim() || null,
      };

      if (editingTrip) {
        const { error } = await supabase
          .from('trip_operations')
          .update(tripData)
          .eq('id', editingTrip.id);

        if (error) throw error;
        toast.success('Data operasional berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('trip_operations')
          .insert([tripData]);

        if (error) throw error;
        toast.success('Data operasional berhasil ditambahkan');
      }

      handleCloseDialog();
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_operations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Data berhasil dihapus');
      fetchTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateTotals = (trip: TripOperation) => {
    const totalIncome = trip.income_tickets + trip.income_other;
    const totalExpense = 
      trip.expense_fuel + 
      trip.expense_ferry + 
      trip.expense_snack + 
      trip.expense_meals + 
      trip.expense_driver_commission + 
      trip.expense_driver_meals + 
      trip.expense_toll + 
      trip.expense_parking + 
      trip.expense_other;
    const profit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, profit };
  };

  const getOverallStats = () => {
    let totalPassengers = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    trips.forEach(trip => {
      totalPassengers += trip.total_passengers;
      const { totalIncome: ti, totalExpense: te } = calculateTotals(trip);
      totalIncome += ti;
      totalExpense += te;
    });

    return { totalPassengers, totalIncome, totalExpense, profit: totalIncome - totalExpense };
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.route_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.route_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip.driver_name && trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (dateFilter === 'all') return matchesSearch;
    
    const tripDate = new Date(trip.trip_date);
    const today = new Date();
    
    if (dateFilter === 'today') {
      return matchesSearch && tripDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && tripDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      return matchesSearch && 
        tripDate.getMonth() === today.getMonth() && 
        tripDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch;
  });

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Penumpang</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalPassengers}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">Pemasukan</p>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            {formatPrice(stats.totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-400">Pengeluaran</p>
          </div>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300">
            {formatPrice(stats.totalExpense)}
          </p>
        </div>
        <div className={`rounded-xl p-4 border ${stats.profit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CircleDollarSign className={`w-5 h-5 ${stats.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <p className={`text-sm ${stats.profit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>Profit</p>
          </div>
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-orange-800 dark:text-orange-300'}`}>
            {formatPrice(stats.profit)}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari rute atau driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter tanggal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTrips} variant="outline" size="icon">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTrip ? 'Edit Operasional' : 'Tambah Trip Baru'}</DialogTitle>
                <DialogDescription>
                  Catat data operasional trip termasuk penumpang, pemasukan, dan pengeluaran
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Trip Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trip_date">Tanggal *</Label>
                    <Input
                      id="trip_date"
                      type="date"
                      value={form.trip_date}
                      onChange={(e) => setForm({...form, trip_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_time">Jam Jemput *</Label>
                    <Input
                      id="pickup_time"
                      value={form.pickup_time}
                      onChange={(e) => setForm({...form, pickup_time: e.target.value})}
                      placeholder="16.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="route_from">Dari *</Label>
                    <Input
                      id="route_from"
                      value={form.route_from}
                      onChange={(e) => setForm({...form, route_from: e.target.value})}
                      placeholder="Surabaya"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route_via">Via</Label>
                    <Input
                      id="route_via"
                      value={form.route_via}
                      onChange={(e) => setForm({...form, route_via: e.target.value})}
                      placeholder="Malang"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route_to">Ke *</Label>
                    <Input
                      id="route_to"
                      value={form.route_to}
                      onChange={(e) => setForm({...form, route_to: e.target.value})}
                      placeholder="Denpasar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Nama Supir</Label>
                    <Input
                      id="driver_name"
                      value={form.driver_name}
                      onChange={(e) => setForm({...form, driver_name: e.target.value})}
                      placeholder="Nama supir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_number">Nomor Kendaraan</Label>
                    <Input
                      id="vehicle_number"
                      value={form.vehicle_number}
                      onChange={(e) => setForm({...form, vehicle_number: e.target.value})}
                      placeholder="L 1234 AB"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_passengers">Total Penumpang</Label>
                  <Input
                    id="total_passengers"
                    type="number"
                    value={form.total_passengers}
                    onChange={(e) => setForm({...form, total_passengers: e.target.value})}
                  />
                </div>

                {/* Income Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Pemasukan
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="income_tickets">Tiket (Rp)</Label>
                      <Input
                        id="income_tickets"
                        type="number"
                        value={form.income_tickets}
                        onChange={(e) => setForm({...form, income_tickets: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income_other">Lain-lain (Rp)</Label>
                      <Input
                        id="income_other"
                        type="number"
                        value={form.income_other}
                        onChange={(e) => setForm({...form, income_other: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Expense Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Pengeluaran
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense_fuel" className="flex items-center gap-1">
                        <Fuel className="w-3 h-3" /> Solar (Rp)
                      </Label>
                      <Input
                        id="expense_fuel"
                        type="number"
                        value={form.expense_fuel}
                        onChange={(e) => setForm({...form, expense_fuel: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_ferry" className="flex items-center gap-1">
                        <Ship className="w-3 h-3" /> Penyebrangan (Rp)
                      </Label>
                      <Input
                        id="expense_ferry"
                        type="number"
                        value={form.expense_ferry}
                        onChange={(e) => setForm({...form, expense_ferry: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_snack">Snack (Rp)</Label>
                      <Input
                        id="expense_snack"
                        type="number"
                        value={form.expense_snack}
                        onChange={(e) => setForm({...form, expense_snack: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_meals" className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3 h-3" /> Makan Penumpang (Rp)
                      </Label>
                      <Input
                        id="expense_meals"
                        type="number"
                        value={form.expense_meals}
                        onChange={(e) => setForm({...form, expense_meals: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_driver_commission" className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Komisi Supir (Rp)
                      </Label>
                      <Input
                        id="expense_driver_commission"
                        type="number"
                        value={form.expense_driver_commission}
                        onChange={(e) => setForm({...form, expense_driver_commission: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_driver_meals">Uang Makan Supir (Rp)</Label>
                      <Input
                        id="expense_driver_meals"
                        type="number"
                        value={form.expense_driver_meals}
                        onChange={(e) => setForm({...form, expense_driver_meals: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_toll" className="flex items-center gap-1">
                        <Car className="w-3 h-3" /> Tol (Rp)
                      </Label>
                      <Input
                        id="expense_toll"
                        type="number"
                        value={form.expense_toll}
                        onChange={(e) => setForm({...form, expense_toll: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_parking">Parkir (Rp)</Label>
                      <Input
                        id="expense_parking"
                        type="number"
                        value={form.expense_parking}
                        onChange={(e) => setForm({...form, expense_parking: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_other">Lain-lain (Rp)</Label>
                      <Input
                        id="expense_other"
                        type="number"
                        value={form.expense_other}
                        onChange={(e) => setForm({...form, expense_other: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    placeholder="Catatan tambahan..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Batal</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {editingTrip ? 'Simpan' : 'Tambah'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Trips List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada data operasional</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const { totalIncome, totalExpense, profit } = calculateTotals(trip);
            return (
              <div key={trip.id} className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.trip_date)}
                          <span className="mx-1">•</span>
                          <Clock className="w-4 h-4" />
                          {trip.pickup_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-semibold">
                            {trip.route_from} → {trip.route_via && `${trip.route_via} → `}{trip.route_to}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {trip.total_passengers} pax
                        </Badge>
                        <Badge className={profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {profit >= 0 ? '+' : ''}{formatPrice(profit)}
                        </Badge>
                      </div>
                    </div>

                    {/* Driver & Vehicle Info */}
                    {(trip.driver_name || trip.vehicle_number) && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {trip.driver_name && (
                          <span>🚗 {trip.driver_name}</span>
                        )}
                        {trip.vehicle_number && (
                          <span>📋 {trip.vehicle_number}</span>
                        )}
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-green-600 dark:text-green-400 font-medium">Pemasukan</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatPrice(totalIncome)}</p>
                        <div className="text-xs text-green-600/70 mt-1">
                          <div>Tiket: {formatPrice(trip.income_tickets)}</div>
                          {trip.income_other > 0 && <div>Lain: {formatPrice(trip.income_other)}</div>}
                        </div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <p className="text-red-600 dark:text-red-400 font-medium">Pengeluaran</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatPrice(totalExpense)}</p>
                        <div className="text-xs text-red-600/70 mt-1 space-y-0.5">
                          {trip.expense_fuel > 0 && <div>Solar: {formatPrice(trip.expense_fuel)}</div>}
                          {trip.expense_ferry > 0 && <div>Ferry: {formatPrice(trip.expense_ferry)}</div>}
                          {trip.expense_meals > 0 && <div>Makan: {formatPrice(trip.expense_meals)}</div>}
                          {trip.expense_driver_commission > 0 && <div>Komisi: {formatPrice(trip.expense_driver_commission)}</div>}
                        </div>
                      </div>
                      <div className={`rounded-lg p-3 ${profit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                        <p className={`font-medium ${profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Profit</p>
                        <p className={`text-lg font-bold ${profit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                          {formatPrice(profit)}
                        </p>
                      </div>
                    </div>

                    {trip.notes && (
                      <p className="text-sm text-muted-foreground mt-3 italic">📝 {trip.notes}</p>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:border-l lg:border-border lg:pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateOperationPdf(trip)}
                      className="text-primary"
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(trip)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Data trip {formatDate(trip.trip_date)} rute {trip.route_from} → {trip.route_to} akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(trip.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Total: {filteredTrips.length} trip
      </p>
    </div>
  );
};

export default AdminOperations;
