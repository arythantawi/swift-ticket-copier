import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple email sending via Resend REST API
const sendEmail = async (to: string, subject: string, html: string) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return { error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "44 Trans Jawa Bali <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return { error: errorText };
    }

    return await response.json();
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Email send error:", error);
    return { error: error.message };
  }
};

interface BookingNotificationRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  routeFrom: string;
  routeTo: string;
  routeVia?: string;
  pickupTime: string;
  travelDate: string;
  passengers: number;
  totalPrice: number;
  pickupAddress: string;
  dropoffAddress?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingNotificationRequest = await req.json();
    
    // Get admin emails from super_admin roles
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get admin profiles with phone numbers for potential WhatsApp
    const { data: adminProfiles } = await supabase
      .from('admin_profiles')
      .select('phone_number, user_id');
    
    // Get super admin user IDs
    const { data: superAdminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin');
    
    const superAdminUserIds = superAdminRoles?.map(r => r.user_id) || [];
    
    // Get admin email from auth.users (via service role)
    const adminEmails: string[] = [];
    for (const userId of superAdminUserIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }
    
    // Build email content
    const routeText = booking.routeVia 
      ? `${booking.routeFrom} → ${booking.routeVia} → ${booking.routeTo}`
      : `${booking.routeFrom} → ${booking.routeTo}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; margin-bottom: 15px; }
          .info-label { font-weight: 600; color: #6b7280; width: 140px; flex-shrink: 0; }
          .info-value { color: #1f2937; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .price { font-size: 24px; font-weight: 700; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Pesanan Baru!</h1>
            <p style="margin: 10px 0 0;">44 Trans Jawa Bali</p>
          </div>
          <div class="content">
            <div class="highlight">
              <strong>Order ID:</strong> ${booking.orderId}<br>
              <span class="badge">Menunggu Pembayaran</span>
            </div>
            
            <h3 style="margin-top: 0;">📋 Detail Pesanan</h3>
            <div class="info-row">
              <span class="info-label">Nama:</span>
              <span class="info-value">${booking.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. Telepon:</span>
              <span class="info-value">${booking.customerPhone}</span>
            </div>
            ${booking.customerEmail ? `
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${booking.customerEmail}</span>
            </div>
            ` : ''}
            
            <h3>🚐 Rute Perjalanan</h3>
            <div class="info-row">
              <span class="info-label">Rute:</span>
              <span class="info-value"><strong>${routeText}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal:</span>
              <span class="info-value">${formatDate(booking.travelDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Jam Jemput:</span>
              <span class="info-value">${booking.pickupTime} WIB</span>
            </div>
            <div class="info-row">
              <span class="info-label">Penumpang:</span>
              <span class="info-value">${booking.passengers} orang</span>
            </div>
            
            <h3>📍 Alamat</h3>
            <div class="info-row">
              <span class="info-label">Penjemputan:</span>
              <span class="info-value">${booking.pickupAddress.replace(/\n/g, '<br>')}</span>
            </div>
            ${booking.dropoffAddress ? `
            <div class="info-row">
              <span class="info-label">Pengantaran:</span>
              <span class="info-value">${booking.dropoffAddress.replace(/\n/g, '<br>')}</span>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
              <p style="margin: 0; color: #6b7280;">Total Pembayaran</p>
              <p class="price">${formatPrice(booking.totalPrice)}</p>
            </div>
          </div>
          <div class="footer">
            <p>Email ini dikirim otomatis dari sistem 44 Trans Jawa Bali</p>
            <p>© ${new Date().getFullYear()} 44 Trans Jawa Bali</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to all super admins
    const emailResults: any[] = [];
    
    for (const email of adminEmails) {
      const result = await sendEmail(
        email,
        `🆕 Pesanan Baru: ${booking.orderId} - ${booking.customerName}`,
        emailHtml
      );
      emailResults.push(result);
    }

    // Also send confirmation to customer if email provided
    if (booking.customerEmail) {
      const customerEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Terima Kasih, ${booking.customerName}!</h1>
              <p>Pesanan Anda telah kami terima</p>
            </div>
            <div class="content">
              <div class="highlight">
                <p style="margin: 0;"><strong>Nomor Pesanan:</strong> ${booking.orderId}</p>
                <p style="margin: 5px 0 0;">Simpan nomor ini untuk melacak status pesanan Anda</p>
              </div>
              
              <h3>Rincian Perjalanan</h3>
              <p><strong>Rute:</strong> ${routeText}</p>
              <p><strong>Tanggal:</strong> ${formatDate(booking.travelDate)}</p>
              <p><strong>Jam Jemput:</strong> ${booking.pickupTime} WIB</p>
              <p><strong>Jumlah Penumpang:</strong> ${booking.passengers} orang</p>
              <p><strong>Total:</strong> ${formatPrice(booking.totalPrice)}</p>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>⏳ Langkah Selanjutnya:</strong><br>
                Silakan lakukan pembayaran dan upload bukti transfer melalui halaman yang telah disediakan.
              </div>
            </div>
            <div class="footer">
              <p>Jika ada pertanyaan, hubungi kami via WhatsApp</p>
              <p>© ${new Date().getFullYear()} 44 Trans Jawa Bali</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const customerResult = await sendEmail(
        booking.customerEmail,
        `Konfirmasi Pesanan ${booking.orderId} - 44 Trans Jawa Bali`,
        customerEmailHtml
      );
      emailResults.push(customerResult);
    }

    const successCount = emailResults.filter((r: any) => !r.error).length;
    const failCount = emailResults.filter((r: any) => r.error).length;
    
    console.log(`Emails sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifikasi terkirim ke ${successCount} penerima`,
        adminEmails: adminEmails.length,
        customerNotified: !!booking.customerEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
