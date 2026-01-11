-- Add category column to videos table
ALTER TABLE public.videos 
ADD COLUMN category text NOT NULL DEFAULT 'promosi';

-- Add check constraint for valid categories
ALTER TABLE public.videos 
ADD CONSTRAINT videos_category_check 
CHECK (category IN ('promosi', 'tutorial', 'testimoni'));