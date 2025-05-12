
// Edge Function for retrieving service metrics
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

interface ServiceMetricsParams {
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
    const params: ServiceMetricsParams = await req.json();
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
        service_id,
        service:service_id (id, name)
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
    
    // Process appointments to generate service metrics
    const serviceMap = new Map();
    
    appointments.forEach((appointment: any) => {
      const serviceId = appointment.service_id;
      if (!serviceId) return;
      
      // Get service name
      const serviceName = appointment.service ? appointment.service.name : 'Unknown';
      
      // Initialize service record if doesn't exist
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          service_id: serviceId,
          service_name: serviceName,
          appointments_count: 0,
          wait_time_total: 0,
          wait_time_count: 0
        });
      }
      
      const serviceRecord = serviceMap.get(serviceId);
      
      // Count appointments
      serviceRecord.appointments_count += 1;
      
      // Calculate wait time (check-in to start) if applicable
      if (appointment.check_in_time && appointment.start_time) {
        const checkInTime = new Date(appointment.check_in_time);
        const startTime = new Date(appointment.start_time);
        const waitTimeMinutes = (startTime.getTime() - checkInTime.getTime()) / (1000 * 60);
        
        if (waitTimeMinutes >= 0) { // Only count positive wait times
          serviceRecord.wait_time_total += waitTimeMinutes;
          serviceRecord.wait_time_count += 1;
        }
      }
    });
    
    // Calculate average wait time and format results
    const serviceMetrics = Array.from(serviceMap.values()).map(service => ({
      service_id: service.service_id,
      service_name: service.service_name,
      appointments_count: service.appointments_count,
      average_wait_time: service.wait_time_count > 0 ? 
        service.wait_time_total / service.wait_time_count : 0
    }));
    
    // Return the metrics
    return new Response(
      JSON.stringify(serviceMetrics),
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
