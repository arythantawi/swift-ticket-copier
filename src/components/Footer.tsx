import { useEffect, useRef } from 'react';
import { Bus, MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, ArrowUpRight, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();

  const routes = [
    'Surabaya - Denpasar',
    'Malang - Denpasar',
    'Surabaya - Jakarta',
    'Surabaya - Jogja',
    'Surabaya - Malang',
    'Surabaya - Banyuwangi',
  ];

  const serviceHours = [
    { day: 'Senin - Jumat', hours: '06:00 - 22:00' },
    { day: 'Sabtu - Minggu', hours: '07:00 - 21:00' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for footer content
      gsap.from('.footer-content > div', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} id="kontak" className="bg-foreground text-background relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="container py-16 md:py-20">
        <div className="footer-content grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Bus className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                Travel Minibus
              </span>
            </div>
            <p className="text-background/60 text-sm mb-8 leading-relaxed">
              Layanan travel minibus profesional untuk perjalanan nyaman dan aman 
              ke berbagai kota di Jawa dan Bali.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-blue-600 transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-green-500 transition-all duration-300 group"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Rute Populer</h4>
            <ul className="space-y-3">
              {routes.map((route) => (
                <li key={route}>
                  <a
                    href="#"
                    className="text-background/60 text-sm hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <MapPin className="w-4 h-4 text-primary/60 group-hover:text-accent transition-colors" />
                    <span>{route}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Hours */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Jam Operasional</h4>
            <div className="space-y-4">
              {serviceHours.map((item) => (
                <div key={item.day} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-background font-medium text-sm">{item.day}</p>
                    <p className="text-background/50 text-sm">{item.hours}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm text-background/80">
                <span className="text-accent font-semibold">📞 Hotline 24 Jam</span><br />
                Untuk informasi & bantuan darurat
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Hubungi Kami</h4>
            <div className="space-y-4">
              <a
                href="tel:+6281234567890"
                className="flex items-start gap-3 text-background/60 hover:text-accent transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-accent/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Telepon / WhatsApp</p>
                  <p className="text-background font-medium">0812-3456-7890</p>
                </div>
              </a>
              <a
                href="mailto:info@travelminibus.com"
                className="flex items-start gap-3 text-background/60 hover:text-accent transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-accent/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Email</p>
                  <p className="text-background font-medium">info@travelminibus.com</p>
                </div>
              </a>
              <div className="flex items-start gap-3 text-background/60">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Kantor Pusat</p>
                  <p className="text-background font-medium text-sm">
                    Jl. Raya Surabaya No. 123<br />
                    Surabaya, Jawa Timur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm flex items-center gap-1">
            © {currentYear} Travel Minibus. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Indonesia
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-background/50 hover:text-accent transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-background/50 hover:text-accent transition-colors">
              Kebijakan Privasi
            </a>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              aria-label="Kembali ke atas"
            >
              <ArrowUpRight className="w-5 h-5 -rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
