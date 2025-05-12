
// Shared query functions for Edge Functions

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

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  location_id: string;
}

export interface Location {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff';
  location_id: string | null;
  phone: string | null;
}

export interface StaffMetric {
  staff_id: string;
  staff_name: string;
  appointments_served: number;
  average_service_time: number;
  no_shows: number;
}

export interface ServiceMetric {
  service_id: string;
  service_name: string;
  appointments_count: number;
  average_wait_time: number;
}

export interface DailyMetric {
  date: string;
  appointments: number;
  wait_time: number;
}
