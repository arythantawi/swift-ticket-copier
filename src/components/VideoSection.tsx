import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVideos } from '@/hooks/useSiteData';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createSafeGsapContext } from '@/lib/gsapUtils';

gsap.registerPlugin(ScrollTrigger);

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
  
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const VideoSection = () => {
  const { videos, isLoading: loading } = useVideos();
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('semua');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = createSafeGsapContext(sectionRef, () => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Main video animation
      gsap.fromTo(
        mainVideoRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: mainVideoRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Thumbnails stagger animation
      if (thumbnailsRef.current) {
        const thumbnails = thumbnailsRef.current.querySelectorAll('.video-thumbnail');
        gsap.fromTo(
          thumbnails,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: thumbnailsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx?.revert();
  }, [videos]);

  // Filter videos based on category
  const filteredVideos = activeCategory === 'semua' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  // Get available categories that have videos
  const availableCategories = ['semua', ...new Set(videos.map(v => v.category))] as VideoCategory[];

  // Reset active video when category changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setIsPlaying(false);
  }, [activeCategory]);

  const activeVideo = filteredVideos[activeVideoIndex];

  const handleVideoSelect = (index: number) => {
    if (index === activeVideoIndex) return;
    
    // Animate out current video
    gsap.to(mainVideoRef.current, {
      opacity: 0,
      scale: 0.98,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActiveVideoIndex(index);
        setIsPlaying(false);
        // Animate in new video
        gsap.fromTo(
          mainVideoRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      },
    });
  };

  const handlePrevVideo = () => {
    const newIndex = activeVideoIndex > 0 ? activeVideoIndex - 1 : filteredVideos.length - 1;
    handleVideoSelect(newIndex);
  };

  const handleNextVideo = () => {
    const newIndex = activeVideoIndex < filteredVideos.length - 1 ? activeVideoIndex + 1 : 0;
    handleVideoSelect(newIndex);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const openFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.();
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="container">
          <div className="flex items-center justify-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef} 
      className="relative py-16 md:py-24 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container relative px-4 sm:px-6">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full mb-4">
            <Play className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-sm font-medium text-primary">Video Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Lihat Perjalanan
            <span className="text-primary"> Kami</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Tonton video untuk melihat pengalaman perjalanan bersama Travel Minibus
          </p>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 transition-all duration-300 ${
                  activeCategory === category 
                    ? 'shadow-lg shadow-primary/25' 
                    : 'hover:bg-secondary'
                }`}
              >
                {categoryLabels[category] || category}
              </Button>
            ))}
          </div>
        )}

        {/* No videos for category */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Tidak ada video untuk kategori ini</p>
          </div>
        )}

        {/* Main Video Player */}
        {activeVideo && (
          <div ref={mainVideoRef} className="mb-8">
            <div className="relative max-w-5xl mx-auto">
              {/* Video Container */}
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-2xl shadow-black/20">
                <div className="aspect-video relative">
                  {isPlaying ? (
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtube_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <>
                      <img
                        src={getYouTubeThumbnail(activeVideo.youtube_url, activeVideo.thumbnail_url)}
                        alt={activeVideo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const videoId = getYouTubeId(activeVideo.youtube_url);
                          if (videoId && !target.src.includes('hqdefault')) {
                            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Play Button */}
                      <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="relative">
                          {/* Pulse rings */}
                          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                          <div className="absolute -inset-4 rounded-full bg-primary/20 animate-pulse" />
                          {/* Play button */}
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                            <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full capitalize">
                          {activeVideo.category}
                        </span>
                      </div>
                      <h3 className="text-white text-lg md:text-2xl font-bold truncate">
                        {activeVideo.title}
                      </h3>
                      {activeVideo.description && (
                        <p className="text-white/70 text-sm md:text-base line-clamp-1 mt-1">
                          {activeVideo.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex items-center gap-2">
                      {isPlaying && (
                        <>
                          <button
                            onClick={toggleMute}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={openFullscreen}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                            <Maximize2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {filteredVideos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevVideo}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextVideo}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Video Counter */}
              {filteredVideos.length > 1 && (
                <div className="flex justify-center mt-4 gap-1.5">
                  {filteredVideos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleVideoSelect(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeVideoIndex 
                          ? 'w-8 bg-primary' 
                          : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thumbnails Grid */}
        {filteredVideos.length > 1 && (
          <div ref={thumbnailsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredVideos.map((video, index) => (
              <div
                key={video.id}
                className={`video-thumbnail group cursor-pointer transition-all duration-300 ${
                  index === activeVideoIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' : ''
                }`}
                onClick={() => handleVideoSelect(index)}
              >
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <div className="aspect-video">
                    <img
                      src={getYouTubeThumbnail(video.youtube_url, video.thumbnail_url)}
                      alt={video.title}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        index === activeVideoIndex 
                          ? 'scale-105' 
                          : 'group-hover:scale-105 group-hover:brightness-110'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const videoId = getYouTubeId(video.youtube_url);
                        if (videoId && !target.src.includes('hqdefault')) {
                          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    index === activeVideoIndex 
                      ? 'bg-primary/20' 
                      : 'bg-black/30 opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      index === activeVideoIndex 
                        ? 'bg-primary scale-100' 
                        : 'bg-white/90 scale-90 group-hover:scale-100'
                    }`}>
                      <Play 
                        className={`w-4 h-4 ml-0.5 ${index === activeVideoIndex ? 'text-primary-foreground' : 'text-primary'}`} 
                        fill="currentColor" 
                      />
                    </div>
                  </div>

                  {/* Active indicator */}
                  {index === activeVideoIndex && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        Playing
                      </span>
                    </div>
                  )}
                </div>
                
                <h4 className={`mt-2 text-sm font-medium line-clamp-2 transition-colors duration-300 ${
                  index === activeVideoIndex 
                    ? 'text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {video.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
