// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://diadwozorwkzhexhjfgb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWR3b3pvcndremhleGhqZmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MTQyODEsImV4cCI6MjA2MjQ5MDI4MX0.WGtQJCeSW99Dklx0bu1b6KoNb2utGaCAfsWY46xuHbw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);