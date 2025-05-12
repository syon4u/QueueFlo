
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAppointments } from './use-realtime-appointments';

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  location_id: string;
  staff_id: string | null;
  status: AppointmentStatus;
  scheduled_time: string;
  check_in_time: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  reason_for_visit: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppointments(serviceId?: string) {
  // Use our new realtime hook
  const { 
    appointments,
    isLoading: loading,
    error,
    userPosition,
    estimatedWaitTime,
    refreshAppointments
  } = useRealtimeAppointments();
  
  // Filter by service if provided
  const filteredAppointments = serviceId
    ? appointments.filter(appointment => appointment.service_id === serviceId)
    : appointments;

  return { 
    appointments: filteredAppointments, 
    loading, 
    error,
    userPosition,
    estimatedWaitTime,
    refreshAppointments
  };
}
