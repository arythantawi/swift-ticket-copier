import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Typewriter } from '@/hooks/use-typewriter';

gsap.registerPlugin(ScrollTrigger);

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (faqs.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from('.faq-title', {
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

      gsap.from('.faq-content', {
        scrollTrigger: {
          trigger: '.faq-content',
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      gsap.from('.faq-cta', {
        scrollTrigger: {
          trigger: '.faq-cta',
          start: 'top 90%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Parallax for FAQ content
      gsap.to('.faq-content', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.faq-content',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // Parallax for CTA
      gsap.to('.faq-cta', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.faq-cta',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [faqs.length]);

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
    <section ref={sectionRef} id="faq" className="py-20 bg-muted/20">
      <div className="container">
        <div className="faq-title text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-2.5 rounded-full mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">FAQ</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto min-h-[2rem]">
            {showDescription && (
              <Typewriter
                text="Temukan jawaban untuk pertanyaan umum tentang layanan travel kami"
                speed={25}
                showCursor={false}
              />
            )}
          </p>
        </div>

        <div className="faq-content max-w-3xl mx-auto mb-12">
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
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-lg data-[state=open]:border-primary/20 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                      <span className="font-semibold text-foreground pr-4 text-base">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="faq-cta text-center">
          <div className="inline-flex flex-col items-center p-8 bg-card rounded-2xl border border-border shadow-lg">
            <p className="text-foreground font-medium mb-4">
              Tidak menemukan jawaban yang Anda cari?
            </p>
            <Button 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground gap-2 px-6 py-5"
              onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi Kami
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
