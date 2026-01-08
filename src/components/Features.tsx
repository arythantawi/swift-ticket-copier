import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Calendar, Wallet, MousePointerClick, Car, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MapPin,
    title: 'Door to Door Service',
    description: 'Penjemputan dan pengantaran langsung ke alamat tujuan tanpa perlu transit yang merepotkan.',
  },
  {
    icon: Calendar,
    title: 'Berangkat Setiap Hari',
    description: 'Jadwal keberangkatan tersedia setiap hari dengan pilihan jam yang fleksibel.',
  },
  {
    icon: Wallet,
    title: 'Harga Terjangkau & Transparan',
    description: 'Tarif kompetitif tanpa biaya tersembunyi, sesuai dengan kualitas layanan yang diberikan.',
  },
  {
    icon: MousePointerClick,
    title: 'Pemesanan Lebih Mudah',
    description: 'Proses pemesanan cepat, praktis, dan dapat dilakukan langsung melalui website.',
  },
];

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
      });

      gsap.from('.info-card', {
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 feature-title">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Mengapa Memilih Kami?
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Keunggulan Layanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kami berkomitmen memberikan pengalaman perjalanan yang aman, nyaman, dan terpercaya untuk setiap pelanggan.
          </p>
        </div>

        {/* Features Grid */}
        <div className="feature-grid grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="info-section bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Informasi Layanan Area Surabaya
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Layanan Door to Door di Wilayah Surabaya:</strong> Kami melayani penjemputan dan pengantaran di seluruh area Surabaya yang dapat diakses kendaraan roda empat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
