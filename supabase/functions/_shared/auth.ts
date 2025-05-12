
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Database } from './types.ts'

// Constants for CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface for the context object passed to handlers
export interface AuthContext {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  supabase: ReturnType<typeof createClient<Database>>;
}

// Type for the request handler function with AuthContext
export type AuthenticatedHandler = (
  req: Request, 
  ctx: AuthContext
) => Promise<Response>;

// Handle CORS preflight requests
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Higher-order function that wraps an edge function handler with authentication and authorization
 * @param handler The function handler to wrap
 * @param allowedRoles Optional array of roles that are allowed to access the handler
 */
export function withAuth(
  handler: AuthenticatedHandler, 
  allowedRoles?: string[]
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    // Handle CORS preflight requests
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    
    try {
      // Get authorization header
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid authorization header' }),
          { status: 401, headers: corsHeaders }
        );
      }
      
      // Extract JWT token
      const token = authHeader.replace('Bearer ', '');
      
      // Get Supabase URL and key from environment variables
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        return new Response(
          JSON.stringify({ error: 'Missing Supabase configuration' }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      // Create Supabase client with admin privileges
      const supabase = createClient<Database>(supabaseUrl, supabaseKey);
      
      // Verify JWT token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid JWT token' }),
          { status: 401, headers: corsHeaders }
        );
      }
      
      // If roles are specified, check if user has the required role
      if (allowedRoles && allowedRoles.length > 0) {
        // Query user roles using the user_roles table
        // Assuming you have a user_roles table as recommended in best practices
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          return new Response(
            JSON.stringify({ error: 'Error verifying user permissions' }),
            { status: 500, headers: corsHeaders }
          );
        }
        
        // Extract role values from the query result
        const userRoles = roles?.map(r => r.role) || [];
        
        // Check if user has any of the allowed roles
        const hasAllowedRole = userRoles.some(role => 
          allowedRoles.includes(role)
        );
        
        if (!hasAllowedRole) {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: corsHeaders }
          );
        }
      }
      
      // Create auth context with user info and supabase client
      const ctx: AuthContext = {
        user: {
          id: user.id,
          email: user.email || '',
          role: roles?.[0]?.role,  // Include the user's role if available
        },
        supabase,
      };
      
      // Call the handler with the request and auth context
      return await handler(req, ctx);
      
    } catch (error) {
      console.error('Auth error:', error);
      
      return new Response(
        JSON.stringify({ error: 'Authentication error', details: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  };
}

// Create a TypeScript interface to use for the database types
export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at?: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        }
      }
      // Add other tables as needed
    }
  }
}
