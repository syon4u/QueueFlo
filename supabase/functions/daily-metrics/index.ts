
// Edge Function for retrieving daily appointment metrics
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

interface DailyMetricsParams {
  start_date: string;
  end_date: string;
  location_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    // Get user for role verification
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Get parameters from request
    const params: DailyMetricsParams = await req.json();
    const { start_date, end_date, location_id } = params;

    if (!start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: "Start date and end date are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Base query for appointments in the date range
    let query = supabaseClient
      .from('appointments')
      .select(`
        id,
        status,
        scheduled_time,
        check_in_time,
        start_time,
        end_time
      `)
      .gte('scheduled_time', start_date)
      .lte('scheduled_time', end_date);
    
    // Add location filter if provided
    if (location_id) {
      query = query.eq('location_id', location_id);
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error("Error fetching appointments:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch appointment data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Process appointments to generate daily metrics
    const dailyMap = new Map();
    
    appointments.forEach((appointment: any) => {
      // Extract date part only from scheduled_time
      const appointmentDate = appointment.scheduled_time.split('T')[0];
      
      // Initialize date record if doesn't exist
      if (!dailyMap.has(appointmentDate)) {
        dailyMap.set(appointmentDate, {
          date: appointmentDate,
          appointments: 0,
          wait_time_total: 0,
          wait_time_count: 0
        });
      }
      
      const dateRecord = dailyMap.get(appointmentDate);
      
      // Count appointment
      dateRecord.appointments += 1;
      
      // Calculate wait time (check-in to start) if applicable
      if (appointment.check_in_time && appointment.start_time) {
        const checkInTime = new Date(appointment.check_in_time);
        const startTime = new Date(appointment.start_time);
        const waitTimeMinutes = (startTime.getTime() - checkInTime.getTime()) / (1000 * 60);
        
        if (waitTimeMinutes >= 0) { // Only count positive wait times
          dateRecord.wait_time_total += waitTimeMinutes;
          dateRecord.wait_time_count += 1;
        }
      }
    });
    
    // Calculate average wait time and format results
    const dailyMetrics = Array.from(dailyMap.values()).map(day => ({
      date: day.date,
      appointments: day.appointments,
      wait_time: day.wait_time_count > 0 ? 
        day.wait_time_total / day.wait_time_count : 0
    }));
    
    // Sort by date
    dailyMetrics.sort((a, b) => a.date.localeCompare(b.date));
    
    // Return the metrics
    return new Response(
      JSON.stringify(dailyMetrics),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
