import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 min-h-[280px]">
          {/* Background Image */}
          {currentBanner.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentBanner.image_url})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 min-h-[280px]">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              {currentBanner.title}
            </h2>
            {currentBanner.subtitle && (
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.link_url && currentBanner.button_text && (
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <a href={currentBanner.link_url}>{currentBanner.button_text}</a>
              </Button>
            )}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
