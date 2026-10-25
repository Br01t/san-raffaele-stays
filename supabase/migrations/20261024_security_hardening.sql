-- ==============================================================================
-- SICUREZZA E PRESTAZIONI (pensato per restare nel piano FREE di Supabase)
--
-- PRIMA DI ESEGUIRE:
--  1. Supabase > Authentication > Users > "Add user": crea (o verifica di avere)
--     l'utente amministratore con email e password forti.
--  2. Scrivi qui sotto, nella riga  v_admin_email  la STESSA email.
--  3. Esegui l'intero script nel SQL Editor. Se l'email non esiste lo script si
--     ferma senza modificare nulla (così non rischi di chiuderti fuori).
--
-- Va eseguito DOPO 20261019_initial_schema.sql e 20261023_stay_rules.sql.
-- Lo script è rieseguibile senza danni.
-- ==============================================================================

BEGIN;  -- tutto o niente: se qualcosa fallisce non cambia nulla

-- ------------------------------------------------------------------------------
-- 1. ALLOW-LIST DEGLI AMMINISTRATORI
--    Prima: qualunque utente "authenticated" (basta registrarsi con la chiave
--    anon, che è pubblica) aveva accesso completo a tutto. Ora serve essere in
--    questa tabella.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;   -- nessuna policy = nessun accesso via API
REVOKE ALL ON public.admin_users FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()));
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DO $$
DECLARE
    v_admin_email TEXT := 'CAMBIA-CON-LA-TUA-EMAIL@esempio.it';   -- <<< MODIFICA QUI
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(v_admin_email);
    IF v_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id, email) VALUES (v_id, v_admin_email)
        ON CONFLICT (user_id) DO NOTHING;
    ELSIF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
        RAISE EXCEPTION 'Utente "%" non trovato in Authentication > Users. Crealo, correggi l''email nello script e riesegui.', v_admin_email;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. POLICY RLS: SOLO GLI ADMIN POSSONO SCRIVERE / LEGGERE I DATI INTERNI
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
    p TEXT;
BEGIN
    -- elimina le vecchie policy "TO authenticated USING (true)"
    FOR t, p IN
        SELECT * FROM (VALUES
            ('apartments', 'apartments_admin_all'),
            ('daily_rates', 'daily_rates_admin_all'),
            ('availability', 'availability_admin_all'),
            ('min_stay_rules', 'min_stay_rules_admin_all'),
            ('events', 'events_admin_all'),
            ('event_apartments', 'event_apartments_admin_all'),
            ('site_events', 'site_events_admin_all'),
            ('notes', 'notes_admin_only'),
            ('monthly_data', 'monthly_data_admin_only'),
            ('rate_history', 'rate_history_admin_only'),
            ('monthly_data_history', 'monthly_data_history_admin_only'),
            ('analytics_cache', 'analytics_cache_admin_only')
        ) AS x(tbl, pol)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_is_admin', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))',
            t || '_is_admin', t
        );
    END LOOP;
END $$;

-- Eventi e collegamenti evento/alloggio sono dati interni di pianificazione:
-- il sito pubblico non li usa, quindi niente lettura anonima.
DROP POLICY IF EXISTS "events_public_read" ON public.events;
DROP POLICY IF EXISTS "event_apartments_public_read" ON public.event_apartments;

-- ------------------------------------------------------------------------------
-- 4. STATISTICHE SITO: ANTI-FLOOD E COMPATTAZIONE (il piano free ha 500 MB di database)
--    La tabella site_events accetta inserimenti anonimi: va protetta, altrimenti
--    chiunque potrebbe riempirla e portare il progetto in sola lettura.
-- ------------------------------------------------------------------------------
-- 4a. Vincoli sul contenuto (NOT VALID = si applicano ai nuovi inserimenti)
ALTER TABLE public.site_events DROP CONSTRAINT IF EXISTS chk_site_events_shape;
ALTER TABLE public.site_events ADD CONSTRAINT chk_site_events_shape CHECK (
    event_type IN ('page_view', 'phone_click', 'whatsapp_click', 'email_click', 'form_start', 'form_submit', 'form_error')
    AND char_length(page_path) <= 200
    AND (session_id IS NULL OR char_length(session_id) <= 64)
    AND (metadata IS NULL OR pg_column_size(metadata) <= 1024)
) NOT VALID;

-- 4b. Tetti di frequenza + orario deciso dal server (il client non può falsificarlo).
--     Oltre il tetto l'evento viene scartato in silenzio (il visitatore non vede errori).
CREATE OR REPLACE FUNCTION public.site_events_guard()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.created_at := now();

    -- tetto globale: massimo 60 eventi al minuto (worst case ~26 MB/giorno)
    IF (SELECT count(*) FROM public.site_events WHERE created_at > now() - interval '1 minute') >= 60 THEN
        RETURN NULL;
    END IF;

    -- tetto per sessione: massimo 20 eventi al minuto
    IF NEW.session_id IS NOT NULL AND
       (SELECT count(*) FROM public.site_events
         WHERE session_id = NEW.session_id AND created_at > now() - interval '1 minute') >= 20 THEN
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.site_events_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_site_events_guard ON public.site_events;
CREATE TRIGGER trg_site_events_guard
    BEFORE INSERT ON public.site_events
    FOR EACH ROW EXECUTE FUNCTION public.site_events_guard();

