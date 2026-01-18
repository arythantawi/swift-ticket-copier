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
  Clock,
  Download,
  Archive,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Backup {
  id: string;
  backup_type: string;
  record_count: number;
  created_at: string;
  notes: string | null;
}

const AdminDatabase = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaning, setIsCleaning] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [cleanupSettings, setCleanupSettings] = useState<CleanupSettings>({
    bookingsOlderThanDays: 90,
    operationsOlderThanDays: 180,
    keepPaidBookings: true,
  });

  const fetchTableStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
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
        { name: 'Pesanan', count: bookingsRes.count || 0, icon: ShoppingCart, description: 'Data pemesanan', maxRecommended: 10000 },
        { name: 'Jadwal', count: schedulesRes.count || 0, icon: Calendar, description: 'Jadwal perjalanan', maxRecommended: 500 },
        { name: 'Operasional', count: operationsRes.count || 0, icon: Truck, description: 'Data operasional', maxRecommended: 5000 },
        { name: 'Banner', count: bannersRes.count || 0, icon: HardDrive, description: 'Banner website', maxRecommended: 50 },
        { name: 'Promo', count: promosRes.count || 0, icon: Zap, description: 'Promo', maxRecommended: 100 },
        { name: 'FAQ', count: faqsRes.count || 0, icon: Settings, description: 'FAQ', maxRecommended: 100 },
        { name: 'Testimoni', count: testimonialsRes.count || 0, icon: CheckCircle2, description: 'Testimoni', maxRecommended: 200 },
        { name: 'Video', count: videosRes.count || 0, icon: HardDrive, description: 'Video', maxRecommended: 100 },
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

  const fetchBackups = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('database_backups')
        .select('id, backup_type, record_count, created_at, notes')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error) setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  }, []);

  useEffect(() => {
    fetchTableStats();
    fetchBackups();
    const interval = setInterval(fetchTableStats, 30000);
    return () => clearInterval(interval);
  }, [fetchTableStats, fetchBackups]);

  const backupBookings = async () => {
    setIsBackingUp('bookings');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.bookingsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      let query = supabase.from('bookings').select('*').lt('travel_date', cutoffDateStr);
      if (cleanupSettings.keepPaidBookings) {
        query = query.neq('payment_status', 'paid');
      }

      const { data: bookingsData, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!bookingsData || bookingsData.length === 0) {
        toast.info('Tidak ada data untuk di-backup');
        return true;
      }

      const { error: backupError } = await (supabase as any)
        .from('database_backups')
        .insert({
          backup_type: 'bookings',
          backup_data: bookingsData,
          record_count: bookingsData.length,
          notes: `Backup ${bookingsData.length} pesanan`,
        });

      if (backupError) throw backupError;
      toast.success(`Berhasil backup ${bookingsData.length} data`);
      fetchBackups();
      return true;
    } catch (error) {
      console.error('Error backing up:', error);
      toast.error('Gagal backup data');
      return false;
    } finally {
      setIsBackingUp(null);
    }
  };

  const backupOperations = async () => {
    setIsBackingUp('operations');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.operationsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const { data: opsData, error: fetchError } = await supabase
        .from('trip_operations')
        .select('*')
        .lt('trip_date', cutoffDateStr);

      if (fetchError) throw fetchError;

      if (!opsData || opsData.length === 0) {
        toast.info('Tidak ada data untuk di-backup');
        return true;
      }

      const { error: backupError } = await (supabase as any)
        .from('database_backups')
        .insert({
          backup_type: 'operations',
          backup_data: opsData,
          record_count: opsData.length,
          notes: `Backup ${opsData.length} operasional`,
        });

      if (backupError) throw backupError;
      toast.success(`Berhasil backup ${opsData.length} data`);
      fetchBackups();
      return true;
    } catch (error) {
      console.error('Error backing up:', error);
      toast.error('Gagal backup data');
      return false;
    } finally {
      setIsBackingUp(null);
    }
  };

  const cleanupOldBookings = async () => {
    const backupSuccess = await backupBookings();
    if (!backupSuccess) return;

    setIsCleaning('bookings');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.bookingsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      let deleteQuery = supabase.from('bookings').delete().lt('travel_date', cutoffDateStr);
      if (cleanupSettings.keepPaidBookings) {
        deleteQuery = deleteQuery.neq('payment_status', 'paid');
      }

      const { error } = await deleteQuery;
      if (error) throw error;
      toast.success('Berhasil membersihkan data pesanan lama');
      fetchTableStats();
    } catch (error) {
      console.error('Error cleaning up:', error);
      toast.error('Gagal membersihkan data');
    } finally {
      setIsCleaning(null);
    }
  };

  const cleanupOldOperations = async () => {
    const backupSuccess = await backupOperations();
    if (!backupSuccess) return;

    setIsCleaning('operations');
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - cleanupSettings.operationsOlderThanDays);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const { error } = await supabase.from('trip_operations').delete().lt('trip_date', cutoffDateStr);
      if (error) throw error;
      toast.success('Berhasil membersihkan data operasional lama');
      fetchTableStats();
    } catch (error) {
      console.error('Error cleaning up:', error);
      toast.error('Gagal membersihkan data');
    } finally {
      setIsCleaning(null);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      const { data, error } = await (supabase as any)
        .from('database_backups')
        .select('backup_data')
        .eq('id', backup.id)
        .single();

      if (error || !data) throw error;

      const blob = new Blob([JSON.stringify(data.backup_data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backup.backup_type}-${new Date(backup.created_at).toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh backup');
    }
  };

  const deleteBackup = async (id: string) => {
    try {
      const { error } = await (supabase as any).from('database_backups').delete().eq('id', id);
      if (error) throw error;
      toast.success('Backup berhasil dihapus');
      fetchBackups();
    } catch (error) {
      toast.error('Gagal menghapus backup');
    }
  };

  const getProgressColor = (count: number, max: number) => {
    const pct = (count / max) * 100;
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (count: number, max: number) => {
    const pct = (count / max) * 100;
    if (pct >= 90) return <Badge variant="destructive">Kritis</Badge>;
    if (pct >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Perlu Perhatian</Badge>;
    return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Kontrol Database (Super Admin)
          </h2>
          <p className="text-sm text-muted-foreground">Monitor dan kelola database</p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastRefresh.toLocaleTimeString('id-ID')}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => { fetchTableStats(); fetchBackups(); }} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="monitoring"><Zap className="w-4 h-4 mr-1" />Monitoring</TabsTrigger>
          <TabsTrigger value="cleanup"><Trash2 className="w-4 h-4 mr-1" />Pembersihan</TabsTrigger>
          <TabsTrigger value="backups"><Archive className="w-4 h-4 mr-1" />Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ringkasan Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{totalRecords.toLocaleString('id-ID')}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
                <Badge className="bg-green-100 text-green-800"><Zap className="w-3 h-3 mr-1" />Real-time</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tableStats.map((table) => (
              <Card key={table.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <table.icon className="w-4 h-4" />
                      {table.name}
                    </CardTitle>
                    {getStatusBadge(table.count, table.maxRecommended)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{table.count.toLocaleString('id-ID')}</p>
                  <Progress value={Math.min((table.count / table.maxRecommended) * 100, 100)} className={`h-2 mt-2 ${getProgressColor(table.count, table.maxRecommended)}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Pembersihan Data
              </CardTitle>
              <CardDescription>Data akan di-backup otomatis sebelum dihapus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Pesanan Lama</h3>
                  </div>
                  <div className="space-y-2">
                    <Label>Hapus pesanan lebih dari</Label>
                    <Select value={cleanupSettings.bookingsOlderThanDays.toString()} onValueChange={(v) => setCleanupSettings(prev => ({ ...prev, bookingsOlderThanDays: parseInt(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 hari</SelectItem>
                        <SelectItem value="60">60 hari</SelectItem>
                        <SelectItem value="90">90 hari</SelectItem>
                        <SelectItem value="180">180 hari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="keepPaid" checked={cleanupSettings.keepPaidBookings} onChange={(e) => setCleanupSettings(prev => ({ ...prev, keepPaidBookings: e.target.checked }))} />
                    <Label htmlFor="keepPaid">Pertahankan pesanan lunas</Label>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={isCleaning === 'bookings' || isBackingUp === 'bookings'}>
                        {(isCleaning === 'bookings' || isBackingUp === 'bookings') ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Bersihkan Pesanan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle><AlertTriangle className="w-5 h-5 text-destructive inline mr-2" />Konfirmasi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data akan di-backup terlebih dahulu, kemudian pesanan lebih dari {cleanupSettings.bookingsOlderThanDays} hari akan dihapus.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={cleanupOldBookings}>Lanjutkan</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Operasional Lama</h3>
                  </div>
                  <div className="space-y-2">
                    <Label>Hapus operasional lebih dari</Label>
                    <Select value={cleanupSettings.operationsOlderThanDays.toString()} onValueChange={(v) => setCleanupSettings(prev => ({ ...prev, operationsOlderThanDays: parseInt(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 hari</SelectItem>
                        <SelectItem value="180">180 hari</SelectItem>
                        <SelectItem value="365">1 tahun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={isCleaning === 'operations' || isBackingUp === 'operations'}>
                        {(isCleaning === 'operations' || isBackingUp === 'operations') ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Bersihkan Operasional
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle><AlertTriangle className="w-5 h-5 text-destructive inline mr-2" />Konfirmasi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data akan di-backup terlebih dahulu, kemudian operasional lebih dari {cleanupSettings.operationsOlderThanDays} hari akan dihapus.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={cleanupOldOperations}>Lanjutkan</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4" />
                Riwayat Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada backup</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell><Badge variant="outline">{backup.backup_type}</Badge></TableCell>
                        <TableCell>{backup.record_count.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{new Date(backup.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{backup.notes || '-'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => downloadBackup(backup)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus backup?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBackup(backup.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDatabase;
