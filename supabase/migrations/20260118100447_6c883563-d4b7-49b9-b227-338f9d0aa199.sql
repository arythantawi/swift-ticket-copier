-- Make title optional for videos table
ALTER TABLE public.videos ALTER COLUMN title DROP NOT NULL;

-- Make title optional for banners table  
ALTER TABLE public.banners ALTER COLUMN title DROP NOT NULL;