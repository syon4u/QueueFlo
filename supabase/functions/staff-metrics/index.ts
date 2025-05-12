
// Edge Function for retrieving staff performance metrics
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

interface StaffMetricsParams {
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
    const params: StaffMetricsParams = await req.json();
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
        end_time,
        staff_id,
        staff:staff_id (id, first_name, last_name)
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
    
    // Process appointments to generate staff metrics
    const staffMap = new Map();
    
    appointments.forEach((appointment: any) => {
      const staffId = appointment.staff_id;
      if (!staffId) return;
      
      // Get staff name
      const staffName = appointment.staff ? 
        `${appointment.staff.first_name} ${appointment.staff.last_name}` : 
        'Unknown';
      
      // Initialize staff record if doesn't exist
      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staff_id: staffId,
          staff_name: staffName,
          appointments_served: 0,
          service_time_total: 0,
          no_shows: 0,
          completed_count: 0
        });
      }
      
      const staffRecord = staffMap.get(staffId);
      
      // Count completed appointments and calculate service time
      if (appointment.status === 'completed' && appointment.start_time && appointment.end_time) {
        staffRecord.appointments_served += 1;
        
        // Calculate service time in minutes
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        const serviceTimeMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        staffRecord.service_time_total += serviceTimeMinutes;
        staffRecord.completed_count += 1;
      }
      
      // Count no-shows
      if (appointment.status === 'no_show') {
        staffRecord.no_shows += 1;
      }
    });
    
    // Calculate average service time and format results
    const staffMetrics = Array.from(staffMap.values()).map(staff => ({
      staff_id: staff.staff_id,
      staff_name: staff.staff_name,
      appointments_served: staff.appointments_served,
      average_service_time: staff.completed_count > 0 ? 
        staff.service_time_total / staff.completed_count : 0,
      no_shows: staff.no_shows
    }));
    
    // Return the metrics
    return new Response(
      JSON.stringify(staffMetrics),
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
