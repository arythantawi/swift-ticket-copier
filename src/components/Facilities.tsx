import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  useEffect(() => {
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

      // Animate icons with rotation
      gsap.from('.facility-icon', {
        scrollTrigger: {
          trigger: '.facilities-grid',
          start: 'top 85%',
        },
        scale: 0,
        rotation: -180,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.3,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
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
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
            Nikmati berbagai fasilitas premium yang sudah termasuk dalam harga tiket
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
