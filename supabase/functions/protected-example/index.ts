
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { withAuth, corsHeaders } from "../_shared/auth.ts"

// This handler requires authentication and optionally a specific role
const protectedHandler = withAuth(
  async (req, ctx) => {
    // User is authenticated and has the required role if specified
    const { user, supabase } = ctx
    
    // Now you can safely use the authenticated user information
    const data = {
      message: "This is a protected endpoint",
      userId: user.id,
      userEmail: user.email,
      userRole: user.role || "No role assigned"
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  },
  ["admin", "staff"] // Optional: specify allowed roles
)

// Expose the handler as a Deno deployment function
serve(protectedHandler)
