import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  layout_type: string;
}

// Helper function to convert Google Drive links to direct image URL
const convertGoogleDriveUrl = (url: string | null): string | null => {
  if (!url) return url;
  
  // Pattern 1: https://drive.google.com/file/d/{FILE_ID}/view...
  const filePattern = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const fileMatch = url.match(filePattern);
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }
  
  // Pattern 2: https://drive.google.com/open?id={FILE_ID}
  const openPattern = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const openMatch = url.match(openPattern);
  if (openMatch) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }
  
  // Pattern 3: https://drive.google.com/uc?id={FILE_ID}...
  const ucPattern = /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/;
  const ucMatch = url.match(ucPattern);
  if (ucMatch) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }
  
  return url;
};

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setBanners(data);
      }
      setIsLoading(false);
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Animate content on banner change
  useEffect(() => {
    if (contentRef.current && banners.length > 0) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [currentIndex, banners.length]);

  // Scroll animation
  useEffect(() => {
    if (!sectionRef.current || banners.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const layoutType = currentBanner.layout_type || 'image_caption';
  const hasImage = currentBanner.image_url;

  // Navigation component for reuse
  const NavigationArrows = ({ isDark = false }: { isDark?: boolean }) => (
    banners.length > 1 ? (
      <>
        <button
          onClick={goToPrevious}
          className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            isDark ? 'bg-black/30 hover:bg-black/50' : 'bg-white/10 hover:bg-white/20'
          } backdrop-blur-sm`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={goToNext}
          className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            isDark ? 'bg-black/30 hover:bg-black/50' : 'bg-white/10 hover:bg-white/20'
          } backdrop-blur-sm`}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </>
    ) : null
  );

  const DotsIndicator = ({ position = 'bottom-4' }: { position?: string }) => (
    banners.length > 1 ? (
      <div className={`absolute ${position} left-1/2 -translate-x-1/2 z-20 flex gap-2`}>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6 shadow-md' 
                : 'bg-white/50 w-2 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    ) : null
  );

  // Render based on layout type
  const renderBanner = () => {
    switch (layoutType) {
      case 'image_full':
        // Full image only - no text overlay
        return (
          <div className="relative">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
              {hasImage ? (
                <img 
                  src={convertGoogleDriveUrl(currentBanner.image_url)!}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80" />
              )}
            </div>
            {currentBanner.link_url && (
              <a href={currentBanner.link_url} className="absolute inset-0 z-10" aria-label={currentBanner.title} />
            )}
            <NavigationArrows isDark={true} />
            <DotsIndicator position="bottom-4" />
          </div>
        );

      case 'image_overlay':
        // Image with text overlay on top
        return (
          <div className="relative min-h-[280px] md:min-h-[380px]">
            {hasImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${convertGoogleDriveUrl(currentBanner.image_url)})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              </div>
            )}
            {!hasImage && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            )}
            <div 
              ref={contentRef}
              className="relative z-10 flex flex-col items-center justify-center text-center p-6 md:p-12 min-h-[280px] md:min-h-[380px]"
            >
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-3 max-w-3xl leading-tight drop-shadow-lg">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-base md:text-xl text-white/90 mb-6 max-w-2xl leading-relaxed drop-shadow">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.link_url && currentBanner.button_text && (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8 py-5 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <a href={currentBanner.link_url}>{currentBanner.button_text}</a>
                </Button>
              )}
            </div>
            <NavigationArrows isDark={hasImage ? true : false} />
            <DotsIndicator position="bottom-6" />
          </div>
        );

      case 'image_caption':
        // Image with caption bar below
        return (
          <div className="relative">
            {hasImage ? (
              <>
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
                  <img 
                    src={convertGoogleDriveUrl(currentBanner.image_url)!}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                </div>
                <div 
                  ref={contentRef}
                  className="bg-gradient-to-r from-primary to-primary/90 px-4 py-4 md:px-8 md:py-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-2xl font-bold text-white truncate">
                        {currentBanner.title}
                      </h2>
                      {currentBanner.subtitle && (
                        <p className="text-sm md:text-base text-white/80 mt-1 line-clamp-1">
                          {currentBanner.subtitle}
                        </p>
                      )}
                    </div>
                    {currentBanner.link_url && currentBanner.button_text && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-white text-primary hover:bg-white/90 px-6 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 shrink-0 w-fit"
                      >
                        <a href={currentBanner.link_url}>{currentBanner.button_text}</a>
                      </Button>
                    )}
                  </div>
                </div>
                <NavigationArrows isDark={true} />
                <DotsIndicator position="bottom-16 md:bottom-20" />
              </>
            ) : (
              // Fallback to text only if no image
              <div className="bg-gradient-to-br from-primary via-primary to-primary/80 min-h-[200px] md:min-h-[280px]">
                <div 
                  ref={contentRef} 
                  className="flex flex-col items-center justify-center text-center p-6 md:p-10 min-h-[200px] md:min-h-[280px]"
                >
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-3xl leading-tight">
                    {currentBanner.title}
                  </h2>
                  {currentBanner.subtitle && (
                    <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.link_url && currentBanner.button_text && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 px-8 py-5 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <a href={currentBanner.link_url}>{currentBanner.button_text}</a>
                    </Button>
                  )}
                </div>
                <NavigationArrows />
                <DotsIndicator />
              </div>
            )}
          </div>
        );

      case 'text_only':
      default:
        // Text only - no image
        return (
          <div className="bg-gradient-to-br from-primary via-primary to-primary/80 min-h-[200px] md:min-h-[280px] relative">
            <div 
              ref={contentRef} 
              className="flex flex-col items-center justify-center text-center p-6 md:p-10 min-h-[200px] md:min-h-[280px]"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-3xl leading-tight">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.link_url && currentBanner.button_text && (
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8 py-5 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <a href={currentBanner.link_url}>{currentBanner.button_text}</a>
                </Button>
              )}
            </div>
            <NavigationArrows />
            <DotsIndicator />
          </div>
        );
    }
  };

  return (
    <section ref={sectionRef} className="py-8 md:py-12 bg-background">
      <div className="container">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
          {renderBanner()}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
