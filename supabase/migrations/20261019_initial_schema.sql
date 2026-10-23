-- ==============================================================================
-- Schema iniziale per San Raffaele Stays
-- Data: 19 Ottobre 2026
-- Database: Supabase PostgreSQL (compatibile Free Tier)
-- ==============================================================================

-- Abilita estensione pgcrypto / uuid-ossp per generare UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Tabella: APARTMENTS (i 3 alloggi di San Raffaele Stays)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    location_description TEXT,
    services JSONB DEFAULT '[]'::jsonb,
    beds_description TEXT,
    base_price_2p NUMERIC(10, 2) NOT NULL DEFAULT 90.00,
    base_price_3p NUMERIC(10, 2) NOT NULL DEFAULT 95.00,
    base_price_4p NUMERIC(10, 2) NOT NULL DEFAULT 110.00,
    extra_guest_supplement NUMERIC(10, 2) DEFAULT 15.00,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00,
    cleaning_fee_threshold_nights INTEGER DEFAULT 0,
    max_guests INTEGER NOT NULL DEFAULT 4,
    base_guests_included INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Tabella: DAILY_RATES (tariffe giornaliere per appartamento)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    rate_date DATE NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    is_manual_override BOOLEAN NOT NULL DEFAULT true,
    source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'rule', 'bulk'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_apt_rate_date UNIQUE (apartment_id, rate_date)
);

-- ------------------------------------------------------------------------------
-- 3. Tabella: AVAILABILITY (disponibilità giornaliera e alta richiesta)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    avail_date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_high_demand BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_apt_avail_date UNIQUE (apartment_id, avail_date)
);

-- ------------------------------------------------------------------------------
-- 4. Tabella: MIN_STAY_RULES (regole soggiorno minimo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.min_stay_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE, -- NULL = applica a tutti
    min_nights INTEGER NOT NULL DEFAULT 2,
    start_date DATE, -- NULL = regola standard/predefinita
    end_date DATE,   -- NULL = regola standard/predefinita
    priority INTEGER NOT NULL DEFAULT 1, -- numeri più alti vincono
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. Tabella: MONTHLY_DATA (occupazione e prezzo medio registrati mensilmente)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    occupancy_percentage NUMERIC(5, 2) NOT NULL CHECK (occupancy_percentage >= 0 AND occupancy_percentage <= 100),
    average_price NUMERIC(10, 2) NOT NULL CHECK (average_price >= 0),
    price_definition TEXT NOT NULL DEFAULT 'per_night', -- 'per_night' | 'per_stay'
    notes TEXT,
    is_manual BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_apt_year_month UNIQUE (apartment_id, year, month)
);

-- ------------------------------------------------------------------------------
-- 6. Tabella: EVENTS (festività, congressi ed eventi locali)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    is_high_demand BOOLEAN NOT NULL DEFAULT true,
    extra_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabella di collegamento Eventi - Appartamenti
CREATE TABLE IF NOT EXISTS public.event_apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    CONSTRAINT unique_event_apartment UNIQUE (event_id, apartment_id)
);

-- ------------------------------------------------------------------------------
-- 7. Tabella: NOTES (note interne e promemoria riservati)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    note_date DATE,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general', -- 'tariff', 'reminder', 'maintenance', 'general'
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. Tabella: RATE_HISTORY (storico modifiche tariffe)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    daily_rate_id UUID REFERENCES public.daily_rates(id) ON DELETE SET NULL,
    rate_date DATE NOT NULL,
    old_price NUMERIC(10, 2),
    new_price NUMERIC(10, 2) NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. Tabella: MONTHLY_DATA_HISTORY (storico modifiche dati mensili)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_data_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monthly_data_id UUID REFERENCES public.monthly_data(id) ON DELETE CASCADE,
    old_occupancy NUMERIC(5, 2),
    new_occupancy NUMERIC(5, 2),
    old_avg_price NUMERIC(10, 2),
    new_avg_price NUMERIC(10, 2),
    change_reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. Tabella: SITE_EVENTS (tracciamento visite, clic e form)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- 'phone_click', 'whatsapp_click', 'form_start', 'form_submit', 'page_view'
    page_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. Tabella: ANALYTICS_CACHE (cache giornaliera Google Search Console e GBP)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL, -- 'gsc', 'gbp'
    data_date DATE NOT NULL,
    data JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_analytics_source_date UNIQUE (source, data_date)
);

