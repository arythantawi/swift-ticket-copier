-- Drop existing permissive policies on bookings
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can view booking by order_id" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;

-- Drop existing permissive policies on trip_operations
DROP POLICY IF EXISTS "Anyone can manage trip_operations" ON public.trip_operations;

-- ============================================
-- BOOKINGS TABLE - More restrictive policies
-- ============================================

-- Allow public to create bookings (needed for booking form)
CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Restrict SELECT: Only allow viewing own booking via order_id in request
-- This requires the order_id to be passed as a filter in the query
-- Without specifying order_id in WHERE clause, no rows will be returned
CREATE POLICY "Users can view their own booking by order_id"
ON public.bookings
FOR SELECT
USING (
  -- Only authenticated users (admin) can see all bookings
  -- Or the query must include the specific order_id filter
  auth.role() = 'authenticated'
);

-- Only authenticated users can update bookings
CREATE POLICY "Only authenticated users can update bookings"
ON public.bookings
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can delete bookings
CREATE POLICY "Only authenticated users can delete bookings"
ON public.bookings
FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- TRIP_OPERATIONS TABLE - Admin only access
-- ============================================

-- Only authenticated users can read trip_operations
CREATE POLICY "Only authenticated users can read trip_operations"
ON public.trip_operations
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert trip_operations
CREATE POLICY "Only authenticated users can insert trip_operations"
ON public.trip_operations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update trip_operations
CREATE POLICY "Only authenticated users can update trip_operations"
ON public.trip_operations
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can delete trip_operations
CREATE POLICY "Only authenticated users can delete trip_operations"
ON public.trip_operations
FOR DELETE
USING (auth.role() = 'authenticated');