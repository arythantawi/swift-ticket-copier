import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setFaqs(data);
      }
      setIsLoading(false);
    };

    fetchFAQs();
  }, []);

  if (isLoading || faqs.length === 0) return null;

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const category = faq.category || 'Umum';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <section id="faq" className="py-16 bg-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang layanan travel kami
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="mb-8">
              {Object.keys(groupedFaqs).length > 1 && (
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {category}
                </h3>
              )}
              <Accordion type="single" collapsible className="space-y-3">
                {categoryFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium text-foreground pr-4">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
