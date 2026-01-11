import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CalendarClock, Wallet, Smartphone, ArrowRight, MapPin, ChevronDown, Search, FileText, CreditCard, CheckCircle, MessageCircle } from 'lucide-react';
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
    dialogType: 'schedule' as const,
  },
  {
    icon: Wallet,
    title: 'Harga Terjangkau',
    description: 'Tarif kompetitif untuk semua rute',
    gradient: 'from-amber-500 to-orange-500',
    dialogType: 'price' as const,
  },
  {
    icon: Smartphone,
    title: 'Pesan Via Online',
    description: 'Proses booking cepat dan mudah',
    gradient: 'from-emerald-500 to-teal-500',
    dialogType: 'booking' as const,
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scheduleDialogRef = useRef<HTMLDivElement>(null);
  const priceDialogRef = useRef<HTMLDivElement>(null);
  const bookingDialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>('Jawa - Bali');
  const [openPriceCategory, setOpenPriceCategory] = useState<string | null>('Jawa - Bali');

  // GSAP animation for Schedule Dialog
  useEffect(() => {
    if (showSchedule && scheduleDialogRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.schedule-header',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.schedule-category',
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
      }, scheduleDialogRef);
      return () => ctx.revert();
    }
  }, [showSchedule]);

  // GSAP animation for Price Dialog
  useEffect(() => {
    if (showPrice && priceDialogRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.price-header',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.price-category',
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
      }, priceDialogRef);
      return () => ctx.revert();
    }
  }, [showPrice]);

  // GSAP animation for Booking Dialog
  useEffect(() => {
    if (showBooking && bookingDialogRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.booking-header',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.booking-step',
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.2)', delay: 0.2 }
        );
        gsap.fromTo(
          '.booking-tips',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.8 }
        );
        gsap.fromTo(
          '.booking-cta',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 1 }
        );
      }, bookingDialogRef);
      return () => ctx.revert();
    }
  }, [showBooking]);

  const handleServiceClick = (dialogType: string) => {
    if (dialogType === 'schedule') setShowSchedule(true);
    else if (dialogType === 'price') setShowPrice(true);
    else if (dialogType === 'booking') setShowBooking(true);
  };

  const bookingSteps = [
    {
      icon: Search,
      title: 'Pilih Rute & Jadwal',
      description: 'Cari rute perjalanan dari kota asal ke kota tujuan, lalu pilih jadwal keberangkatan yang sesuai.',
    },
    {
      icon: FileText,
      title: 'Isi Data Penumpang',
      description: 'Lengkapi formulir pemesanan dengan data diri, alamat penjemputan, dan jumlah penumpang.',
    },
    {
      icon: CreditCard,
      title: 'Lakukan Pembayaran',
      description: 'Transfer ke rekening yang tersedia, lalu upload bukti pembayaran untuk verifikasi.',
    },
    {
      icon: CheckCircle,
      title: 'Konfirmasi Booking',
      description: 'Setelah pembayaran diverifikasi, Anda akan menerima konfirmasi booking via WhatsApp.',
    },
    {
      icon: MessageCircle,
      title: 'Siap Berangkat',
      description: 'Driver akan menghubungi Anda sehari sebelum keberangkatan untuk koordinasi penjemputan.',
    },
  ];

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
                onClick={() => handleServiceClick(service.dialogType)}
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
          <div ref={scheduleDialogRef}>
            <DialogHeader className="schedule-header">
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
                  className="schedule-category rounded-xl border border-border overflow-hidden bg-card"
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
                      {category.routes.map((route, idx) => (
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
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Dialog */}
      <Dialog open={showPrice} onOpenChange={setShowPrice}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <div ref={priceDialogRef}>
            <DialogHeader className="price-header">
              <DialogTitle className="text-2xl font-display flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                Daftar Harga Tiket
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4">
              {routeCategories.map((category) => (
                <div
                  key={category.name}
                  className="price-category rounded-xl border border-border overflow-hidden bg-card"
                >
                  <button
                    onClick={() => setOpenPriceCategory(openPriceCategory === category.name ? null : category.name)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-amber-500" />
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
                        openPriceCategory === category.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openPriceCategory === category.name && (
                    <div className="border-t border-border">
                      {category.routes.map((route, idx) => {
                        const price = getRoutePrice(route.from, route.to);
                        return (
                          <div
                            key={idx}
                            className="p-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/20 transition-colors"
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
                              <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                                {formatPrice(price)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Guide Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <div ref={bookingDialogRef}>
            <DialogHeader className="booking-header">
              <DialogTitle className="text-2xl font-display flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                Panduan Pemesanan Online
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 mt-4">
              <div className="space-y-4">
                {bookingSteps.map((step, index) => (
                  <div
                    key={index}
                    className="booking-step flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold relative">
                        <step.icon className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-semibold text-foreground mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="booking-tips mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium mb-2">
                  💡 Tips Pemesanan:
                </p>
                <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                  <li>• Pesan minimal H-1 sebelum keberangkatan</li>
                  <li>• Pastikan alamat penjemputan jelas dan mudah dijangkau</li>
                  <li>• Simpan nomor kontak admin untuk koordinasi</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setShowBooking(false);
                  navigate('/search');
                }}
                className="booking-cta w-full mt-6 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Mulai Pesan Sekarang
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Services;
