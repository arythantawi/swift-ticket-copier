import { useState, useEffect, useRef } from 'react';
import { Play, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  category: string;
}

type VideoCategory = 'semua' | 'promosi' | 'tutorial' | 'testimoni';

const categoryLabels: Record<VideoCategory, string> = {
  semua: 'Semua',
  promosi: 'Promosi',
  tutorial: 'Tutorial',
  testimoni: 'Testimoni',
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

// Get YouTube thumbnail URL with fallback for shorts
const getYouTubeThumbnail = (url: string, customThumbnail: string | null): string => {
  if (customThumbnail) return customThumbnail;
  
  const videoId = getYouTubeId(url);
  if (!videoId) return '/placeholder.svg';
  
  // Use hqdefault as it's more reliable for shorts
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const VideoSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('semua');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setVideos(data as Video[]);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter videos based on category
  const filteredVideos = activeCategory === 'semua' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  // Get available categories that have videos
  const availableCategories = ['semua', ...new Set(videos.map(v => v.category))] as VideoCategory[];

  if (loading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const featuredVideo = filteredVideos.find(v => v.is_featured) || filteredVideos[0];
  const otherVideos = featuredVideo ? filteredVideos.filter(v => v.id !== featuredVideo.id) : [];

  return (
    <section ref={sectionRef} className="py-16 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div 
          className={`text-center mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Video Promosi
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Lihat Perjalanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tonton video untuk melihat pengalaman perjalanan bersama Travel Minibus
          </p>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 2 && (
          <div 
            className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {categoryLabels[category] || category}
              </Button>
            ))}
          </div>
        )}

        {/* No videos for category */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada video untuk kategori ini</p>
          </div>
        )}

        {/* Featured Video */}
        {featuredVideo && (
          <div 
            className={`mb-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div 
              className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl"
              onClick={() => setSelectedVideo(featuredVideo)}
            >
              <div className="aspect-video bg-muted">
                <img
                  src={getYouTubeThumbnail(featuredVideo.youtube_url, featuredVideo.thumbnail_url)}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const videoId = getYouTubeId(featuredVideo.youtube_url);
                    if (videoId && !target.src.includes('mqdefault')) {
                      target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    }
                  }}
                />
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-sm font-medium rounded-full capitalize">
                  {featuredVideo.category}
                </span>
              </div>

              {/* Video Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                  {featuredVideo.title}
                </h3>
                {featuredVideo.description && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-2">
                    {featuredVideo.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Videos Grid */}
        {otherVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherVideos.map((video, index) => (
              <div
                key={video.id}
                className={`group cursor-pointer transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <div className="aspect-video bg-muted">
                    <img
                      src={getYouTubeThumbnail(video.youtube_url, video.thumbnail_url)}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const videoId = getYouTubeId(video.youtube_url);
                        if (videoId && !target.src.includes('mqdefault')) {
                          target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        }
                      }}
                    />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full capitalize">
                      {video.category}
                    </span>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <h4 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {video.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <DialogTitle className="sr-only">
            {selectedVideo?.title || 'Video'}
          </DialogTitle>
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtube_url)}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VideoSection;