-- 4c. COMPATTAZIONE (nessun dato storico viene perso):
--     i dettagli grezzi vecchi (visite pagina > 120 giorni, clic/form > 3 anni, oppure oltre
--     300.000 righe) vengono trasformati in CONTEGGI GIORNALIERI e poi tolti dalla tabella
--     principale. Le statistiche "Sempre" continuano a comprendere tutto lo storico.
--     Si perde solo il dettaglio del singolo evento (orario preciso e sessione) dei dati vecchi.
CREATE TABLE IF NOT EXISTS public.site_events_daily (
    day DATE NOT NULL,
    event_type TEXT NOT NULL,
    page_path TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    apartment TEXT NOT NULL DEFAULT '',
    cnt INTEGER NOT NULL CHECK (cnt >= 0),
    PRIMARY KEY (day, event_type, page_path, label, apartment)
);
ALTER TABLE public.site_events_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_events_daily_is_admin" ON public.site_events_daily;
CREATE POLICY "site_events_daily_is_admin" ON public.site_events_daily
    FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION public.compact_site_events()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Ogni riga viene cancellata e sommata ai conteggi nello STESSO comando:
    -- non può essere contata due volte né andare persa.
    WITH moved AS (
        DELETE FROM public.site_events
         WHERE (event_type = 'page_view' AND created_at < now() - interval '120 days')
            OR created_at < now() - interval '3 years'
            OR id IN (SELECT id FROM public.site_events ORDER BY created_at DESC OFFSET 300000)
        RETURNING created_at, event_type, page_path,
                  COALESCE(metadata->>'label', metadata->>'form', '') AS label,
                  COALESCE(metadata->>'apartment', '') AS apartment
    )
    INSERT INTO public.site_events_daily (day, event_type, page_path, label, apartment, cnt)
    SELECT (created_at AT TIME ZONE 'Europe/Rome')::date, event_type, page_path, label, apartment, count(*)
      FROM moved
     GROUP BY 1, 2, 3, 4, 5
    ON CONFLICT (day, event_type, page_path, label, apartment)
    DO UPDATE SET cnt = public.site_events_daily.cnt + EXCLUDED.cnt;
END;
$$;
REVOKE ALL ON FUNCTION public.compact_site_events() FROM PUBLIC, anon, authenticated;

-- Se avevi eseguito la prima versione di questo script (che CANCELLAVA i dati vecchi):
-- la funzione e la pianificazione vecchie vengono sostituite.
DROP FUNCTION IF EXISTS public.purge_old_site_events();

-- 4d. Pianificazione settimanale (pg_cron è incluso nel piano free)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    BEGIN
        PERFORM cron.unschedule('purge-site-events');   -- vecchia versione, se presente
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    PERFORM cron.schedule('compact-site-events', '30 3 * * 0', 'SELECT public.compact_site_events()');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron non disponibile (%). Abilitalo da Database > Extensions e riesegui, oppure lancia ogni tanto: SELECT public.compact_site_events();', SQLERRM;
END $$;

-- ------------------------------------------------------------------------------
-- 5. RIEPILOGO STATISTICHE LATO DATABASE (pochi KB invece di migliaia di righe)
--    Somma i dati recenti (dettaglio) e quelli compattati (conteggi giornalieri).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_site_event_summary(p_since TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (event_type TEXT, page_path TEXT, label TEXT, apartment TEXT, cnt BIGINT)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT x.event_type, x.page_path, x.label, x.apartment, sum(x.n)::bigint AS cnt
      FROM (
            SELECT e.event_type,
                   e.page_path,
                   COALESCE(e.metadata->>'label', e.metadata->>'form') AS label,
                   e.metadata->>'apartment' AS apartment,
                   count(*) AS n
              FROM public.site_events e
             WHERE (SELECT public.is_admin())
               AND (p_since IS NULL OR e.created_at >= p_since)
             GROUP BY 1, 2, 3, 4
            UNION ALL
            SELECT d.event_type, d.page_path, NULLIF(d.label, ''), NULLIF(d.apartment, ''), d.cnt::bigint
              FROM public.site_events_daily d
             WHERE (SELECT public.is_admin())
               AND (p_since IS NULL OR d.day >= (p_since AT TIME ZONE 'Europe/Rome')::date)
           ) x
     GROUP BY 1, 2, 3, 4;
$$;
REVOKE ALL ON FUNCTION public.admin_site_event_summary(TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_site_event_summary(TIMESTAMPTZ) TO authenticated;

-- ------------------------------------------------------------------------------
-- 5b. PRIVILEGI MINIMI PER IL RUOLO ANONIMO (difesa in profondità oltre alla RLS)
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.apartments, public.daily_rates, public.availability, public.min_stay_rules TO anon;
GRANT INSERT ON public.site_events TO anon;
-- TRUNCATE/REFERENCES/TRIGGER aggirano la RLS: nessuno dei due ruoli ne ha bisogno
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 6. INDICI MANCANTI
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_site_events_created_at ON public.site_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_events_session ON public.site_events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_history_apt_changed ON public.rate_history(apartment_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_date ON public.notes(note_date);

-- ------------------------------------------------------------------------------
-- 7. FUNZIONI ESISTENTI: search_path fisso (segnalato dal Security Advisor)
-- ------------------------------------------------------------------------------
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.track_rate_history() SET search_path = '';
ALTER FUNCTION public.track_monthly_data_history() SET search_path = '';

NOTIFY pgrst, 'reload schema';

COMMIT;
