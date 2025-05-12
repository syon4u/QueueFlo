import { useCallback, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "../integrations/supabase/types";

export type StaffSchedule = Tables<"staff_schedules">;

export const useStaffSchedules = (locationId?: string, staffId?: string, date?: string) => {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchStaffSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("staff_schedules").select(`
        *,
        profiles (full_name, role),
        locations (name)
      `);

      if (locationId) {
        query = query.eq("location_id", locationId);
      }
      if (staffId) {
        query = query.eq("staff_id", staffId);
      }
      if (date) {
        query = query.eq("date", date);
      }
      query = query.order("date", { ascending: true }).order("start_time", { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }
      setSchedules(data || []);
    } catch (e) {
      setError(e);
      console.error("Error fetching staff schedules:", e);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [locationId, staffId, date]);

  const createStaffSchedule = async (newScheduleData: TablesInsert<"staff_schedules">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("staff_schedules")
        .insert(newScheduleData)
        .select("*, profiles (full_name, role), locations (name)")
        .single();

      if (insertError) {
        throw insertError;
      }
      if (data) {
        setSchedules(prevSchedules => [...prevSchedules, data].sort((a,b) => new Date(a.date + 'T' + a.start_time).getTime() - new Date(b.date + 'T' + b.start_time).getTime()));
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error creating staff schedule:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStaffSchedule = async (scheduleId: string, updates: TablesUpdate<"staff_schedules">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("staff_schedules")
        .update(updates)
        .eq("id", scheduleId)
        .select("*, profiles (full_name, role), locations (name)")
        .single();

      if (updateError) {
        throw updateError;
      }
      if (data) {
        setSchedules(prevSchedules => 
          prevSchedules.map(sch => sch.id === scheduleId ? data : sch)
                         .sort((a,b) => new Date(a.date + 'T' + a.start_time).getTime() - new Date(b.date + 'T' + b.start_time).getTime())
        );
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error updating staff schedule:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteStaffSchedule = async (scheduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("staff_schedules")
        .delete()
        .eq("id", scheduleId);

      if (deleteError) {
        throw deleteError;
      }
      setSchedules(prevSchedules => prevSchedules.filter(sch => sch.id !== scheduleId));
      return true;
    } catch (e) {
      setError(e);
      console.error("Error deleting staff schedule:", e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffSchedules();
  }, [fetchStaffSchedules]);

  return { schedules, loading, error, fetchStaffSchedules, createStaffSchedule, updateStaffSchedule, deleteStaffSchedule };
};

