
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { AppointmentStatus, Appointment } from '@/hooks/use-appointments';

/**
 * Hook to fetch and subscribe to realtime appointment updates
 * @param locationId Optional location id to filter appointments
 * @returns Object containing appointments data, loading state, error state, and user queue position info
 */
export function useRealtimeAppointments(locationId?: string) {
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create a fetcher function for SWR
  const fetchAppointments = async () => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase.functions.invoke('appointments');
    
    if (error) throw error;
    
    // Filter by location if specified
    const filteredData = locationId 
      ? data.filter((appointment: Appointment) => appointment.location_id === locationId)
      : data;
    
    return filteredData;
  };

  // Use SWR for data fetching with cache and revalidation
  const { 
    data: appointments, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    user ? ['appointments', locationId, user.id] : null,
    fetchAppointments,
    {
      refreshInterval: 0, // Disable polling as we'll use realtime
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onSuccess: (data) => {
        if (data) {
          calculateUserPosition(data);
        }
      },
      onError: (err) => {
        console.error('Error fetching appointments:', err);
        toast({
          title: 'Error',
          description: 'Failed to load appointments',
          variant: 'destructive',
        });
      }
    }
  );

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'appointments'
        }, 
        () => {
          // When any appointment changes, revalidate the data
          mutate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mutate]);

  // Calculate user's position in queue and estimated wait time
  // Feature 4.2.0: Wait time measurement begins only when customer checks in
  const calculateUserPosition = (appointmentsData: Appointment[]) => {
    if (!user) return;

    // Find user's appointment
    const userAppointment = appointmentsData.find(a => a.customer_id === user.id);
    if (!userAppointment) return;

    // Only count checked-in appointments ahead in the queue
    // This implements Feature 4.2.0 - wait time starts only at check-in
    const checkedInAppointments = appointmentsData.filter(a => 
      // Only consider checked-in or in-progress appointments
      (a.status === 'checked_in' || a.status === 'in_progress') && 
      // For checked-in appointments, use check_in_time for sorting
      ((a.check_in_time && userAppointment.check_in_time && 
        new Date(a.check_in_time) <= new Date(userAppointment.check_in_time)) ||
       // If user isn't checked in yet, still show them their position
       (a.status === 'checked_in' && userAppointment.status === 'scheduled')) &&
      a.id !== userAppointment.id
    );

    // Sort by check-in time for more accurate queue position
    checkedInAppointments.sort((a, b) => {
      const aTime = a.check_in_time ? new Date(a.check_in_time).getTime() : 0;
      const bTime = b.check_in_time ? new Date(b.check_in_time).getTime() : 0;
      return aTime - bTime;
    });

    const position = checkedInAppointments.length + 1;
    setUserPosition(position);

    // Estimate wait time (15 minutes per person ahead)
    const waitTimeInMinutes = (position - 1) * 15;
    setEstimatedWaitTime(waitTimeInMinutes);
  };

  return { 
    appointments: appointments || [],
    isLoading, 
    error,
    userPosition,
    estimatedWaitTime,
    refreshAppointments: mutate
  };
}
