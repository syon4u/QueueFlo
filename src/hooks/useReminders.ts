import { useCallback, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "../integrations/supabase/types";

export type Reminder = Tables<"reminders">;

export const useReminders = (appointmentId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchReminders = useCallback(async () => {
    if (!appointmentId) {
      setReminders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("reminders")
        .select("*, message_templates (name, type)")
        .eq("appointment_id", appointmentId)
        .order("send_at", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      setReminders(data || []);
    } catch (e) {
      setError(e);
      console.error("Error fetching reminders:", e);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  // This hook primarily focuses on scheduling a reminder via an Edge Function call
  // as direct reminder creation might involve more complex logic (e.g., queuing)
  const scheduleReminder = async (appointmentIdToSchedule: string, templateId: string, sendAt: string, channel: Enums<"communication_channel">) => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANT: The actual scheduling should be handled by an Edge Function
      // This is a conceptual call to what that function might look like.
      // The function would then insert into the `reminders` table.
      const { data, error: functionError } = await supabase.functions.invoke("schedule-reminder", {
        body: {
          appointment_id: appointmentIdToSchedule,
          message_template_id: templateId,
          send_at: sendAt,
          communication_channel: channel,
        }
      });

      if (functionError) {
        throw functionError;
      }
      // Assuming the function returns the created reminder or a success status
      // For now, we will refetch if an appointmentId context is available, or just log success
      if (appointmentId === appointmentIdToSchedule) {
        fetchReminders(); 
      }
      console.log("Reminder scheduling invoked:", data);
      return data;
    } catch (e) {
      setError(e);
      console.error("Error scheduling reminder:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Direct creation, update, delete might be admin-only or handled by backend processes
  // For example, to update a reminder status (e.g., to 'sent' by a backend worker)
  const updateReminderStatus = async (reminderId: string, status: Enums<"reminder_status">, sentAt?: string, errorMessage?: string) => {
    setLoading(true);
    setError(null);
    try {
        const { data, error: updateError } = await supabase
            .from("reminders")
            .update({ status, sent_at: sentAt, error_message: errorMessage })
            .eq("id", reminderId)
            .select()
            .single();
        if (updateError) throw updateError;
        if (data && appointmentId === data.appointment_id) {
            fetchReminders();
        }
        return data;
    } catch (e) {
        setError(e);
        console.error("Error updating reminder status:", e);
        return null;
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    if (appointmentId) {
      fetchReminders();
    }
  }, [appointmentId, fetchReminders]);

  return { reminders, loading, error, fetchReminders, scheduleReminder, updateReminderStatus };
};

