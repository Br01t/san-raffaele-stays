import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabase-config';

export { isSupabaseConfigured, supabaseUrl, supabaseAnonKey };

// Istanza client Supabase (importare solo da codice dell'area admin)
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // nessun flusso OAuth/magic-link: evita di leggere token dall'URL
    },
  }
);
