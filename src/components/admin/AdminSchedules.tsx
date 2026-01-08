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
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { schedules as staticSchedules } from '@/lib/scheduleData';

interface Schedule {
  id: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ScheduleForm {
  route_from: string;
  route_to: string;
  route_via: string;
  pickup_time: string;
  category: string;
  price: string;
  is_active: boolean;
}

const initialForm: ScheduleForm = {
  route_from: '',
  route_to: '',
  route_via: '',
  pickup_time: '',
  category: 'Jawa Timur',
  price: '',
  is_active: true,
};

const categories = [
  'Jawa - Bali',
  'Jawa Timur',
  'Jawa - Jakarta',
  'Jawa Tengah - DIY',
];

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState<ScheduleForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('category', { ascending: true })
        .order('route_from', { ascending: true })
        .order('pickup_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal memuat data jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleImportStaticData = async () => {
    setIsImporting(true);
    try {
      const schedulesToInsert = staticSchedules.map(s => ({
        route_from: s.from,
        route_to: s.to,
        route_via: s.via || null,
        pickup_time: s.pickupTime,
        category: s.category,
        price: s.price,
        is_active: true,
      }));

      const { error } = await supabase
        .from('schedules')
        .insert(schedulesToInsert);

      if (error) throw error;
      
      toast.success(`Berhasil import ${schedulesToInsert.length} jadwal`);
      fetchSchedules();
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Gagal import data jadwal');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setForm({
        route_from: schedule.route_from,
        route_to: schedule.route_to,
        route_via: schedule.route_via || '',
        pickup_time: schedule.pickup_time,
        category: schedule.category,
        price: schedule.price.toString(),
        is_active: schedule.is_active,
      });
    } else {
      setEditingSchedule(null);
      setForm(initialForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.route_from || !form.route_to || !form.pickup_time || !form.price) {
      toast.error('Mohon lengkapi semua field wajib');
      return;
    }

    setIsSaving(true);
    try {
      const scheduleData = {
        route_from: form.route_from,
        route_to: form.route_to,
        route_via: form.route_via || null,
        pickup_time: form.pickup_time,
        category: form.category,
        price: parseInt(form.price),
        is_active: form.is_active,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        toast.success('Jadwal berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([scheduleData]);

        if (error) throw error;
        toast.success('Jadwal berhasil ditambahkan');
      }

      handleCloseDialog();
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Gagal menyimpan jadwal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Jadwal berhasil dihapus');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus jadwal');
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: !schedule.is_active })
        .eq('id', schedule.id);

      if (error) throw error;
      
      toast.success(`Jadwal ${!schedule.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Gagal mengubah status jadwal');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.route_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.route_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.route_via && schedule.route_via.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || schedule.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari rute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {schedules.length === 0 && (
            <Button onClick={handleImportStaticData} variant="outline" disabled={isImporting}>
              {isImporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Import Data Awal
            </Button>
          )}
          <Button onClick={fetchSchedules} variant="outline" size="icon">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
                <DialogDescription>
                  {editingSchedule ? 'Perbarui informasi jadwal travel' : 'Tambahkan jadwal travel baru'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="route_to">Ke *</Label>
                    <Input
                      id="route_to"
                      value={form.route_to}
                      onChange={(e) => setForm({...form, route_to: e.target.value})}
                      placeholder="Denpasar"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route_via">Via (opsional)</Label>
                  <Input
                    id="route_via"
                    value={form.route_via}
                    onChange={(e) => setForm({...form, route_via: e.target.value})}
                    placeholder="Malang"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup_time">Jam Jemput *</Label>
                    <Input
                      id="pickup_time"
                      value={form.pickup_time}
                      onChange={(e) => setForm({...form, pickup_time: e.target.value})}
                      placeholder="16.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (Rp) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      placeholder="300000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Aktif</Label>
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({...form, is_active: checked})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Batal</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSchedule ? 'Simpan' : 'Tambah'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedules Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {schedules.length === 0 ? 'Belum ada jadwal' : 'Tidak ada jadwal yang cocok'}
          </p>
          {schedules.length === 0 && (
            <Button onClick={handleImportStaticData} disabled={isImporting}>
              {isImporting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Import Data Awal
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rute</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {schedule.route_from} → {schedule.route_via && `${schedule.route_via} → `}{schedule.route_to}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {schedule.pickup_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-accent">
                    {formatPrice(schedule.price)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleActive(schedule)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(schedule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Jadwal {schedule.route_from} → {schedule.route_to} jam {schedule.pickup_time} akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(schedule.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Total: {filteredSchedules.length} jadwal
      </p>
    </div>
  );
};

export default AdminSchedules;
