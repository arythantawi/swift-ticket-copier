import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchSchedules, Schedule } from '@/lib/scheduleData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const origin = searchParams.get('from') || '';
  const destination = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';
  
  const results = searchSchedules(origin, destination);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBook = (schedule: Schedule) => {
    const params = new URLSearchParams({
      scheduleId: schedule.id,
      from: schedule.from,
      to: schedule.to,
      via: schedule.via || '',
      pickupTime: schedule.pickupTime,
      date: date,
      passengers: passengers,
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="container px-4 sm:px-6 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 md:mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          {/* Search Summary */}
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
              Hasil Pencarian
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 md:gap-2 bg-secondary/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="font-medium">{origin}</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <span className="font-medium">{destination}</span>
              </div>
              {date && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-secondary/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                  <span className="line-clamp-1">{formatDate(date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 md:gap-2 bg-secondary/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                <span>{passengers} Penumpang</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              <p className="text-muted-foreground text-sm md:text-base">
                Ditemukan {results.length} jadwal penjemputan
              </p>
              {results.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="elevated-card p-4 md:p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          <span className="text-xl md:text-2xl font-bold text-foreground">
                            {schedule.pickupTime}
                          </span>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          Waktu Penjemputan
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground text-sm md:text-base flex-wrap">
                        <span className="font-medium text-foreground">{schedule.from}</span>
                        {schedule.via && (
                          <>
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-xs md:text-sm">{schedule.via}</span>
                          </>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium text-foreground">{schedule.to}</span>
                      </div>
                    </div>
                    
                    {/* Price & Book Button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border mt-2 md:mt-0">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-muted-foreground">Harga/orang</p>
                        <p className="text-lg md:text-xl font-bold text-primary">{formatPrice(schedule.price)}</p>
                      </div>
                      <button 
                        onClick={() => handleBook(schedule)}
                        className="cta-btn relative flex justify-center items-center rounded-md bg-[#183153] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.2)] overflow-hidden cursor-pointer border-none group"
                      >
                        <span className="absolute inset-0 w-0 bg-accent transition-all duration-400 ease-in-out right-0 group-hover:w-full group-hover:left-0" />
                        <span className="relative text-center w-full px-4 md:px-6 py-2.5 text-white text-xs md:text-sm font-bold tracking-[0.15em] z-20 transition-all duration-300 ease-in-out group-hover:text-[#183153] group-hover:animate-[scaleUp_0.3s_ease-in-out]">
                          PESAN SEKARANG
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="elevated-card p-8 md:p-12 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2">
                Tidak Ada Jadwal Ditemukan
              </h3>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                Maaf, tidak ada jadwal untuk rute {origin} → {destination}
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Coba Rute Lain
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
