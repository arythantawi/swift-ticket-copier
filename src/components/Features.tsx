import { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Wallet, MousePointerClick, Car, Shield, Clock, Headphones } from 'lucide-react';
import { Typewriter } from '@/hooks/use-typewriter';
import { createSafeGsapContext, ensureElementsVisible } from '@/lib/gsapUtils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const features = [{
  icon: MapPin,
  title: 'Door to Door Service',
  description: 'Penjemputan dan pengantaran langsung ke alamat tujuan tanpa perlu transit.',
  color: 'from-blue-500 to-cyan-500'
}, {
  icon: Calendar,
  title: 'Berangkat Setiap Hari',
  description: 'Jadwal keberangkatan tersedia setiap hari dengan pilihan jam yang fleksibel.',
  color: 'from-emerald-500 to-teal-500'
}, {
  icon: Wallet,
  title: 'Harga Transparan',
  description: 'Tarif kompetitif tanpa biaya tersembunyi, sesuai dengan kualitas layanan.',
  color: 'from-amber-500 to-orange-500'
}, {
  icon: MousePointerClick,
  title: 'Pemesanan Mudah',
  description: 'Proses pemesanan cepat, praktis, dan dapat dilakukan langsung melalui website.',
  color: 'from-purple-500 to-pink-500'
}];
const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [showDescription, setShowDescription] = useState(false);
  useEffect(() => {
    const ctx = createSafeGsapContext(sectionRef, () => {
      gsap.from('.feature-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'all',
        onComplete: () => setShowDescription(true)
      });
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.feature-grid',
          start: 'top 85%'
        },
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
      gsap.from('.info-section', {
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top 85%'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, () => {
      setShowDescription(true);
      ensureElementsVisible(['.feature-title', '.feature-card', '.info-section']);
    });
    return () => {
      ctx?.revert();
      ensureElementsVisible(['.feature-title', '.feature-card', '.info-section']);
    };
  }, []);
  return <section ref={sectionRef} className="py-12 md:py-20 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-14 feature-title">
          <span className="inline-block px-4 md:px-5 py-1.5 md:py-2 bg-accent/10 text-accent rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            Mengapa Memilih Kami?
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Keunggulan Layanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto min-h-[2rem] text-sm md:text-base">
            {showDescription && <Typewriter text="Kami berkomitmen memberikan pengalaman perjalanan yang aman, nyaman, dan terpercaya." speed={25} showCursor={false} />}
          </p>
        </div>

        <div className="feature-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-16 max-w-6xl mx-auto">
          {features.map((feature, index) => <div key={index} className="feature-card group p-5 md:p-7 bg-card rounded-xl md:rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-base md:text-lg font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>)}
        </div>

        <div className="info-section bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-10 border border-primary/10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Car className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-base md:text-xl font-bold text-foreground mb-2 md:mb-3">
                Informasi Layanan Area Surabaya
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3 md:mb-4 text-sm md:text-base">
                <strong className="text-foreground">Layanan Door to Door di Wilayah Surabaya:</strong> ​Kami melayani penjemputan dan pengantaran di seluruh area Surabaya yang dapat diakses kendaraan roda empat.   
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  <span>Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                  <Headphones className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Features;