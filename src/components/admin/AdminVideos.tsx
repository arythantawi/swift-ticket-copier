import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Play, Star, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  category: string;
  created_at: string;
}

interface VideoForm {
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  is_active: boolean;
  is_featured: boolean;
  category: string;
}

const VIDEO_CATEGORIES = [
  { value: 'promosi', label: 'Promosi' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'testimoni', label: 'Testimoni' },
];

const initialForm: VideoForm = {
  title: '',
  description: '',
  youtube_url: '',
  thumbnail_url: '',
  is_active: true,
  is_featured: false,
  category: 'promosi',
};

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState<VideoForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setVideos(data as Video[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.youtube_url.trim()) {
      toast.error('Judul dan URL YouTube wajib diisi');
      return;
    }

    const youtubeId = getYouTubeId(form.youtube_url);
    if (!youtubeId) {
      toast.error('URL YouTube tidak valid');
      return;
    }

    setSaving(true);

    try {
      // If setting this video as featured, remove featured from others first
      if (form.is_featured) {
        await supabase
          .from('videos')
          .update({ is_featured: false })
          .neq('id', editingVideo?.id || '');
      }

      const videoData = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        youtube_url: form.youtube_url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        category: form.category,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast.success('Video berhasil diperbarui');
      } else {
        const maxOrder = Math.max(...videos.map(v => v.display_order), -1);
        const { error } = await supabase
          .from('videos')
          .insert({ ...videoData, display_order: maxOrder + 1 });

        if (error) throw error;
        toast.success('Video berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      setEditingVideo(null);
      setForm(initialForm);
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Gagal menyimpan video');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      thumbnail_url: video.thumbnail_url || '',
      is_active: video.is_active,
      is_featured: video.is_featured,
      category: video.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus video ini?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Video berhasil dihapus');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Gagal menghapus video');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? 'Video diaktifkan' : 'Video dinonaktifkan');
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Gagal mengubah status video');
    }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      // Remove featured from all
      await supabase
        .from('videos')
        .update({ is_featured: false })
        .neq('id', id);

      // Set featured on selected
      const { error } = await supabase
        .from('videos')
        .update({ is_featured: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Video utama berhasil diatur');
      fetchVideos();
    } catch (error) {
      console.error('Error setting featured:', error);
      toast.error('Gagal mengatur video utama');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVideo(null);
    setForm(initialForm);
  };

  // Filter videos
  const filteredVideos = filterCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Video Promosi</h2>
          <p className="text-muted-foreground">Kelola video YouTube untuk ditampilkan di homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingVideo(null); setForm(initialForm); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Edit Video' : 'Tambah Video Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Video *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Perjalanan Seru ke Bali"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube_url">URL YouTube *</Label>
                <Input
                  id="youtube_url"
                  value={form.youtube_url}
                  onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=xxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Support: youtube.com/watch, youtu.be, youtube.com/shorts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat tentang video..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL Thumbnail (opsional)</Label>
                <Input
                  id="thumbnail_url"
                  value={form.thumbnail_url}
                  onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="Kosongkan untuk otomatis dari YouTube"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={checked => setForm({ ...form, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={form.is_featured}
                    onCheckedChange={checked => setForm({ ...form, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Video Utama</Label>
                </div>
              </div>

              {/* Preview */}
              {form.youtube_url && getYouTubeId(form.youtube_url) && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={form.thumbnail_url || `https://img.youtube.com/vi/${getYouTubeId(form.youtube_url)}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : editingVideo ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('all')}
          >
            Semua ({videos.length})
          </Button>
          {VIDEO_CATEGORIES.map((cat) => {
            const count = videos.filter(v => v.category === cat.value).length;
            return (
              <Button 
                key={cat.value}
                size="sm" 
                variant={filterCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setFilterCategory(cat.value)}
              >
                {cat.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Belum ada video</h3>
            <p className="text-muted-foreground mb-4">Tambahkan video YouTube untuk ditampilkan di homepage</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Video Pertama
            </Button>
          </CardContent>
        </Card>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tidak ada video</h3>
            <p className="text-muted-foreground">Tidak ada video untuk kategori ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map((video) => {
            const youtubeId = getYouTubeId(video.youtube_url);
            const categoryLabel = VIDEO_CATEGORIES.find(c => c.value === video.category)?.label || video.category;
            return (
              <Card key={video.id} className={!video.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-40 md:w-48 flex-shrink-0">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={video.thumbnail_url || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {video.is_featured && (
                        <div className="absolute top-1 left-1 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Utama
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full capitalize flex-shrink-0">
                          {categoryLabel}
                        </span>
                      </div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {video.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {video.youtube_url}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={video.is_active}
                          onCheckedChange={checked => handleToggleActive(video.id, checked)}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSetFeatured(video.id)}
                          title="Jadikan video utama"
                          className={video.is_featured ? 'text-accent' : ''}
                        >
                          <Star className="w-4 h-4" fill={video.is_featured ? 'currentColor' : 'none'} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(video)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminVideos;