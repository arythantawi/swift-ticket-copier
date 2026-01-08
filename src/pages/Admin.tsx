import { useState } from 'react';
import { 
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminSchedules from '@/components/admin/AdminSchedules';

const Admin = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    waitingVerification: 0,
    paid: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Pesanan</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu Bayar</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
              {stats.pending}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-400">Verifikasi</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {stats.waitingVerification}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400">Lunas</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">
              {stats.paid}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Jadwal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <AdminBookings onStatsUpdate={setStats} />
          </TabsContent>

          <TabsContent value="schedules">
            <AdminSchedules />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
