
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { handleCors, corsHeaders } from "../_shared/auth.ts"

// This handler doesn't require authentication
const publicHandler = async (req: Request) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse
  
  // This endpoint is public and doesn't require authentication
  const data = {
    message: "This is a public endpoint",
    timestamp: new Date().toISOString()
  }
  
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}

// Expose the handler as a Deno deployment function
serve(publicHandler)
