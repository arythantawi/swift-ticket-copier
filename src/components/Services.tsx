import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CalendarClock, Wallet, Smartphone, ArrowRight, MapPin, ChevronDown, X } from 'lucide-react';
import { getRoutePrice } from '@/lib/scheduleData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

interface Route {
  from: string;
  to: string;
  via?: string;
}

const routeCategories = [
  {
    name: 'Jawa - Bali',
    routes: [
      { from: 'Surabaya', to: 'Denpasar' },
      { from: 'Malang', to: 'Denpasar' },
    ],
  },
  {
    name: 'Jawa Timur',
    routes: [
      { from: 'Malang', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Malang' },
      { from: 'Blitar', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Blitar' },
      { from: 'Kediri', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Kediri' },
      { from: 'Banyuwangi', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Banyuwangi' },
      { from: 'Trenggalek', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Trenggalek' },
      { from: 'Ponorogo', to: 'Surabaya', via: 'Madiun' },
      { from: 'Surabaya', to: 'Ponorogo', via: 'Madiun' },
      { from: 'Jember', to: 'Surabaya', via: 'Lumajang' },
      { from: 'Surabaya', to: 'Jember', via: 'Lumajang' },
    ],
  },
  {
    name: 'Jawa - Jakarta',
    routes: [
      { from: 'Jakarta', to: 'Surabaya' },
      { from: 'Surabaya', to: 'Jakarta' },
    ],
  },
  {
    name: 'Jawa Tengah - DIY',
    routes: [
      { from: 'Jogja', to: 'Surabaya', via: 'Solo' },
      { from: 'Surabaya', to: 'Jogja', via: 'Solo' },
    ],
  },
];

const services = [
  {
    icon: CalendarClock,
    title: 'Berangkat Setiap Hari',
    description: 'Jadwal keberangkatan tersedia setiap hari',
    gradient: 'from-blue-500 to-cyan-500',
    hasSchedule: true,
  },
  {
    icon: Wallet,
    title: 'Harga Terjangkau',
    description: 'Tarif kompetitif untuk semua rute',
    gradient: 'from-amber-500 to-orange-500',
    hasSchedule: false,
  },
  {
    icon: Smartphone,
    title: 'Pesan Via Online',
    description: 'Proses booking cepat dan mudah',
    gradient: 'from-emerald-500 to-teal-500',
    hasSchedule: false,
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>('Jawa - Bali');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectRoute = (route: Route) => {
    setShowSchedule(false);
    const params = new URLSearchParams({ 
      from: route.from, 
      to: route.to,
    });
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set('.service-title', { opacity: 1, y: 0 });
      gsap.set('.service-card', { opacity: 1, y: 0 });

      gsap.fromTo('.service-title', 
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      gsap.fromTo('.service-card', 
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out'
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={sectionRef} className="py-20 bg-muted/30">
        <div className="container">
          <div className="service-title text-center mb-14">
            <span className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Layanan Kami
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Kemudahan Perjalanan Anda
            </h2>
          </div>

          <div className="services-grid grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card group relative bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20 overflow-hidden hover:-translate-y-2 cursor-pointer"
                onClick={() => service.hasSchedule && setShowSchedule(true)}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <service.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {service.description}
                  </p>

                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-white" />
              </div>
              Jadwal Lengkap Keberangkatan
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4">
            {routeCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl border border-border overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.routes.length} rute tersedia
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      openCategory === category.name ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openCategory === category.name && (
                  <div className="border-t border-border">
                    {category.routes.map((route, idx) => {
                      const price = getRoutePrice(route.from, route.to);
                      return (
                        <div
                          key={idx}
                          className="p-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                          onClick={() => handleSelectRoute(route)}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm md:text-base">
                              <span className="font-semibold text-foreground">{route.from}</span>
                              {route.via && (
                                <>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-muted-foreground">{route.via}</span>
                                </>
                              )}
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold text-foreground">{route.to}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary">{formatPrice(price)}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Services;
