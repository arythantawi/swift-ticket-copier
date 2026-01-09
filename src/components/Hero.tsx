import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Bus, MapPin, Calendar, ArrowRight } from 'lucide-react';
import RouteSearch from './RouteSearch';
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out'
        }
      });
      tl.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1
      }).from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8
      }, '-=0.6').from(searchRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8
      }, '-=0.5').from(decorRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1
      }, '-=0.8');

      // Floating animation for decoration
      gsap.to(decorRef.current, {
        y: -15,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);
  return <section ref={heroRef} className="relative min-h-screen lg:min-h-[95vh] flex items-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 travel-gradient" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-travel-gold/10 rounded-full blur-3xl" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }} />

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Bus className="w-5 h-5" />
              <span className="text-sm font-medium">Travel Minibus Terpercaya</span>
            </div>

            <h1 ref={titleRef} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Perjalanan Nyaman ke
              <span className="block text-travel-gold-light">Seluruh Jawa & Bali</span>
            </h1>

            <p ref={subtitleRef} className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Layanan travel minibus door-to-door dengan armada modern, 
              jadwal fleksibel, dan harga terjangkau untuk perjalanan Anda.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>15+ Kota Tujuan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span>Jadwal Harian</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <span>Armada Modern</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div ref={searchRef}>
            <RouteSearch />
          </div>
        </div>
      </div>

      {/* Decorative minibus illustration placeholder */}
      <div ref={decorRef} className="hidden xl:block absolute bottom-10 right-0 w-80 h-40 opacity-20">
        
      </div>
    </section>;
};
export default Hero;