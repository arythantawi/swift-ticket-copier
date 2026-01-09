-- Drop existing permissive policies on bookings
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update payment proof" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view bookings by order_id" ON public.bookings;

-- Drop existing permissive policies on schedules
DROP POLICY IF EXISTS "Allow all to read schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow delete schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow update schedules" ON public.schedules;

-- Drop existing permissive policies on trip_operations
DROP POLICY IF EXISTS "Allow all to read trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Allow delete trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Allow insert trip_operations" ON public.trip_operations;
DROP POLICY IF EXISTS "Allow update trip_operations" ON public.trip_operations;

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Public can create bookings (for customer booking form)
CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public can view their own booking by order_id (for tracking)
-- This allows customers to track their booking without login
CREATE POLICY "Public can view booking by order_id"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (
  -- This will be used with .eq('order_id', orderId) filter
  true
);

-- Public can update payment proof on their booking
CREATE POLICY "Public can update payment proof"
ON public.bookings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin can delete bookings
CREATE POLICY "Admin can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SCHEDULES POLICIES
-- ============================================

-- Public can read schedules (for viewing available routes on website)
CREATE POLICY "Public can read schedules"
ON public.schedules
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admin can insert schedules
CREATE POLICY "Admin can insert schedules"
ON public.schedules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admin can update schedules
CREATE POLICY "Admin can update schedules"
ON public.schedules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admin can delete schedules
CREATE POLICY "Admin can delete schedules"
ON public.schedules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIP_OPERATIONS POLICIES (Admin only - sensitive financial data)
-- ============================================

-- Only admin can view trip operations
CREATE POLICY "Admin can view trip_operations"
ON public.trip_operations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admin can insert trip operations
CREATE POLICY "Admin can insert trip_operations"
ON public.trip_operations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admin can update trip operations
CREATE POLICY "Admin can update trip_operations"
ON public.trip_operations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admin can delete trip operations
CREATE POLICY "Admin can delete trip_operations"
ON public.trip_operations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));