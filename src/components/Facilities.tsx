import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Typewriter } from '@/hooks/use-typewriter';

// Import facility illustrations
import iconFerryTicket from '@/assets/icon-ferry-ticket.png';
import iconFoodMeal from '@/assets/icon-food-meal.png';
import iconDriver from '@/assets/icon-driver.png';
import iconCalendar from '@/assets/icon-calendar.png';
import iconDoorToDoor from '@/assets/icon-door-to-door.png';

gsap.registerPlugin(ScrollTrigger);

const facilities = [
  {
    image: iconFerryTicket,
    text: 'Sudah Termasuk Tiket Penyebrangan',
    description: 'Tidak perlu repot beli tiket ferry terpisah',
  },
  {
    image: iconFoodMeal,
    text: 'Free Makan 1x dan Snack',
    description: 'Nikmati makanan gratis selama perjalanan',
  },
  {
    image: iconDriver,
    text: 'Driver Berpengalaman',
    description: 'Sopir profesional dan ramah',
  },
  {
    image: iconCalendar,
    text: 'Berangkat Setiap Hari',
    description: 'Jadwal fleksibel sesuai kebutuhan',
  },
  {
    image: iconDoorToDoor,
    text: 'Door To Door Service',
    description: 'Antar jemput langsung ke lokasi',
  },
];

const Facilities = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    // Ensure visibility even if animations fail
    const ensureVisible = () => {
      setShowDescription(true);
      const cards = document.querySelectorAll('.facility-card');
      const icons = document.querySelectorAll('.facility-icon');
      const title = document.querySelector('.facilities-title');
      
      gsap.set([title, cards, icons], { opacity: 1, y: 0, scale: 1, rotation: 0, clearProps: 'all' });
    };

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    
    if (prefersReducedMotion) {
      ensureVisible();
      return;
    }

    const ctx = gsap.context(() => {
      // Animate title
      gsap.from('.facilities-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'all',
        onComplete: () => setShowDescription(true),
      });

      // Animate cards with stagger
      gsap.from('.facility-card', {
        scrollTrigger: {
          trigger: '.facilities-grid',
          start: 'top 85%',
        },
        y: 60,
        opacity: 0,
        duration: 0.6,
        stagger: {
          each: 0.1,
          from: 'start',
        },
        ease: 'power2.out',
        clearProps: 'all',
      });

      // Animate icons
      gsap.from('.facility-icon', {
        scrollTrigger: {
          trigger: '.facilities-grid',
          start: 'top 85%',
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.2,
        clearProps: 'all',
      });

      // Parallax for decorative blobs
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          yPercent: 30,
          xPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          }
        });
      }

      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          yPercent: -20,
          xPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2.5,
          }
        });
      }

      // Parallax for cards
      gsap.to('.facility-card', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.facilities-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ensureVisible();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      {/* Background decorations with parallax */}
      <div className="absolute inset-0 opacity-10">
        <div 
          ref={blob1Ref}
          className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
          style={{ willChange: 'transform' }}
        />
        <div 
          ref={blob2Ref}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" 
          style={{ willChange: 'transform' }}
        />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="facilities-title text-center mb-14">
          <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm text-primary-foreground rounded-full text-sm font-semibold mb-4 border border-white/20">
            Apa yang Anda Dapatkan
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Fasilitas Lengkap
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg min-h-[2rem]">
            {showDescription && (
              <Typewriter
                text="Nikmati berbagai fasilitas premium yang sudah termasuk dalam harga tiket"
                speed={30}
                showCursor={false}
              />
            )}
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="facilities-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {facilities.map((facility, index) => (
            <div
              key={index}
              className="facility-card group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="facility-icon w-24 h-24 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 overflow-hidden p-3 shadow-lg">
                <img 
                  src={facility.image} 
                  alt={facility.text} 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-display text-sm md:text-base font-bold text-primary-foreground text-center mb-2 leading-tight">
                {facility.text}
              </h3>
              <p className="text-primary-foreground/60 text-xs text-center hidden md:block">
                {facility.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
