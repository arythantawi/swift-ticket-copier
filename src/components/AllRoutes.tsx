import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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

const AllRoutes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>('Jawa - Bali');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.routes-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
      });

      gsap.from('.route-category', {
        scrollTrigger: {
          trigger: '.routes-container',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="jadwal" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12 routes-title">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Jadwal Lengkap
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Semua Rute & Jadwal
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lihat jadwal keberangkatan lengkap untuk semua rute yang tersedia
          </p>
        </div>

        <div className="routes-container max-w-4xl mx-auto space-y-4">
          {routeCategories.map((category) => (
            <div
              key={category.name}
              className="route-category elevated-card overflow-hidden"
            >
              <button
                onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
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
                  {category.routes.map((route, idx) => (
                    <div
                      key={idx}
                      className="p-5 border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{route.from}</span>
                        {route.via && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-sm text-muted-foreground">{route.via}</span>
                          </>
                        )}
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{route.to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllRoutes;
