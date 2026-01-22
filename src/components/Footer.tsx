import { useEffect, useRef, forwardRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, ArrowUpRight, Heart, Search } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo44Trans from "@/assets/logo-44trans.png";
gsap.registerPlugin(ScrollTrigger);
const Footer = forwardRef<HTMLElement>((_, ref) => {
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();
  const routes = ["Surabaya - Denpasar", "Malang - Denpasar", "Surabaya - Jakarta", "Surabaya - Jogja", "Surabaya - Malang", "Surabaya - Banyuwangi"];
  const serviceHours = [{
    day: "Senin - Jumat",
    hours: "06:00 - 22:00"
  }, {
    day: "Sabtu - Minggu",
    hours: "07:00 - 21:00"
  }];
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for footer content
      gsap.from(".footer-content > div", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%"
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);
  return <footer ref={ref || footerRef} id="kontak" className="bg-foreground text-background relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container px-4 sm:px-6 py-12 md:py-16 lg:py-20">
        <div className="footer-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary/50 bg-white/90 p-0.5 shadow-sm flex-shrink-0">
                <img src={logo44Trans} alt="44 Trans Jawa Bali" className="w-full h-full object-contain rounded-full" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl text-background">44 TRANS JAWA BALI</span>
            </div>
            <p className="text-background/60 text-sm mb-6 md:mb-8 leading-relaxed">
              Layanan travel minibus profesional untuk perjalanan nyaman dan aman ke berbagai kota di Jawa dan Bali.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 transition-all duration-300 group" aria-label="Instagram">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="facebook-btn relative px-3 py-1.5 flex items-center text-sm font-semibold cursor-pointer border border-[#0163E0] rounded-full overflow-hidden text-[#0163E0] transition-colors duration-300 ease-out hover:text-white hover:border-[#0163E0] group"
                aria-label="Facebook"
              >
                <span className="absolute inset-0 m-auto rounded-full w-[20em] h-[20em] -left-[5em] transition-shadow duration-500 ease-out z-0 group-hover:shadow-[inset_0_0_0_10em_#0163E0]" />
                <svg 
                  className="relative z-10 w-5 h-5 fill-[#0163E0] group-hover:fill-current transition-colors" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
                </svg>
                <span className="relative z-10 mx-2">Facebook</span>
              </a>
              <a href="https://wa.me/6281233330042" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center hover:bg-green-500 transition-all duration-300 group" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Rute Populer</h4>
            <ul className="space-y-3">
              {routes.map(route => <li key={route}>
                  <a href="#" className="text-background/60 text-sm hover:text-accent transition-colors flex items-center gap-2 group">
                    <MapPin className="w-4 h-4 text-primary/60 group-hover:text-accent transition-colors" />
                    <span>{route}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>)}
            </ul>
          </div>

          {/* Service Hours */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Jam Operasional</h4>
            <div className="space-y-4">
              {serviceHours.map(item => <div key={item.day} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-background font-medium text-sm">{item.day}</p>
                    <p className="text-background/50 text-sm">{item.hours}</p>
                  </div>
                </div>)}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm text-background/80">
                <span className="text-accent font-semibold">📞 Hotline 24 Jam</span>
                <br />
                Untuk informasi & bantuan darurat
              </p>
            </div>

            {/* Track Booking Link */}
            <Link to="/track" className="mt-4 flex items-center gap-2 text-background/60 hover:text-accent transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Search className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
              </div>
              <span className="font-medium text-sm">Cek Status Pesanan</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Hubungi Kami</h4>
            <div className="space-y-4">
              <a href="tel:+6281233330042" className="flex items-start gap-3 text-background/60 hover:text-accent transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-accent/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Telepon / WhatsApp</p>
                  <p className="text-background font-medium text-sm">+62 812-3333-0042</p>
                </div>
              </a>
              <a href="mailto:info@travelminibus.com" className="flex items-start gap-3 text-background/60 hover:text-accent transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5 group-hover:bg-accent/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Email</p>
                  <p className="text-background font-medium text-sm">info@travelminibus.com</p>
                </div>
              </a>
              <div className="flex items-start gap-3 text-background/60">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-background/50">Kantor Pusat</p>
                  <p className="text-background font-medium text-xs">
                    Jl. Letjend Sutoyo No.107, Bungur, Medaeng, Kec. Waru , Kabupaten Sidoarjo, Jawa Timur 61256 
                    <br />
                    ​
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 sm:px-6 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm flex-wrap justify-center">
            <a href="#" className="text-background/50 hover:text-accent transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#" className="text-background/50 hover:text-accent transition-colors">
              Kebijakan Privasi
            </a>
            <button onClick={scrollToTop} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-background/10 flex items-center justify-center hover:bg-primary transition-colors shrink-0" aria-label="Kembali ke atas">
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 -rotate-45 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </footer>;
});
Footer.displayName = "Footer";
export default Footer;