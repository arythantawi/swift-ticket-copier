import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Initialize Supabase client to fetch data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant data from Supabase
    const [schedulesResult, faqsResult, promosResult] = await Promise.all([
      supabase.from('schedules').select('*').eq('is_active', true),
      supabase.from('faqs').select('*').eq('is_active', true).order('display_order'),
      supabase.from('promos').select('*').eq('is_active', true),
    ]);

    const schedules = schedulesResult.data || [];
    const faqs = faqsResult.data || [];
    const promos = promosResult.data || [];

    // Format schedule data
    const scheduleInfo = schedules.map(s => 
      `- Rute: ${s.route_from} → ${s.route_to}${s.route_via ? ` via ${s.route_via}` : ''}, Jam: ${s.pickup_time}, Harga: Rp ${s.price?.toLocaleString('id-ID')}, Kategori: ${s.category}`
    ).join('\n');

    // Format FAQ data
    const faqInfo = faqs.map(f => 
      `Q: ${f.question}\nA: ${f.answer}`
    ).join('\n\n');

    // Format promo data
    const promoInfo = promos.map(p => 
      `- ${p.title}: ${p.description || ''} ${p.discount_text ? `(${p.discount_text})` : ''} ${p.promo_code ? `Kode: ${p.promo_code}` : ''}`
    ).join('\n');

    // Build system prompt with real data
    const systemPrompt = `Kamu adalah asisten customer service profesional untuk 44Trans, layanan travel antar kota di Indonesia.

ATURAN PENTING:
1. HANYA jawab pertanyaan berdasarkan data yang tersedia di bawah ini
2. Jika informasi tidak ada dalam data, jawab dengan sopan bahwa kamu tidak memiliki informasi tersebut dan sarankan untuk menghubungi customer service via WhatsApp
3. Jangan pernah membuat atau mengarang informasi
4. Gunakan bahasa Indonesia yang sopan dan ramah
5. Format jawaban dengan rapi dan mudah dibaca

DATA JADWAL TRAVEL (AKTIF):
${scheduleInfo || 'Tidak ada jadwal tersedia saat ini.'}

DATA FAQ:
${faqInfo || 'Tidak ada FAQ tersedia.'}

DATA PROMO (AKTIF):
${promoInfo || 'Tidak ada promo tersedia saat ini.'}

INFORMASI UMUM:
- Nama perusahaan: 44Trans
- Layanan: Travel antar kota dengan armada yang nyaman
- Fasilitas: Door to door service, Driver berpengalaman, Jadwal fleksibel
- Untuk booking: Bisa melalui website atau WhatsApp
- Untuk cek status booking: Gunakan fitur "Lacak Booking" di website dengan Order ID dan nomor telepon

Jika pelanggan bertanya tentang:
- Jadwal/harga: Gunakan DATA JADWAL di atas
- Pertanyaan umum: Cek DATA FAQ
- Promo: Gunakan DATA PROMO
- Hal lain yang tidak ada datanya: Sarankan hubungi WhatsApp customer service`;

    // Build conversation for Gemini
    const geminiContents = [];
    
    // Add conversation history
    for (const msg of conversationHistory as ChatMessage[]) {
      geminiContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current message
    geminiContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    const assistantMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan hubungi customer service kami via WhatsApp.';

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in customer-service-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi customer service kami via WhatsApp.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
