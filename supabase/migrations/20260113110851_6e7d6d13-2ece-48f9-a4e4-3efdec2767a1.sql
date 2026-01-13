-- Drop existing function
DROP FUNCTION IF EXISTS public.get_booking_by_order_id(text);

-- Create new function that requires phone verification
CREATE OR REPLACE FUNCTION public.get_booking_by_order_id(p_order_id text, p_customer_phone text)
 RETURNS TABLE(
   order_id text, 
   customer_name text, 
   customer_phone text, 
   travel_date date, 
   pickup_time text, 
   route_from text, 
   route_to text, 
   route_via text, 
   pickup_address text, 
   dropoff_address text, 
   passengers integer, 
   total_price integer, 
   payment_status text, 
   created_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    b.order_id,
    b.customer_name,
    b.customer_phone,
    b.travel_date,
    b.pickup_time,
    b.route_from,
    b.route_to,
    b.route_via,
    b.pickup_address,
    b.dropoff_address,
    b.passengers,
    b.total_price,
    b.payment_status,
    b.created_at
  FROM public.bookings b
  WHERE b.order_id = p_order_id
    AND b.customer_phone = p_customer_phone
  LIMIT 1;
$function$;