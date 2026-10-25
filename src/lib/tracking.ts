import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabase-config';
import { SiteEvent } from '@/types/database';

const LS_SITE_EVENTS = 'srs_site_events';
const LS_OPT_OUT = 'srs_no_track';
const SESSION_KEY = 'srs_session_id';

/** Tipi di evento registrati sul sito pubblico. */
export type SiteEventType =
  | 'page_view'
  | 'phone_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'form_start'
  | 'form_submit'
  | 'form_error';

function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'no-session';
  }
}

/**
 * Esclude dal conteggio i bot e il titolare del sito.
 * Per escludere il proprio browser: aprire una volta il sito con ?notrack=1
 * (per riattivare il tracciamento: ?notrack=0).
 */
export function shouldSkipTracking(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('notrack');
    if (param === '1') localStorage.setItem(LS_OPT_OUT, '1');
    if (param === '0') localStorage.removeItem(LS_OPT_OUT);
    if (localStorage.getItem(LS_OPT_OUT) === '1') return true;
  } catch {
    /* storage non disponibile */
  }
  if (typeof navigator !== 'undefined') {
    if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
    if (/bot|crawler|spider|headless|lighthouse|prerender/i.test(navigator.userAgent)) return true;
  }
  return false;
}

function saveLocally(payload: Omit<SiteEvent, 'id'>) {
  try {
    const raw = localStorage.getItem(LS_SITE_EVENTS);
    const events: SiteEvent[] = raw ? (JSON.parse(raw) as SiteEvent[]) : [];
    events.unshift({ ...payload, id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
    if (events.length > 2000) events.length = 2000;
    localStorage.setItem(LS_SITE_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.debug('Tracking locale non registrato:', err);
  }
}

/**
 * Registra un evento. Usa fetch con `keepalive` così la richiesta
 * NON viene cancellata quando il click apre subito il dialer (tel:),
 * WhatsApp o cambia pagina: è il motivo principale dei click "persi".
 */
export function trackEvent(
  eventType: SiteEventType | string,
  metadata: Record<string, unknown> = {},
  pagePath: string = window.location.pathname
): void {
  if (shouldSkipTracking()) return;

  const payload = {
    event_type: eventType,
    page_path: pagePath,
    metadata,
    session_id: getSessionId(),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    // Solo sul browser del visitatore: l'admin NON vedrà questi dati.
    saveLocally(payload);
    return;
  }

  try {
    void fetch(`${supabaseUrl}/rest/v1/site_events`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    }).catch((err) => console.debug('Tracking non registrato:', err));
  } catch (err) {
    console.debug('Tracking non registrato:', err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Riepilogo per la dashboard admin (nessuna dipendenza da supabase-js)       */
/* -------------------------------------------------------------------------- */

/** Una riga di riepilogo: stesso formato della funzione SQL admin_site_event_summary. */
export interface SiteEventSummaryRow {
  event_type: string;
  page_path: string;
  label: string | null;
  apartment: string | null;
  cnt: number;
}

/** Eventi salvati nel browser (solo modalità locale, senza Supabase). */
export function getLocalSiteEvents(sinceIso?: string): SiteEvent[] {
  try {
    const raw = localStorage.getItem(LS_SITE_EVENTS);
    let events = raw ? (JSON.parse(raw) as SiteEvent[]) : [];
    if (sinceIso) events = events.filter((e) => e.created_at >= sinceIso);
    return events;
  } catch {
    return [];
  }
}

/** Raggruppa gli eventi come fa il database (tipo, pagina, pulsante, alloggio). */
export function summarizeEvents(events: SiteEvent[]): SiteEventSummaryRow[] {
  const map = new Map<string, SiteEventSummaryRow>();
  for (const e of events) {
    const md = (e.metadata || {}) as Record<string, unknown>;
    const label = md.label != null ? String(md.label) : md.form != null ? String(md.form) : null;
    const apartment = md.apartment != null ? String(md.apartment) : null;
    const key = `${e.event_type}|${e.page_path}|${label}|${apartment}`;
    const row = map.get(key) ?? { event_type: e.event_type, page_path: e.page_path, label, apartment, cnt: 0 };
    row.cnt += 1;
    map.set(key, row);
  }
  return [...map.values()];
}
