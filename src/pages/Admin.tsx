import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Home,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminSchedules from '@/components/admin/AdminSchedules';
import AdminOperations from '@/components/admin/AdminOperations';
import AdminManifest from '@/components/admin/AdminManifest';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    waitingVerification: 0,
    paid: 0,
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <AdminBookings onStatsUpdate={setStats} />;
      case 'manifest':
        return <AdminManifest />;
      case 'schedules':
        return <AdminSchedules />;
      case 'operations':
        return <AdminOperations />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return <AdminBookings onStatsUpdate={setStats} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'bookings': return 'Pesanan';
      case 'manifest': return 'Manifes';
      case 'schedules': return 'Jadwal';
      case 'operations': return 'Operasional';
      case 'analytics': return 'Analisa';
      default: return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-card border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <PanelLeft className="w-5 h-5" />
                  </SidebarTrigger>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    <h1 className="text-lg font-bold text-foreground">{getPageTitle()}</h1>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Beranda
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {/* Stats Cards - Only show for bookings */}
            {activeTab === 'bookings' && (
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
            )}

            {/* Content */}
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
