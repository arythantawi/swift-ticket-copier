import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ShoppingCart,
  Truck,
  Settings,
  HardDrive,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TableStats {
  name: string;
  count: number;
  icon: React.ElementType;
  description: string;
  maxRecommended: number;
}

interface CleanupSettings {
  bookingsOlderThanDays: number;
  operationsOlderThanDays: number;
  keepPaidBookings: boolean;
}

const AdminDatabase = () => {
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaning, setIsCleaning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [cleanupSettings, setCleanupSettings] = useState<CleanupSettings>({
    bookingsOlderThanDays: 90,
    operationsOlderThanDays: 180,
    keepPaidBookings: true,
  });

  const fetchTableStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch counts for all tables in parallel
      const [
        bookingsRes,
        schedulesRes,
        operationsRes,
        bannersRes,
        promosRes,
        faqsRes,
        testimonialsRes,
        videosRes,
      ] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('schedules').select('id', { count: 'exact', head: true }),
        supabase.from('trip_operations').select('id', { count: 'exact', head: true }),
        supabase.from('banners').select('id', { count: 'exact', head: true }),
        supabase.from('promos').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
      ]);

      setTableStats([
        { 
          name: 'Pesanan (Bookings)', 
          count: bookingsRes.count || 0, 
          icon: ShoppingCart,
          description: 'Data pemesanan pelanggan',
          maxRecommended: 10000,
        },
        { 
          name: 'Jadwal (Schedules)', 
          count: schedulesRes.count || 0, 
          icon: Calendar,
          description: 'Jadwal perjalanan aktif',
          maxRecommended: 500,
        },
        { 
          name: 'Operasional (Trip Operations)', 
          count: operationsRes.count || 0, 
          icon: Truck,
          description: 'Data operasional perjalanan',
          maxRecommended: 5000,
        },
        { 
          name: 'Banner', 
          count: bannersRes.count || 0, 
          icon: HardDrive,
          description: 'Banner promosi website',
          maxRecommended: 50,
        },
        { 
          name: 'Promo', 
          count: promosRes.count || 0, 
          icon: Zap,
          description: 'Promo dan diskon',
          maxRecommended: 100,
        },
        { 
          name: 'FAQ', 
          count: faqsRes.count || 0, 
          icon: Settings,
          description: 'Pertanyaan yang sering diajukan',
          maxRecommended: 100,
        },
        { 
          name: 'Testimoni', 
          count: testimonialsRes.count || 0, 
          icon: CheckCircle2,
          description: 'Testimoni pelanggan',
          maxRecommended: 200,
        },
        { 
          name: 'Video', 
          count: videosRes.count || 0, 
          icon: HardDrive,
          description: 'Video promosi',
          maxRecommended: 100,
        },
      ]);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching table stats:', error);
      toast.error('Gagal memuat statistik database');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTableStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTableStats, 30000);
    return () => clearInterval(interval);
  }, [fetchTableStats]);

  const getProgressColor = (count: number, max: number): string => {
    const percentage = (count / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (count: number, max: number) => {
    const percentage = (count / max) * 100;
    if (percentage >= 90) {
      return <Badge variant="destructive" className="ml-2">Kritis</Badge>;
    }
    if (percentage >= 70) {
      return <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Perlu Perhatian</Badge>;
    }
    return <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Normal</Badge>;
  };

  const cleanupOldBookings = async () => {
    setIsCleaning('bookings');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.bookingsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      // Delete old bookings
      let deleteQuery = supabase
        .from('bookings')
        .delete()
        .lt('travel_date', cutoffDateStr);

      if (cleanupSettings.keepPaidBookings) {
        deleteQuery = deleteQuery.neq('payment_status', 'paid');
      }

      const { error: deleteError } = await deleteQuery;
      if (deleteError) throw deleteError;

      toast.success(`Berhasil membersihkan data pesanan lama`);
      fetchTableStats();
    } catch (error) {
      console.error('Error cleaning up bookings:', error);
      toast.error('Gagal membersihkan data pesanan');
    } finally {
      setIsCleaning(null);
    }
  };

  const cleanupOldOperations = async () => {
    setIsCleaning('operations');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.operationsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('trip_operations')
        .delete()
        .lt('trip_date', cutoffDateStr);

      if (error) throw error;

      toast.success(`Berhasil membersihkan data operasional lama`);
      fetchTableStats();
    } catch (error) {
      console.error('Error cleaning up operations:', error);
      toast.error('Gagal membersihkan data operasional');
    } finally {
      setIsCleaning(null);
    }
  };

  const cleanupInactiveContent = async (tableName: string) => {
    setIsCleaning(tableName);
    try {
      let error: Error | null = null;
      
      // Handle each table type explicitly to satisfy TypeScript
      switch (tableName) {
        case 'banners':
          ({ error } = await supabase.from('banners').delete().eq('is_active', false));
          break;
        case 'promos':
          ({ error } = await supabase.from('promos').delete().eq('is_active', false));
          break;
        case 'faqs':
          ({ error } = await supabase.from('faqs').delete().eq('is_active', false));
          break;
        case 'testimonials':
          ({ error } = await supabase.from('testimonials').delete().eq('is_active', false));
          break;
        case 'videos':
          ({ error } = await supabase.from('videos').delete().eq('is_active', false));
          break;
        default:
          throw new Error(`Unknown table: ${tableName}`);
      }

      if (error) throw error;

      toast.success(`Berhasil menghapus ${tableName} yang tidak aktif`);
      fetchTableStats();
    } catch (error) {
      console.error(`Error cleaning up ${tableName}:`, error);
      toast.error(`Gagal membersihkan ${tableName}`);
    } finally {
      setIsCleaning(null);
    }
  };

  const totalRecords = tableStats.reduce((sum, t) => sum + t.count, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Kontrol Database
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor dan kelola data database secara real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastRefresh.toLocaleTimeString('id-ID')}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTableStats}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ringkasan Database</CardTitle>
          <CardDescription>Total seluruh data tersimpan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{totalRecords.toLocaleString('id-ID')}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium text-green-600">Real-time Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tableStats.map((table) => (
          <Card key={table.name} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <table.icon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
                </div>
                {getStatusBadge(table.count, table.maxRecommended)}
              </div>
              <CardDescription className="text-xs">{table.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{table.count.toLocaleString('id-ID')}</p>
                <p className="text-xs text-muted-foreground">/ {table.maxRecommended.toLocaleString('id-ID')}</p>
              </div>
              <Progress 
                value={Math.min((table.count / table.maxRecommended) * 100, 100)} 
                className={`h-2 ${getProgressColor(table.count, table.maxRecommended)}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cleanup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pengaturan Pembersihan Data
          </CardTitle>
          <CardDescription>
            Atur parameter untuk membersihkan data lama dan menghemat ruang database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bookings Cleanup */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Pesanan Lama</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bookingDays">Hapus pesanan lebih dari (hari)</Label>
                  <Select
                    value={cleanupSettings.bookingsOlderThanDays.toString()}
                    onValueChange={(v) => setCleanupSettings(prev => ({ ...prev, bookingsOlderThanDays: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 hari</SelectItem>
                      <SelectItem value="60">60 hari</SelectItem>
                      <SelectItem value="90">90 hari</SelectItem>
                      <SelectItem value="180">180 hari</SelectItem>
                      <SelectItem value="365">1 tahun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="keepPaid"
                    checked={cleanupSettings.keepPaidBookings}
                    onChange={(e) => setCleanupSettings(prev => ({ ...prev, keepPaidBookings: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="keepPaid" className="text-sm">Pertahankan pesanan yang sudah lunas</Label>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full" disabled={isCleaning === 'bookings'}>
                      {isCleaning === 'bookings' ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Bersihkan Pesanan Lama
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Konfirmasi Penghapusan
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Anda akan menghapus semua pesanan dengan tanggal perjalanan lebih dari {cleanupSettings.bookingsOlderThanDays} hari yang lalu.
                        {cleanupSettings.keepPaidBookings && ' Pesanan yang sudah lunas akan tetap disimpan.'}
                        <br /><br />
                        <strong className="text-destructive">Tindakan ini tidak dapat dibatalkan!</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={cleanupOldBookings} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Hapus Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Operations Cleanup */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Data Operasional</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="operationDays">Hapus operasional lebih dari (hari)</Label>
                  <Select
                    value={cleanupSettings.operationsOlderThanDays.toString()}
                    onValueChange={(v) => setCleanupSettings(prev => ({ ...prev, operationsOlderThanDays: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 hari</SelectItem>
                      <SelectItem value="180">180 hari</SelectItem>
                      <SelectItem value="365">1 tahun</SelectItem>
                      <SelectItem value="730">2 tahun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full" disabled={isCleaning === 'operations'}>
                      {isCleaning === 'operations' ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Bersihkan Data Operasional
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Konfirmasi Penghapusan
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Anda akan menghapus semua data operasional dengan tanggal lebih dari {cleanupSettings.operationsOlderThanDays} hari yang lalu.
                        <br /><br />
                        <strong className="text-destructive">Tindakan ini tidak dapat dibatalkan!</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={cleanupOldOperations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Hapus Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Quick Cleanup for Content */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-4">Hapus Konten Tidak Aktif</h3>
            <div className="flex flex-wrap gap-2">
              {['banners', 'promos', 'faqs', 'testimonials', 'videos'].map((table) => (
                <AlertDialog key={table}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isCleaning === table}
                    >
                      {isCleaning === table ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      {table.charAt(0).toUpperCase() + table.slice(1)}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus {table} tidak aktif?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Semua {table} dengan status tidak aktif akan dihapus permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => cleanupInactiveContent(table)}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Tips Menghemat Database
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <p>• Hapus pesanan lama yang sudah tidak diperlukan secara berkala</p>
          <p>• Nonaktifkan konten yang tidak digunakan sebelum menghapusnya</p>
          <p>• Monitor statistik database secara rutin untuk mencegah data menumpuk</p>
          <p>• Backup data penting sebelum melakukan pembersihan</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDatabase;