-- ------------------------------------------------------------------------------
-- 12. INDICI PER PERFORMANCE OTTIMALE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_rates_apt_date ON public.daily_rates(apartment_id, rate_date);
CREATE INDEX IF NOT EXISTS idx_availability_apt_date ON public.availability(apartment_id, avail_date);
CREATE INDEX IF NOT EXISTS idx_min_stay_apt_dates ON public.min_stay_rules(apartment_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_monthly_data_apt_period ON public.monthly_data(apartment_id, year, month);
CREATE INDEX IF NOT EXISTS idx_rate_history_apt_date ON public.rate_history(apartment_id, rate_date);
CREATE INDEX IF NOT EXISTS idx_site_events_type_date ON public.site_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_source_date ON public.analytics_cache(source, data_date);
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);

-- ------------------------------------------------------------------------------
-- 13. FUNZIONI E TRIGGER
-- ------------------------------------------------------------------------------

-- Funzione generica per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at su tabelle rilevanti
CREATE OR REPLACE TRIGGER trg_apartments_updated_at BEFORE UPDATE ON public.apartments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_daily_rates_updated_at BEFORE UPDATE ON public.daily_rates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_min_stay_rules_updated_at BEFORE UPDATE ON public.min_stay_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_monthly_data_updated_at BEFORE UPDATE ON public.monthly_data FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER trg_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger automatico per storicizzazione variazioni tariffe
CREATE OR REPLACE FUNCTION public.track_rate_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.price_per_night <> NEW.price_per_night) THEN
        INSERT INTO public.rate_history (apartment_id, daily_rate_id, rate_date, old_price, new_price, change_reason)
        VALUES (NEW.apartment_id, NEW.id, NEW.rate_date, OLD.price_per_night, NEW.price_per_night, 'Aggiornamento tariffa');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_track_rate_history
AFTER UPDATE ON public.daily_rates
FOR EACH ROW EXECUTE FUNCTION public.track_rate_history();

-- Trigger automatico per storicizzazione modifiche dati mensili
CREATE OR REPLACE FUNCTION public.track_monthly_data_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND (OLD.occupancy_percentage <> NEW.occupancy_percentage OR OLD.average_price <> NEW.average_price)) THEN
        INSERT INTO public.monthly_data_history (monthly_data_id, old_occupancy, new_occupancy, old_avg_price, new_avg_price, change_reason)
        VALUES (NEW.id, OLD.occupancy_percentage, NEW.occupancy_percentage, OLD.average_price, NEW.average_price, 'Rettifica dato mensile');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_track_monthly_data_history
