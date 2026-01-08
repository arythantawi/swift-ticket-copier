-- Create schedules table for route management
CREATE TABLE public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    route_from text NOT NULL,
    route_to text NOT NULL,
    route_via text,
    pickup_time text NOT NULL,
    category text NOT NULL,
    price integer NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active schedules (public facing)
CREATE POLICY "Anyone can view active schedules"
ON public.schedules
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();