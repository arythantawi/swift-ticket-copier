-- Add layout_type column to banners table
ALTER TABLE public.banners 
ADD COLUMN layout_type text NOT NULL DEFAULT 'image_caption';

-- Add comment for documentation
COMMENT ON COLUMN public.banners.layout_type IS 'Banner layout type: image_full (full image only), image_overlay (image with text overlay), image_caption (image with caption bar below), text_only (text only without image)';