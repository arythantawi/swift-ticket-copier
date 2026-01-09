import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tag, Gift, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Promo {
  id: string;
  title: string;
  description: string | null;
  discount_text: string | null;
  promo_code: string | null;
  start_date: string | null;
  end_date: string | null;
}

const PromoSection = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (!error && data) {
        setPromos(data);
      }
      setIsLoading(false);
    };

    fetchPromos();
  }, []);

  if (isLoading || promos.length === 0) return null;

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Promo Spesial</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Penawaran Terbaik Untuk Anda
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Percent className="w-6 h-6 text-primary" />
                  </div>
                  {promo.discount_text && (
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      {promo.discount_text}
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {promo.title}
                </h3>
                
                {promo.description && (
                  <p className="text-muted-foreground mb-4">
                    {promo.description}
                  </p>
                )}

                {promo.promo_code && (
                  <div 
                    onClick={() => copyPromoCode(promo.promo_code!)}
                    className="bg-muted rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-bold text-foreground">
                        {promo.promo_code}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Klik untuk salin</span>
                  </div>
                )}

                {promo.end_date && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Berlaku hingga {new Date(promo.end_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
