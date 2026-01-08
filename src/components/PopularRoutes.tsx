import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin } from 'lucide-react';
import { getRoutePrice } from '@/lib/scheduleData';

gsap.registerPlugin(ScrollTrigger);

const routes = [
  { id: 1, from: 'Surabaya', to: 'Denpasar', popular: true },
  { id: 2, from: 'Malang', to: 'Denpasar', popular: true },
  { id: 3, from: 'Surabaya', to: 'Jakarta', popular: true },
  { id: 4, from: 'Surabaya', to: 'Jogja', popular: false },
  { id: 5, from: 'Malang', to: 'Surabaya', popular: false },
  { id: 6, from: 'Banyuwangi', to: 'Surabaya', popular: false },
];

const PopularRoutes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBookRoute = (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.route-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
      });

      gsap.from('.route-card', {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
        },
        y: 60,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12 route-title">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Rute Populer
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Destinasi Favorit Pelanggan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih rute perjalanan Anda dari berbagai destinasi populer di Jawa dan Bali
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const price = getRoutePrice(route.from, route.to);
            return (
              <div key={route.id} className="route-card">
                {route.popular && (
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-4">
                    ⭐ Populer
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {route.from}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      {route.to}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-sm text-muted-foreground">Mulai dari</span>
                    <div className="text-xl font-bold text-primary">{formatPrice(price)}</div>
                  </div>
                  <button 
                    onClick={() => handleBookRoute(route.from, route.to)}
                    className="btn-travel text-sm px-4 py-2 group"
                  >
                    Pesan
                    <ArrowRight className="w-4 h-4 ml-1 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
