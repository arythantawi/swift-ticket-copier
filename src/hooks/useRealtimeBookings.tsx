import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pickup_address: string;
  dropoff_address: string | null;
  notes: string | null;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  travel_date: string;
  passengers: number;
  total_price: number;
  payment_status: string;
  payment_proof_url: string | null;
  payment_proof_drive_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    pending: number;
    waitingVerification: number;
    paid: number;
    cancelled: number;
  };
}

export const useRealtimeBookings = (limit: number = 500): UseRealtimeBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const calculateStats = useCallback((data: Booking[]) => ({
    total: data.length,
    pending: data.filter(b => b.payment_status === 'pending').length,
    waitingVerification: data.filter(b => b.payment_status === 'waiting_verification').length,
    paid: data.filter(b => b.payment_status === 'paid').length,
    cancelled: data.filter(b => b.payment_status === 'cancelled').length,
  }), []);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    waitingVerification: 0,
    paid: 0,
    cancelled: 0,
  });

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('id, order_id, customer_name, customer_phone, customer_email, pickup_address, dropoff_address, notes, route_from, route_to, route_via, pickup_time, travel_date, passengers, total_price, payment_status, payment_proof_url, payment_proof_drive_id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      
      const bookingsData = data || [];
      setBookings(bookingsData);
      setStats(calculateStats(bookingsData));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Gagal memuat data pemesanan');
      toast.error('Gagal memuat data pemesanan');
    } finally {
      setIsLoading(false);
    }
  }, [limit, calculateStats]);

  // Set up realtime subscription
  useEffect(() => {
    // Initial fetch
    fetchBookings();

    // Set up realtime subscription
    channelRef.current = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Realtime booking update:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking;
            setBookings(prev => {
              const updated = [newBooking, ...prev].slice(0, limit);
              setStats(calculateStats(updated));
              return updated;
            });
            toast.success(`Pesanan baru: ${newBooking.order_id}`, {
              description: `${newBooking.customer_name} - ${newBooking.route_from} → ${newBooking.route_to}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking;
            setBookings(prev => {
              const updated = prev.map(b => 
                b.id === updatedBooking.id ? updatedBooking : b
              );
              setStats(calculateStats(updated));
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setBookings(prev => {
              const updated = prev.filter(b => b.id !== deletedId);
              setStats(calculateStats(updated));
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for bookings');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
          setError('Koneksi realtime terputus');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchBookings, limit, calculateStats]);

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    stats,
  };
};
