/**
 * Configurazione Supabase SENZA importare supabase-js.
 * Il sito pubblico (tracciamento) usa solo questo file, così la libreria
 * (~50 KB gzip) viene scaricata soltanto entrando nell'area admin.
 */
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const supabaseUrl = rawUrl.replace(/^VITE_SUPABASE_URL=/, '').trim();
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  .trim()
  .replace(/^VITE_SUPABASE_ANON_KEY=/, '')
  .trim();

// Controlla se le chiavi Supabase sono reali o se è ancora attivo il segnaposto
export const isSupabaseConfigured = (): boolean =>
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 10 &&
  !supabaseAnonKey.includes('your-anon-key');
