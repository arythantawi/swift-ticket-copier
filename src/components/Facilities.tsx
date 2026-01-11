import { useEffect, useRef, useState } from 'react';
import { Ship, Utensils, UserCheck, CalendarDays, MapPin } from 'lucide-react';
import { Typewriter } from '@/hooks/use-typewriter';

const facilities = [
  {
    icon: Ship,
    text: 'Sudah Termasuk Tiket Penyebrangan',
    description: 'Tidak perlu repot beli tiket ferry terpisah',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Utensils,
    text: 'Free Makan 1x dan Snack',
    description: 'Nikmati makanan gratis selama perjalanan',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: UserCheck,
    text: 'Driver Berpengalaman',
    description: 'Sopir profesional dan ramah',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: CalendarDays,
    text: 'Berangkat Setiap Hari',
    description: 'Jadwal fleksibel sesuai kebutuhan',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: MapPin,
    text: 'Door To Door Service',
    description: 'Antar jemput langsung ke lokasi',
    color: 'from-rose-500 to-pink-500',
  },
];

const Facilities = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visible immediately to prevent blank section
    setShowDescription(true);
    
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

  return (
    <section 
      ref={sectionRef} 
      id="facilities"
      className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {facilities.map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <div
                key={index}
                className={`group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-100 translate-y-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${facility.color} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-sm md:text-base font-bold text-primary-foreground text-center mb-2 leading-tight">
                  {facility.text}
                </h3>
                <p className="text-primary-foreground/60 text-xs text-center hidden md:block">
                  {facility.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Facilities;