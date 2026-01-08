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
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          {/* Search Summary */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Hasil Pencarian
            </h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{origin}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{destination}</span>
              </div>
              {date && (
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{passengers} Penumpang</span>
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ditemukan {results.length} jadwal penjemputan
              </p>
              {results.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="elevated-card p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold text-foreground">
                            {schedule.pickupTime}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Waktu Penjemputan
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{schedule.from}</span>
                        {schedule.via && (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-sm">{schedule.via}</span>
                          </>
                        )}
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-medium text-foreground">{schedule.to}</span>
                      </div>
                    </div>
                    
                    {/* Price & Book Button */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Harga/orang</p>
                        <p className="text-xl font-bold text-primary">{formatPrice(schedule.price)}</p>
                      </div>
                      <Button 
                        onClick={() => handleBook(schedule)}
                        className="btn-gold"
                      >
                        Pesan Sekarang
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="elevated-card p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Tidak Ada Jadwal Ditemukan
              </h3>
              <p className="text-muted-foreground mb-6">
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
