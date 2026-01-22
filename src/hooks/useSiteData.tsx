import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfaces for each data type - only include fields that are actually used
interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  layout_type: string;
  aspect_ratio: string | null;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  category: string;
}

interface Promo {
  id: string;
  title: string;
  description: string | null;
  discount_text: string | null;
  promo_code: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  customer_location: string | null;
  rating: number;
  testimonial_text: string;
  route_taken: string | null;
}

interface SiteDataState {
  banners: Banner[];
  videos: Video[];
  promos: Promo[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
}

interface SiteDataContextValue extends SiteDataState {
  refreshBanners: () => Promise<void>;
  refreshVideos: () => Promise<void>;
  refreshPromos: () => Promise<void>;
  refreshFaqs: () => Promise<void>;
  refreshTestimonials: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache timestamps
const cacheTimestamps: Record<string, number> = {};

const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps[key];
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export const SiteDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SiteDataState>({
    banners: [],
    videos: [],
    promos: [],
    faqs: [],
    testimonials: [],
    isLoading: true,
    error: null,
  });

  const hasFetchedRef = useRef(false);

  // Fetch banners - only select needed columns
  const fetchBanners = useCallback(async (force = false) => {
    if (!force && isCacheValid('banners') && state.banners.length > 0) return;
    
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, subtitle, image_url, link_url, button_text, layout_type, aspect_ratio')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      cacheTimestamps['banners'] = Date.now();
      setState(prev => ({ ...prev, banners: data || [] }));
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  }, [state.banners.length]);

  // Fetch videos - only select needed columns
  const fetchVideos = useCallback(async (force = false) => {
    if (!force && isCacheValid('videos') && state.videos.length > 0) return;
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, youtube_url, thumbnail_url, is_featured, category')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      cacheTimestamps['videos'] = Date.now();
      setState(prev => ({ ...prev, videos: data || [] }));
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }, [state.videos.length]);

  // Fetch promos - only select needed columns with date filtering
  const fetchPromos = useCallback(async (force = false) => {
    if (!force && isCacheValid('promos') && state.promos.length > 0) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('promos')
        .select('id, title, description, discount_text, promo_code, start_date, end_date')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (error) throw error;
      
      cacheTimestamps['promos'] = Date.now();
      setState(prev => ({ ...prev, promos: data || [] }));
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  }, [state.promos.length]);

  // Fetch FAQs - only select needed columns
  const fetchFaqs = useCallback(async (force = false) => {
    if (!force && isCacheValid('faqs') && state.faqs.length > 0) return;
    
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer, category')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      cacheTimestamps['faqs'] = Date.now();
      setState(prev => ({ ...prev, faqs: data || [] }));
    } catch (error) {
      console.error('Error fetching faqs:', error);
    }
  }, [state.faqs.length]);

  // Fetch testimonials - only select needed columns
  const fetchTestimonials = useCallback(async (force = false) => {
    if (!force && isCacheValid('testimonials') && state.testimonials.length > 0) return;
    
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, customer_name, customer_photo_url, customer_location, rating, testimonial_text, route_taken')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      cacheTimestamps['testimonials'] = Date.now();
      setState(prev => ({ ...prev, testimonials: data || [] }));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }, [state.testimonials.length]);

  // Fetch all data in parallel - single database round trip
  const fetchAll = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const today = new Date().toISOString().split('T')[0];

    try {
      // Fetch all data in parallel for efficiency
      const [bannersRes, videosRes, promosRes, faqsRes, testimonialsRes] = await Promise.all([
        supabase
          .from('banners')
          .select('id, title, subtitle, image_url, link_url, button_text, layout_type, aspect_ratio')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('videos')
          .select('id, title, description, youtube_url, thumbnail_url, is_featured, category')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('promos')
          .select('id, title, description, discount_text, promo_code, start_date, end_date')
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${today}`)
          .or(`end_date.is.null,end_date.gte.${today}`),
        supabase
          .from('faqs')
          .select('id, question, answer, category')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('testimonials')
          .select('id, customer_name, customer_photo_url, customer_location, rating, testimonial_text, route_taken')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      const now = Date.now();
      cacheTimestamps['banners'] = now;
      cacheTimestamps['videos'] = now;
      cacheTimestamps['promos'] = now;
      cacheTimestamps['faqs'] = now;
      cacheTimestamps['testimonials'] = now;

      setState({
        banners: bannersRes.data || [],
        videos: videosRes.data || [],
        promos: promosRes.data || [],
        faqs: faqsRes.data || [],
        testimonials: testimonialsRes.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching site data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load site data',
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const contextValue: SiteDataContextValue = {
    ...state,
    refreshBanners: () => fetchBanners(true),
    refreshVideos: () => fetchVideos(true),
    refreshPromos: () => fetchPromos(true),
    refreshFaqs: () => fetchFaqs(true),
    refreshTestimonials: () => fetchTestimonials(true),
    refreshAll: async () => {
      hasFetchedRef.current = false;
      await fetchAll();
    },
  };

  return (
    <SiteDataContext.Provider value={contextValue}>
      {children}
    </SiteDataContext.Provider>
  );
};

// Hook to use site data
export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
};

// Individual hooks for specific data (for backward compatibility)
export const useBanners = () => {
  const { banners, isLoading, refreshBanners } = useSiteData();
  return { banners, isLoading, refresh: refreshBanners };
};

export const useVideos = () => {
  const { videos, isLoading, refreshVideos } = useSiteData();
  return { videos, isLoading, refresh: refreshVideos };
};

export const usePromos = () => {
  const { promos, isLoading, refreshPromos } = useSiteData();
  return { promos, isLoading, refresh: refreshPromos };
};

export const useFaqs = () => {
  const { faqs, isLoading, refreshFaqs } = useSiteData();
  return { faqs, isLoading, refresh: refreshFaqs };
};

export const useTestimonials = () => {
  const { testimonials, isLoading, refreshTestimonials } = useSiteData();
  return { testimonials, isLoading, refresh: refreshTestimonials };
};
