import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Phone,
  Mail,
  RefreshCw,
  Trash2,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  phone_number: string | null;
  is_mfa_enabled: boolean;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  created_at: string;
  details: any;
}

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('admins');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    phone_number: '',
    role: 'admin',
  });

  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const fetchAdmins = useCallback(async () => {
    try {
      // Get all user roles for admin/super_admin
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'super_admin']);

      if (rolesError) throw rolesError;

      // Get admin profiles
      const { data: profiles, error: profilesError } = await (supabase as any)
        .from('admin_profiles')
        .select('user_id, phone_number, is_mfa_enabled, created_at');

      if (profilesError) throw profilesError;

      // Combine data
      const adminList: AdminUser[] = [];
      for (const role of roles || []) {
        const profile = (profiles || []).find((p: any) => p.user_id === role.user_id);
        
        // Get email from auth - we'll use a workaround since we can't query auth.users directly
        adminList.push({
          id: role.user_id,
          user_id: role.user_id,
          email: profile?.email || 'N/A',
          role: role.role,
          phone_number: profile?.phone_number || null,
          is_mfa_enabled: profile?.is_mfa_enabled || false,
          created_at: profile?.created_at || new Date().toISOString(),
        });
      }

      setAdmins(adminList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Gagal memuat data admin');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActivityLogs = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_activity_logs')
        .select('id, user_email, action, created_at, details')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchActivityLogs();
  }, [fetchAdmins, fetchActivityLogs]);

  const logActivity = async (action: string, email: string, details?: any) => {
    try {
      await (supabase as any).from('admin_activity_logs').insert({
        user_email: email,
        action,
        details,
      });
      fetchActivityLogs();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const createAdmin = async () => {
    if (!newAdminForm.email || !newAdminForm.password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    if (newAdminForm.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsCreating(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminForm.email,
        password: newAdminForm.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Add role - cast to proper type
        const roleValue = newAdminForm.role === 'super_admin' ? 'super_admin' : 'admin';
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: roleValue as 'admin' | 'super_admin',
        });

        if (roleError) throw roleError;

        // Add profile
        await (supabase as any).from('admin_profiles').insert({
          user_id: authData.user.id,
          phone_number: newAdminForm.phone_number || null,
          is_mfa_enabled: false,
        });

        await logActivity('admin_created', newAdminForm.email, {
          role: newAdminForm.role,
          created_by: 'super_admin',
        });

        toast.success('Admin berhasil ditambahkan');
        setCreateDialogOpen(false);
        setNewAdminForm({ email: '', password: '', phone_number: '', role: 'admin' });
        fetchAdmins();
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Gagal menambahkan admin');
    } finally {
      setIsCreating(false);
    }
  };

  const resetPassword = async () => {
    if (!selectedAdmin) return;

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (resetForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(selectedAdmin.email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) throw error;

      await logActivity('password_reset_requested', selectedAdmin.email, {
        requested_by: 'super_admin',
      });

      toast.success('Email reset password telah dikirim');
      setResetDialogOpen(false);
      setResetForm({ newPassword: '', confirmPassword: '' });
      setSelectedAdmin(null);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Gagal reset password');
    }
  };

  const removeAdmin = async (admin: AdminUser) => {
    try {
      // Remove role - use proper type casting
      const roleToDelete = admin.role === 'super_admin' ? 'super_admin' : 'admin';
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', admin.user_id)
        .eq('role', roleToDelete as 'admin' | 'super_admin');

      if (error) throw error;

      await logActivity('admin_removed', admin.email, {
        role: admin.role,
        removed_by: 'super_admin',
      });

      toast.success('Admin berhasil dihapus');
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Gagal menghapus admin');
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return <Badge className="bg-green-100 text-green-800">Login</Badge>;
      case 'logout':
        return <Badge className="bg-gray-100 text-gray-800">Logout</Badge>;
      case 'admin_created':
        return <Badge className="bg-blue-100 text-blue-800">Admin Dibuat</Badge>;
      case 'admin_removed':
        return <Badge className="bg-red-100 text-red-800">Admin Dihapus</Badge>;
      case 'password_reset_requested':
        return <Badge className="bg-yellow-100 text-yellow-800">Reset Password</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

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
            <Shield className="w-5 h-5 text-primary" />
            Manajemen Admin (Super Admin)
          </h2>
          <p className="text-sm text-muted-foreground">Kelola akun admin dan monitoring aktivitas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchAdmins(); fetchActivityLogs(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="admins"><Users className="w-4 h-4 mr-1" />Daftar Admin</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="w-4 h-4 mr-1" />Log Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Daftar Admin</CardTitle>
                  <CardDescription>Kelola akun admin sistem</CardDescription>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><UserPlus className="w-4 h-4 mr-2" />Tambah Admin</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Admin Baru</DialogTitle>
                      <DialogDescription>Buat akun admin baru untuk sistem</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="admin@example.com"
                            value={newAdminForm.email}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 6 karakter"
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nomor Telepon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={newAdminForm.phone_number}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone_number: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={newAdminForm.role} onValueChange={(v) => setNewAdminForm(prev => ({ ...prev, role: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
                      <Button onClick={createAdmin} disabled={isCreating}>
                        {isCreating && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        Tambah Admin
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada admin terdaftar</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell>{admin.phone_number || '-'}</TableCell>
                        <TableCell>
                          {admin.is_mfa_enabled ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setResetDialogOpen(true);
                            }}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          {admin.role !== 'super_admin' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus admin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Role admin untuk {admin.email} akan dihapus.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeAdmin(admin)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Log Aktivitas Admin
              </CardTitle>
              <CardDescription>Monitoring login dan aktivitas admin</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada aktivitas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Aktivitas</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString('id-ID')}
                          </div>
                        </TableCell>
                        <TableCell>{log.user_email}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
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

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Kirim email reset password ke {selectedAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Email berisi link untuk reset password akan dikirim ke alamat email admin.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Batal</Button>
            <Button onClick={resetPassword}>Kirim Email Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
