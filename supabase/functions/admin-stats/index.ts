
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { withAuth, corsHeaders, AuthContext } from "../_shared/auth.ts"

// Handler for admin stats endpoint - restricted to admin role
const adminStatsHandler = withAuth(async (req: Request, ctx: AuthContext) => {
  try {
    // Check if the request is a GET request
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { supabase } = ctx
    
    // Execute a complex SQL query to gather all required statistics in one go
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats')
    
    if (error) {
      console.error('Error fetching admin stats:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch admin statistics', details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
}, ['admin']) // Restrict access to admin role only

// Expose the handler as a Deno deployment function
serve(adminStatsHandler)
