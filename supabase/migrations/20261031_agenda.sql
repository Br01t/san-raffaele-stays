-- ==============================================================================
-- AGENDA (calendario personale dell'amministratore, stile Google Calendar)
--
-- Da eseguire nel SQL Editor di Supabase DOPO 20261024_security_hardening.sql
-- (serve public.is_admin()). Crea solo una tabella nuova. Rieseguibile.
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    description TEXT,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,            -- NULL se "tutto il giorno"
    end_time TIME,
    all_day BOOLEAN NOT NULL DEFAULT false,
    color TEXT NOT NULL DEFAULT 'peacock',
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
    recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
    recurrence_until DATE,
    exdates DATE[] NOT NULL DEFAULT '{}',   -- occorrenze eliminate singolarmente
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_agenda_events_dates ON public.agenda_events(start_date, end_date);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.agenda_events FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.agenda_events FROM authenticated;
DROP POLICY IF EXISTS "agenda_events_is_admin" ON public.agenda_events;
CREATE POLICY "agenda_events_is_admin" ON public.agenda_events
    FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP TRIGGER IF EXISTS trg_agenda_events_updated_at ON public.agenda_events;
CREATE TRIGGER trg_agenda_events_updated_at
    BEFORE UPDATE ON public.agenda_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

NOTIFY pgrst, 'reload schema';

COMMIT;
