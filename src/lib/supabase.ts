import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/^VITE_SUPABASE_URL=/, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^VITE_SUPABASE_ANON_KEY=/, '').trim();

// Controlla se le chiavi Supabase sono reali o se è ancora attivo il segnaposto
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 10 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Istanza client Supabase
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
