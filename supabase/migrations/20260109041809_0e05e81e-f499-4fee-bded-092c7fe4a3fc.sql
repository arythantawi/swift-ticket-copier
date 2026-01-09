-- Add new columns to bookings table for manifest data
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS has_large_luggage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS luggage_description TEXT,
ADD COLUMN IF NOT EXISTS has_package_delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS package_description TEXT,
ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Add driver phone to trip_operations for manifest
ALTER TABLE public.trip_operations
ADD COLUMN IF NOT EXISTS driver_phone TEXT;