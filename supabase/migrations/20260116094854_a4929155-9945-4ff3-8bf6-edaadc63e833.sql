-- Fix the generate_order_id trigger to NOT overwrite client-provided order_id
CREATE OR REPLACE FUNCTION public.generate_order_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only generate order_id if not already provided
  IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
    NEW.order_id := 'TRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  END IF;
  RETURN NEW;
END;
$function$;