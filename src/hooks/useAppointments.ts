import { useCallback, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "../integrations/supabase/types";

export type Appointment = Tables<"appointments">;

export const useAppointments = (locationId?: string, serviceId?: string, staffId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("appointments").select(`
        *,
        locations (name),
        services (name, duration_minutes),
        profiles!appointments_customer_id_fkey (full_name, email, phone_number),
        profiles!appointments_staff_id_assigned_fkey (full_name)
      `);

      if (locationId) {
        query = query.eq("location_id", locationId);
      }
      if (serviceId) {
        query = query.eq("service_id", serviceId);
      }
      if (staffId) {
        query = query.eq("staff_id_assigned", staffId);
      }
      if (date) {
        // Assuming date is YYYY-MM-DD, fetch for the whole day
        query = query.gte("scheduled_start_time", `${date}T00:00:00Z`)
                     .lte("scheduled_start_time", `${date}T23:59:59Z`);
      }
      // Add ordering, e.g., by scheduled_start_time
      query = query.order("scheduled_start_time", { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }
      setAppointments(data || []);
    } catch (e) {
      setError(e);
      console.error("Error fetching appointments:", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [locationId, serviceId, staffId, date]);

  const createAppointment = async (newAppointmentData: TablesInsert<"appointments">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("appointments")
        .insert(newAppointmentData)
        .select("*, locations (name), services (name, duration_minutes), profiles!appointments_customer_id_fkey (full_name, email, phone_number), profiles!appointments_staff_id_assigned_fkey (full_name)")
        .single(); // Assuming insert returns a single record

      if (insertError) {
        throw insertError;
      }
      if (data) {
        setAppointments(prevAppointments => [...prevAppointments, data].sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime()));
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error creating appointment:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (appointmentId: string, updates: TablesUpdate<"appointments">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", appointmentId)
        .select("*, locations (name), services (name, duration_minutes), profiles!appointments_customer_id_fkey (full_name, email, phone_number), profiles!appointments_staff_id_assigned_fkey (full_name)")
        .single();

      if (updateError) {
        throw updateError;
      }
      if (data) {
        setAppointments(prevAppointments => 
          prevAppointments.map(app => app.id === appointmentId ? data : app)
                          .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime())
        );
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error updating appointment:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Realtime subscription for appointments
  useEffect(() => {
    fetchAppointments(); // Initial fetch

    const channel = supabase
      .channel("custom-all-appointments-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        (payload) => {
          console.log("Change received!", payload);
          // Refetch or intelligently update the local state
          // This is a simple refetch, could be optimized
          fetchAppointments(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);


  return { appointments, loading, error, fetchAppointments, createAppointment, updateAppointment };
};

