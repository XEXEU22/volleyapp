import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// We let the client be created even if keys are empty. 
// index.tsx has a check that will show a user-friendly error screen instead of a blank page.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

