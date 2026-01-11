import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Calendar, Wallet, MousePointerClick, Car, Shield, Clock, Headphones } from 'lucide-react';
import { Typewriter } from '@/hooks/use-typewriter';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MapPin,
    title: 'Door to Door Service',
    description: 'Penjemputan dan pengantaran langsung ke alamat tujuan tanpa perlu transit.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calendar,
    title: 'Berangkat Setiap Hari',
    description: 'Jadwal keberangkatan tersedia setiap hari dengan pilihan jam yang fleksibel.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Wallet,
    title: 'Harga Transparan',
    description: 'Tarif kompetitif tanpa biaya tersembunyi, sesuai dengan kualitas layanan.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MousePointerClick,
    title: 'Pemesanan Mudah',
    description: 'Proses pemesanan cepat, praktis, dan dapat dilakukan langsung melalui website.',
    color: 'from-purple-500 to-pink-500',
  },
];

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-title', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => setShowDescription(true),
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.feature-grid',
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.info-section', {
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Parallax for feature cards
      gsap.to('.feature-card', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.feature-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // Parallax for info section
      gsap.to('.info-section', {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14 feature-title">
          <span className="inline-block px-5 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Mengapa Memilih Kami?
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Keunggulan Layanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto min-h-[2rem]">
            {showDescription && (
              <Typewriter
                text="Kami berkomitmen memberikan pengalaman perjalanan yang aman, nyaman, dan terpercaya."
                speed={25}
                showCursor={false}
              />
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="feature-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group p-7 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="info-section bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-10 border border-primary/10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                Informasi Layanan Area Surabaya
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">Layanan Door to Door di Wilayah Surabaya:</strong> Kami melayani penjemputan dan pengantaran di seluruh area Surabaya yang dapat diakses kendaraan roda empat.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Headphones className="w-4 h-4 text-primary" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
