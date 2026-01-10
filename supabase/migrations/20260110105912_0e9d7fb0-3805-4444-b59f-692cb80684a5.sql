-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_photo_url TEXT,
  customer_location TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  route_taken TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active testimonials
CREATE POLICY "Public can read active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin management
CREATE POLICY "Anyone can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, customer_location, rating, testimonial_text, route_taken, display_order) VALUES
('Budi Santoso', 'Surabaya', 5, 'Pelayanan sangat memuaskan! Driver ramah dan tepat waktu. Armada bersih dan nyaman. Pasti akan pakai lagi untuk perjalanan berikutnya.', 'Surabaya - Denpasar', 1),
('Siti Rahayu', 'Malang', 5, 'Pertama kali pakai travel ini dan langsung jatuh cinta. Harga terjangkau, fasilitas lengkap, dan yang paling penting aman sampai tujuan.', 'Malang - Denpasar', 2),
('Ahmad Wijaya', 'Jakarta', 5, 'Sudah 3 kali pakai layanan ini untuk perjalanan Jakarta-Surabaya. Selalu puas dengan pelayanannya. Recommended banget!', 'Jakarta - Surabaya', 3),
('Dewi Lestari', 'Banyuwangi', 4, 'Door to door service-nya sangat membantu. Tidak perlu repot ke terminal. Dijemput di rumah dan diantar sampai alamat tujuan.', 'Banyuwangi - Surabaya', 4),
('Rudi Hermawan', 'Jogja', 5, 'Perjalanan panjang tapi tidak terasa karena armadanya nyaman. Free makan dan snack juga jadi nilai plus. Terima kasih!', 'Jogja - Surabaya', 5),
('Linda Permata', 'Kediri', 5, 'Customer service-nya sangat responsif. Booking mudah, pembayaran fleksibel. Top markotop!', 'Kediri - Surabaya', 6);