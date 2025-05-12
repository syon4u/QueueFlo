import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { withAuth, corsHeaders, AuthContext } from "../_shared/auth.ts";
// import { Database } from "../_shared/types.ts"; // Assuming Supabase generated types

// Schema for summoning the next customer from a specific queue (service at a location)
const SummonNextCustomerSchema = z.object({
  location_id: z.string().uuid("Invalid location ID format"),
  service_id: z.string().uuid("Invalid service ID format"),
  staff_id: z.string().uuid("Invalid staff ID format"), // Staff member performing the summon
});

// Schema for updating staff status (e.g., to break, available)
const UpdateStaffStatusSchema = z.object({
  staff_id: z.string().uuid("Invalid staff ID format"),
  location_id: z.string().uuid("Invalid location ID format"), // Location context for the status update
  status: z.enum(["working", "break", "unavailable"]), // From staff_schedules table
  // Potentially add start_time/end_time if creating a new schedule entry for break
});

// Schema for updating queue configuration (e.g., allow_new_appointments)
const UpdateQueueConfigSchema = z.object({
  queue_configuration_id: z.string().uuid("Invalid queue configuration ID format"),
  allow_new_appointments: z.boolean().optional(),
  is_active: z.boolean().optional(),
  // Add other configurable fields from queue_configurations table as needed
});

const queueManagementHandler = withAuth(async (req: Request, ctx: AuthContext) => {
  const url = new URL(req.url);
  const method = req.method;
  const { user, supabase } = ctx;

  // Authorization: Ensure user is staff or admin for most actions
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role, id, location_id") // Assuming staff have a default location_id in profiles
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile || !["staff", "admin"].includes(userProfile.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized: Staff or admin access required." }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Summon Next Customer (POST /queue-management/summon-next) ---
    if (method === "POST" && url.pathname.endsWith("/summon-next")) {
      const body = await req.json();
      const validation = SummonNextCustomerSchema.safeParse(body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: "Invalid request data for summoning customer", details: validation.error.format() }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { location_id, service_id, staff_id } = validation.data;

      // Logic to find the next customer:
      // 1. Find appointments for the given location_id and service_id
      // 2. Filter by status 'checked_in'
      // 3. Order by check_in_time (or scheduled_time if check_in_time is not used for ordering)
      // 4. Select the earliest one
      const { data: nextAppointment, error: fetchNextError } = await supabase
        .from("appointments")
        .select("id, customer_id, scheduled_time, check_in_time")
        .eq("location_id", location_id)
        .eq("service_id", service_id)
        .eq("status_new", "checked_in") // Ensure status_new is used as per migrations
        .order("check_in_time", { ascending: true, nullsFirst: false }) // Or scheduled_time
        .limit(1)
        .single();

      if (fetchNextError || !nextAppointment) {
        return new Response(JSON.stringify({ error: "No checked-in customers waiting for this service at this location.", details: fetchNextError?.message }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update the appointment status to 'servicing' and assign staff
      const { data: summonedAppointment, error: updateError } = await supabase
        .from("appointments")
        .update({
          status_new: "servicing",
          staff_id_assigned: staff_id,
          service_start_time: new Date().toISOString(),
        })
        .eq("id", nextAppointment.id)
        .select("*, service:services(name), location:locations(name), customer:profiles(full_name)")
        .single();

      if (updateError) {
        console.error("Error updating appointment to servicing:", updateError);
        return new Response(JSON.stringify({ error: "Failed to summon customer", details: updateError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // TODO: Trigger real-time notification to customer and update staff dashboards

      return new Response(JSON.stringify(summonedAppointment), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Update Staff Status (PATCH /queue-management/staff-status) ---
    if (method === "PATCH" && url.pathname.endsWith("/staff-status")) {
      const body = await req.json();
      const validation = UpdateStaffStatusSchema.safeParse(body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: "Invalid request data for updating staff status", details: validation.error.format() }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { staff_id, location_id, status } = validation.data;

      // Authorization: Ensure the authenticated user is the staff member being updated or an admin.
      if (userProfile.role !== 'admin' && user.id !== staff_id) {
        return new Response(JSON.stringify({ error: "Unauthorized to update this staff member's status." }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // This is a simplified update. A full implementation might involve:
      // - Ending current 'working' entry in staff_schedules.
      // - Creating a new 'break' entry in staff_schedules with start/end times.
      // For now, let's assume a 'current_status' field in the 'profiles' or a dedicated 'staff_status' table.
      // Or update the latest schedule entry for that staff at that location.
      const { data: updatedStaffEntry, error: statusUpdateError } = await supabase
        .from("staff_schedules") // Or 'profiles' if status is there
        .update({ status: status, end_time: status === 'break' ? new Date().toISOString() : undefined }) // Example: end current shift if going on break
        .eq("staff_id", staff_id)
        .eq("location_id", location_id)
        // .is('end_time', null) // To target an active schedule entry
        .order('start_time', { ascending: false })
        .limit(1)
        .select()
        .single();

      if (statusUpdateError) {
        console.error("Error updating staff status:", statusUpdateError);
        return new Response(JSON.stringify({ error: "Failed to update staff status", details: statusUpdateError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // If creating a new break entry, that logic would be here.

      return new Response(JSON.stringify({ success: true, data: updatedStaffEntry }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Update Queue Configuration (PATCH /queue-management/queue-config/{id}) ---
    if (method === "PATCH" && url.pathname.match(/\/queue-management\/queue-config\/[^\/]+$/)) {
        const queueConfigId = url.pathname.split("/").pop();
        if (!queueConfigId) {
            return new Response(JSON.stringify({ error: "Queue Configuration ID is required" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        if (userProfile.role !== 'admin') { // Only admins can change queue configs
             return new Response(JSON.stringify({ error: "Unauthorized: Admin access required for queue configuration." }), {
                status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = await req.json();
        const validation = UpdateQueueConfigSchema.safeParse(body);
        if (!validation.success) {
            return new Response(JSON.stringify({ error: "Invalid request data for updating queue configuration", details: validation.error.format() }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
        const updateData = validation.data;

        const { data: updatedConfig, error: configUpdateError } = await supabase
            .from('queue_configurations')
            .update(updateData)
            .eq('id', queueConfigId)
            .select()
            .single();
        
        if (configUpdateError) {
            console.error("Error updating queue configuration:", configUpdateError);
            return new Response(JSON.stringify({ error: "Failed to update queue configuration", details: configUpdateError.message }), {
                status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }
        return new Response(JSON.stringify(updatedConfig), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // TODO: Add endpoints for calculating real-time queue positions and estimated wait times.
    // TODO: Add endpoints for staff to manage queues (create/edit queues - links to queue_configurations CRUD).

    return new Response(JSON.stringify({ error: "Method not allowed or endpoint not found in queue-management" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error in queueManagementHandler:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

serve(queueManagementHandler);

