import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bus, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#rute', label: 'Rute' },
    { href: '#pembayaran', label: 'Pembayaran' },
    { href: '#kontak', label: 'Kontak' },
  ];

  const trackLink = { to: '/track', label: 'Cek Pesanan' };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-card/95 backdrop-blur-lg shadow-lg border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isScrolled ? 'bg-primary' : 'bg-white/20'
            }`}>
              <Bus className={`w-6 h-6 ${isScrolled ? 'text-primary-foreground' : 'text-white'}`} />
            </div>
            <span className={`font-display font-bold text-lg ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}>
              Travel Minibus
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors hover:text-accent ${
                  isScrolled ? 'text-foreground' : 'text-white/90'
                }`}
              >
                {link.label}
              </a>
            ))}
            <Link
              to={trackLink.to}
              className={`font-medium transition-colors hover:text-accent flex items-center gap-1.5 ${
                isScrolled ? 'text-foreground' : 'text-white/90'
              }`}
            >
              <Search className="w-4 h-4" />
              {trackLink.label}
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button className="btn-gold px-5 py-2">
              Pesan Sekarang
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border py-4 px-2 animate-fade-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-foreground font-medium hover:bg-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/track"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-foreground font-medium hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                Cek Pesanan
              </Link>
              <a
                href="tel:+6281234567890"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground"
              >
                <Phone className="w-4 h-4" />
                <span>0812-3456-7890</span>
              </a>
              <Button className="btn-gold mx-4 mt-2">
                Pesan Sekarang
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