AFTER UPDATE ON public.monthly_data
FOR EACH ROW EXECUTE FUNCTION public.track_monthly_data_history();

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.min_stay_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_data_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy per Apartments: lettura pubblica, scrittura solo autenticato
CREATE POLICY "apartments_public_read" ON public.apartments FOR SELECT USING (true);
CREATE POLICY "apartments_admin_all" ON public.apartments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy per Daily Rates: lettura pubblica, scrittura solo autenticato
CREATE POLICY "daily_rates_public_read" ON public.daily_rates FOR SELECT USING (true);
CREATE POLICY "daily_rates_admin_all" ON public.daily_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy per Availability: lettura pubblica, scrittura solo autenticato
CREATE POLICY "availability_public_read" ON public.availability FOR SELECT USING (true);
CREATE POLICY "availability_admin_all" ON public.availability FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy per Min Stay Rules: lettura pubblica, scrittura solo autenticato
CREATE POLICY "min_stay_rules_public_read" ON public.min_stay_rules FOR SELECT USING (true);
CREATE POLICY "min_stay_rules_admin_all" ON public.min_stay_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy per Events: lettura pubblica, scrittura solo autenticato
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_admin_all" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "event_apartments_public_read" ON public.event_apartments FOR SELECT USING (true);
CREATE POLICY "event_apartments_admin_all" ON public.event_apartments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy per Site Events: inserimento pubblico per tracciamento anonimo, lettura solo admin
CREATE POLICY "site_events_public_insert" ON public.site_events FOR INSERT WITH CHECK (true);
CREATE POLICY "site_events_admin_all" ON public.site_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy RISERVATE (solo utenti autenticati)
CREATE POLICY "notes_admin_only" ON public.notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "monthly_data_admin_only" ON public.monthly_data FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rate_history_admin_only" ON public.rate_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "monthly_data_history_admin_only" ON public.monthly_data_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "analytics_cache_admin_only" ON public.analytics_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 15. SEED INIZIALE DEI 3 APPARTAMENTI
-- ------------------------------------------------------------------------------
INSERT INTO public.apartments (slug, name, description, location_description, services, beds_description, base_price_2p, base_price_3p, base_price_4p, max_guests, is_active)
VALUES
(
    'amici-1',
    'AMICI 1',
    'Alloggio confortevole a 150 metri dall ingresso di Via Olgettina dell Ospedale San Raffaele. Ideale per soggiorni di cura e assistenza con terrazzo vista OSR.',
    'L alloggio AMICI 1 si posiziona tra le prime soluzioni per chi cerca un alloggio vicino San Raffaele Milano. Dal terrazzo è possibile vedere l OSR (Ospedale San Raffaele). L entrata di Via Olgettina dista circa 150 metri.',
    '["TV", "ARIA CONDIZIONATA", "WI-FI", "PHON IN CAMERA", "CUCINA ATTREZZATA", "BAGNO PRIVATO", "DOCCA", "LAVATRICE", "TERRAZZO"]'::jsonb,
    '1 LETTO MATRIMONIALE, 1 LETTO SINGOLO, 1 DIVANO LETTO. Per un totale di 4 posti letto. O anche 4 posti letto + 1 bambino/a.',
    90.00,
    95.00,
    110.00,
    4,
    true
),
(
    'amici-2',
    'AMICI 2',
    'Spazioso e accogliente a soli 100 metri dall entrata di Via Olgettina dell OSR. Dispone di terrazzo privato con vista sull ospedale.',
    'L alloggio AMICI 2 si posiziona tra le prime residenze nelle vicinanze del San Raffaele. Dal terrazzo è possibile vedere l OSR. L entrata di Via Olgettina dista circa 100 metri.',
    '["TV", "ARIA CONDIZIONATA", "WI-FI", "PHON IN CAMERA", "CUCINA ATTREZZATA", "BAGNO PRIVATO", "DOCCA", "LAVATRICE", "TERRAZZO"]'::jsonb,
    '2 LETTI MATRIMONIALE, 1 LETTO SINGOLO, 1 DIVANO LETTO. Per un totale di 4 posti letto. O anche 4 posti letto + 1 bambino/a.',
    90.00,
    95.00,
    110.00,
    4,
    true
),
(
    'amici-3',
    'AMICI 3',
    'Residenza tranquilla e servita, a circa 150 metri dall entrata di Via Olgettina tra il Supermercato Viaggiator Goloso e l ospedale.',
    'L alloggio AMICI 3 si posiziona tra le prime residenze nelle vicinanze del San Raffaele tra il Supermercato Viaggiator Goloso e l entrata di Via Olgettina che dista circa 150 metri.',
    '["TV", "ARIA CONDIZIONATA", "WI-FI", "PHON IN CAMERA", "CUCINA ATTREZZATA", "BAGNO PRIVATO", "DOCCA", "LAVATRICE"]'::jsonb,
    '1 LETTO MATRIMONIALE, 1 LETTO SINGOLO. Per un totale di 3 posti letto.',
    90.00,
    95.00,
    110.00,
    3,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    location_description = EXCLUDED.location_description,
    services = EXCLUDED.services,
    beds_description = EXCLUDED.beds_description,
    base_price_2p = EXCLUDED.base_price_2p,
    base_price_3p = EXCLUDED.base_price_3p,
    base_price_4p = EXCLUDED.base_price_4p,
    max_guests = EXCLUDED.max_guests;

-- Regola default soggiorno minimo: 2 notti
INSERT INTO public.min_stay_rules (apartment_id, min_nights, start_date, end_date, priority, description)
VALUES (NULL, 2, NULL, NULL, 1, 'Regola generale predefinita (minimo 2 notti)')
ON CONFLICT DO NOTHING;
