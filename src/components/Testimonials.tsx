import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Quote, MapPin, ChevronLeft, ChevronRight, User } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  customer_location: string | null;
  rating: number;
  testimonial_text: string;
  route_taken: string | null;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setTestimonials(data);
      }
      setIsLoading(false);
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from('.testimonial-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.testimonial-stats', {
        scrollTrigger: {
          trigger: '.testimonial-stats',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '.testimonial-card',
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });

      gsap.from('.testimonial-nav', {
        scrollTrigger: {
          trigger: '.testimonial-nav',
          start: 'top 90%',
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [testimonials.length]);

  // Animate on slide change
  useEffect(() => {
    if (cardRef.current && testimonials.length > 0) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [currentIndex, testimonials.length]);

  if (isLoading || testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  // Calculate average rating
  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Header */}
        <div className="testimonial-title text-center mb-14">
          <span className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Testimoni Pelanggan
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Apa Kata Mereka?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kepuasan pelanggan adalah prioritas utama kami
          </p>
        </div>

        {/* Stats */}
        <div className="testimonial-stats flex flex-wrap justify-center gap-8 md:gap-16 mb-14">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {testimonials.length}+
            </div>
            <p className="text-sm text-muted-foreground mt-4">Ulasan Pelanggan</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              98%
            </div>
            <p className="text-sm text-muted-foreground mt-4">Pelanggan Puas</p>
          </div>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div 
            ref={cardRef}
            className="testimonial-card relative bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl"
          >
            {/* Quote decoration */}
            <div className="absolute -top-6 left-8 md:left-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-6 pt-4">
              {renderStars(currentTestimonial.rating)}
            </div>

            {/* Testimonial text */}
            <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
              "{currentTestimonial.testimonial_text}"
            </blockquote>

            {/* Customer info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {currentTestimonial.customer_photo_url ? (
                    <img 
                      src={currentTestimonial.customer_photo_url} 
                      alt={currentTestimonial.customer_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">
                    {currentTestimonial.customer_name}
                  </h4>
                  {currentTestimonial.customer_location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentTestimonial.customer_location}
                    </p>
                  )}
                </div>
              </div>

              {/* Route badge */}
              {currentTestimonial.route_taken && (
                <div className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {currentTestimonial.route_taken}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="testimonial-nav flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goToPrevious}
              className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
