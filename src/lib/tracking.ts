import { supabase, isSupabaseConfigured } from './supabase';
import { SiteEvent } from '@/types/database';

const LS_SITE_EVENTS = 'srs_site_events';
const SESSION_KEY = 'srs_session_id';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function hasAnalyticsConsent(): boolean {
  try {
    const consent = localStorage.getItem('cookieConsent');
    return consent === 'accepted';
  } catch {
    return false;
  }
}

export async function trackEvent(
  eventType: string,
  metadata: Record<string, unknown> = {},
  pagePath: string = window.location.pathname
) {
  const sessionId = getSessionId();
  const eventPayload = {
    event_type: eventType,
    page_path: pagePath,
    metadata,
    session_id: sessionId,
    created_at: new Date().toISOString(),
  };

  try {
    if (isSupabaseConfigured()) {
      await supabase.from('site_events').insert(eventPayload);
      return;
    }

    // Fallback locale per visualizzazione analytics
    const raw = localStorage.getItem(LS_SITE_EVENTS);
    const events: SiteEvent[] = raw ? (JSON.parse(raw) as SiteEvent[]) : [];
    events.unshift({ ...eventPayload, id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
    // Limita a max 500 eventi locali
    if (events.length > 500) events.length = 500;
    localStorage.setItem(LS_SITE_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.debug('Tracking non registrato:', err);
  }
}

export async function getRecentSiteEvents(): Promise<SiteEvent[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('site_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) return data as SiteEvent[];
    }
    const raw = localStorage.getItem(LS_SITE_EVENTS);
    return raw ? (JSON.parse(raw) as SiteEvent[]) : [];
  } catch {
    return [];
  }
}
