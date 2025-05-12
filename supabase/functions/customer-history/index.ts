
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { withAuth, corsHeaders, AuthContext } from "../_shared/auth.ts"

interface CustomerHistoryRequest {
  customerId: string;
}

// Handler for retrieving customer history
const customerHistoryHandler = withAuth(async (req: Request, ctx: AuthContext) => {
  try {
    // Parse request body
    const body: CustomerHistoryRequest = await req.json();
    const { customerId } = body;
    
    const { user, supabase } = ctx;
    
    // Check if user is staff or admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const userRole = userRoles && userRoles.length > 0 ? userRoles[0].role : 'customer';
    
    // Only staff and admin can view customer history
    if (userRole !== 'staff' && userRole !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to view customer history' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch customer appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        services:service_id (name)
      `)
      .eq('customer_id', customerId)
      .order('scheduled_time', { ascending: false });
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch appointments', details: appointmentsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        appointments,
        customerId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Expose the handler as a Deno deployment function
serve(customerHistoryHandler);
