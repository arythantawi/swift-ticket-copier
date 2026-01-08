-- Create trip_operations table for managing trip financials
CREATE TABLE public.trip_operations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_date date NOT NULL,
    route_from text NOT NULL,
    route_to text NOT NULL,
    route_via text,
    pickup_time text NOT NULL,
    
    -- Passengers
    total_passengers integer NOT NULL DEFAULT 0,
    
    -- Income
    income_tickets integer NOT NULL DEFAULT 0,
    income_other integer NOT NULL DEFAULT 0,
    
    -- Expenses
    expense_fuel integer NOT NULL DEFAULT 0,
    expense_ferry integer NOT NULL DEFAULT 0,
    expense_snack integer NOT NULL DEFAULT 0,
    expense_meals integer NOT NULL DEFAULT 0,
    expense_driver_commission integer NOT NULL DEFAULT 0,
    expense_driver_meals integer NOT NULL DEFAULT 0,
    expense_toll integer NOT NULL DEFAULT 0,
    expense_parking integer NOT NULL DEFAULT 0,
    expense_other integer NOT NULL DEFAULT 0,
    
    notes text,
    driver_name text,
    vehicle_number text,
    
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (temporary - should be restricted to admin in production)
CREATE POLICY "Allow all to read trip_operations"
ON public.trip_operations
FOR SELECT
USING (true);

CREATE POLICY "Allow insert trip_operations"
ON public.trip_operations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update trip_operations"
ON public.trip_operations
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete trip_operations"
ON public.trip_operations
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_trip_operations_updated_at
BEFORE UPDATE ON public.trip_operations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();