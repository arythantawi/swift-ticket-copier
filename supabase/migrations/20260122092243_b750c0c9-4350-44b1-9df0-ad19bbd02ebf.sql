-- Add aspect_ratio column to banners table
ALTER TABLE public.banners
ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '16:9';

-- Add comment for documentation
COMMENT ON COLUMN public.banners.aspect_ratio IS 'Aspect ratio for banner container (e.g., 16:9, 21:9, 4:3, 1:1)';