import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Calendar, Star } from 'lucide-react';
import RouteSearch from './RouteSearch';

gsap.registerPlugin(ScrollTrigger);

// Split text into characters for animation
const SplitText = ({ 
  children, 
  className = '',
  charClassName = ''
}: { 
  children: string; 
  className?: string;
  charClassName?: string;
}) => {
  return (
    <span className={className}>
      {children.split('').map((char, index) => (
        <span 
          key={index} 
          className={`hero-char inline-block ${charClassName}`}
          style={{ 
            display: char === ' ' ? 'inline' : 'inline-block',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

// Split text into words for animation
const SplitWords = ({ 
  children, 
  className = '',
  wordClassName = ''
}: { 
  children: string; 
  className?: string;
  wordClassName?: string;
}) => {
  return (
    <span className={className}>
      {children.split(' ').map((word, index) => (
        <span 
          key={index} 
          className={`hero-word inline-block mr-[0.25em] ${wordClassName}`}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLDivElement>(null);
  const titleLine2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const bgGradientRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const gridPatternRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power4.out'
        }
      });

      // Get all characters and words for animation
      const line1Chars = titleLine1Ref.current?.querySelectorAll('.hero-char') || [];
      const line2Chars = titleLine2Ref.current?.querySelectorAll('.hero-char') || [];

      // Set initial state for characters
      gsap.set([line1Chars, line2Chars], {
        opacity: 0,
        y: 80,
        rotateX: -90,
        transformOrigin: 'top center',
      });

      // Badge animation
      tl.from(badgeRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      // Line 1 character animation - wave effect
      .to(line1Chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: {
          each: 0.03,
          ease: 'power2.out'
        },
        ease: 'power4.out'
      }, '-=0.3')
      // Line 2 character animation - wave effect with gradient text
      .to(line2Chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: {
          each: 0.025,
          ease: 'power2.out'
        },
        ease: 'back.out(1.2)'
      }, '-=0.5')
      // Subtitle animation
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
      }, '-=0.4')
      // Stats animation
      .from(statsRef.current?.children || [], {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
      }, '-=0.6')
      // Search card animation
      .from(searchRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.5');

      // Subtle hover effect on characters
      line2Chars.forEach((char) => {
        const element = char as HTMLElement;
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            y: -8,
            scale: 1.2,
            color: '#fbbf24',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            color: '',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Subtle floating animation for background elements
      gsap.to('.hero-blob-1', {
        y: -20,
        x: 10,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      gsap.to('.hero-blob-2', {
        y: 15,
        x: -15,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      // Parallax effects on scroll
      if (bgGradientRef.current) {
        gsap.to(bgGradientRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          }
        });
      }

      // Parallax for blobs - slower movement
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          yPercent: 50,
          xPercent: -10,
          scale: 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          }
        });
      }

      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          yPercent: 40,
          xPercent: 15,
          scale: 0.8,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 2.5,
          }
        });
      }

      // Grid pattern parallax - subtle
      if (gridPatternRef.current) {
        gsap.to(gridPatternRef.current, {
          yPercent: 15,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        });
      }

      // Content parallax - moves slower than scroll for depth effect
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -8,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'center top',
            scrub: 1,
          }
        });
      }

      // Search card parallax - stays visible longer
      if (searchRef.current) {
        gsap.to(searchRef.current, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          }
        });
      }

    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen lg:min-h-[95vh] flex items-center overflow-hidden pt-20">
      {/* Clean gradient background - parallax layer */}
      <div 
        ref={bgGradientRef}
        className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/85" 
        style={{ willChange: 'transform' }}
      />
      
      {/* Subtle geometric shapes - parallax layers */}
      <div 
        ref={blob1Ref}
        className="hero-blob-1 absolute top-20 left-10 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" 
        style={{ willChange: 'transform' }}
      />
      <div 
        ref={blob2Ref}
        className="hero-blob-2 absolute bottom-10 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" 
        style={{ willChange: 'transform' }}
      />
      
      {/* Minimal grid pattern - parallax layer */}
      <div 
        ref={gridPatternRef}
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          willChange: 'transform, opacity'
        }} 
      />

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div ref={contentRef} className="text-white" style={{ willChange: 'transform, opacity' }}>
            {/* Badge */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium tracking-wide">Travel Minibus Terpercaya</span>
            </div>

            {/* Title with split text animation */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8">
              <div ref={titleLine1Ref} className="overflow-hidden pb-2">
                <SplitText charClassName="text-white">
                  Perjalanan Nyaman ke
                </SplitText>
              </div>
              <div ref={titleLine2Ref} className="overflow-hidden mt-2">
                <span className="bg-gradient-to-r from-accent via-yellow-300 to-accent bg-clip-text text-transparent">
                  <SplitText charClassName="cursor-pointer transition-colors">
                    Seluruh Jawa & Bali
                  </SplitText>
                </span>
              </div>
            </h1>

            {/* Subtitle */}
            <p ref={subtitleRef} className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
              Layanan travel minibus door-to-door dengan armada modern, 
              jadwal fleksibel, dan harga terjangkau untuk perjalanan Anda.
            </p>

            {/* Stats */}
            <div ref={statsRef} className="flex flex-wrap gap-8">
              <div className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">15+</span>
                </div>
                <span className="text-sm text-white/60 ml-[52px]">Kota Tujuan</span>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">365</span>
                </div>
                <span className="text-sm text-white/60 ml-[52px]">Hari/Tahun</span>
              </div>
              <div className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <span className="text-sm text-white/60 ml-[52px]">Rating</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div ref={searchRef} className="lg:pl-8" style={{ willChange: 'transform' }}>
            <RouteSearch />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
