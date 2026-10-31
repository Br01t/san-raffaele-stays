-- ==============================================================================
-- GESTIONE FINANZIARIA (Contabilità Appartamenti, Finanze Personali, Bilancio)
--
-- Da eseguire nel SQL Editor di Supabase DOPO le migrazioni precedenti
-- (serve la funzione public.is_admin() creata da 20261024_security_hardening.sql).
-- Lo script crea solo tabelle NUOVE: non modifica i dati esistenti del sito.
-- È rieseguibile senza danni.
--
-- Tutti i dati sono visibili SOLO agli amministratori (RLS + is_admin()).
-- Il ruolo anonimo (sito pubblico) non ha alcun privilegio su queste tabelle.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. CATEGORIE (modificabili e ampliabili dall'admin)
--    scope:     apartment | personal
--    kind:      income | expense
--    cat_group: fixed | variable | revolut | NULL (entrate)
--    system_key: identifica le categorie con logica speciale (mutuo, revolut...)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL CHECK (scope IN ('apartment', 'personal')),
    kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
    cat_group TEXT CHECK (cat_group IS NULL OR cat_group IN ('fixed', 'variable', 'revolut')),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
    system_key TEXT UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. REGOLE RICORRENTI (spese/entrate mensili o annuali)
--    Le occorrenze passate diventano movimenti "effettivi" (source = recurring),
--    quelle future sono calcolate come PREVISIONE (non salvate).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.finance_recurring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL CHECK (scope IN ('apartment', 'personal')),
    direction TEXT NOT NULL CHECK (direction IN ('income', 'expense')),
    category_id UUID NOT NULL REFERENCES public.finance_categories(id) ON DELETE RESTRICT,
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE, -- NULL = spesa condivisa
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    interest_amount NUMERIC(12, 2) CHECK (interest_amount IS NULL OR interest_amount >= 0),
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
    day_of_month SMALLINT NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 31),
    month_of_year SMALLINT CHECK (month_of_year IS NULL OR month_of_year BETWEEN 1 AND 12),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 3. MOVIMENTI (entrate, uscite, trasferimenti)
--    direction = transfer: giroconto (es. conto principale -> Revolut).
--                NON entra mai nei totali, così non c'è doppio conteggio.
--    status:     actual (effettivo) | planned (previsto) | skipped (occorrenza
--                ricorrente annullata: resta per non essere rigenerata)
--    invoiced_amount: parte dell'incasso già fatturata (solo entrate appartamenti)
--    interest_amount: quota interessi di una rata di mutuo (il resto è capitale)
--    source/source_ref: origine automatica (recurring / monthly_data), univoca
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.finance_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope TEXT NOT NULL CHECK (scope IN ('apartment', 'personal')),
    direction TEXT NOT NULL CHECK (direction IN ('income', 'expense', 'transfer')),
    category_id UUID REFERENCES public.finance_categories(id) ON DELETE RESTRICT,
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
    movement_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    invoiced_amount NUMERIC(12, 2) CHECK (invoiced_amount IS NULL OR (invoiced_amount >= 0 AND invoiced_amount <= amount)),
    interest_amount NUMERIC(12, 2) CHECK (interest_amount IS NULL OR (interest_amount >= 0 AND interest_amount <= amount)),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'actual' CHECK (status IN ('actual', 'planned', 'skipped')),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'recurring', 'monthly_data')),
    source_ref TEXT UNIQUE,
    recurring_id UUID REFERENCES public.finance_recurring(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_movements_date ON public.finance_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_finance_movements_scope_date ON public.finance_movements(scope, movement_date);
CREATE INDEX IF NOT EXISTS idx_finance_movements_apartment ON public.finance_movements(apartment_id);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_scope ON public.finance_recurring(scope);

-- ------------------------------------------------------------------------------
-- 4. BUDGET MENSILI (es. budget Revolut). month = NULL -> valore predefinito
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_key TEXT NOT NULL,
    month TEXT NOT NULL DEFAULT 'default' CHECK (month = 'default' OR month ~ '^\d{4}-\d{2}$'),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (budget_key, month)
);

-- ------------------------------------------------------------------------------
-- 5. IMPOSTAZIONI (es. saldo disponibile di partenza per la previsione)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.finance_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. SICUREZZA: solo amministratori
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['finance_categories', 'finance_recurring', 'finance_movements', 'finance_budgets', 'finance_settings']
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
        EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_is_admin', t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))',
            t || '_is_admin', t
        );
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_' || t || '_updated_at', t);
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
            'trg_' || t || '_updated_at', t
        );
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 7. CATEGORIE PREDEFINITE
-- ------------------------------------------------------------------------------
INSERT INTO public.finance_categories (scope, kind, cat_group, name, system_key, sort_order) VALUES
    ('apartment', 'income',  NULL,       'Affitti brevi',           'apt_income_rent',      10),
    ('apartment', 'income',  NULL,       'Altri incassi',           'apt_income_other',     20),
    ('apartment', 'expense', 'fixed',    'Mutuo',                   'apt_mortgage',         10),
    ('apartment', 'expense', 'fixed',    'Spese condominiali',      'apt_condo',            20),
    ('apartment', 'expense', 'fixed',    'Utenze',                  'apt_utilities',        30),
    ('apartment', 'expense', 'variable', 'Tasse',                   'apt_taxes',            40),
    ('apartment', 'expense', 'variable', 'Pulizie',                 'apt_cleaning',         50),
    ('apartment', 'expense', 'variable', 'Manutenzione',            'apt_maintenance',      60),
    ('apartment', 'expense', 'variable', 'Varie',                   'apt_misc',             70),
    ('personal',  'income',  NULL,       'Lavoro dipendente',       'per_income_salary',    10),
    ('personal',  'income',  NULL,       'Navette',                 'per_income_shuttle',   20),
    ('personal',  'income',  NULL,       'Extra',                   'per_income_extra',     30),
    ('personal',  'expense', 'fixed',    'Affitto',                 'per_rent',             10),
    ('personal',  'expense', 'fixed',    'Utenze e bollette',       'per_utilities',        20),
    ('personal',  'expense', 'fixed',    'Asilo nido',              'per_nursery',          30),
    ('personal',  'expense', 'variable', 'Carta di credito',        'per_credit_card',      45),
    ('personal',  'expense', 'variable', 'Assicurazioni',           'per_insurance',        50),
    ('personal',  'expense', 'variable', 'Viaggi',                  'per_travel',           60),
    ('personal',  'expense', 'variable', 'Amazon e acquisti',       'per_shopping',         70),
    ('personal',  'expense', 'variable', 'Altre spese',             'per_other',            80),
    ('personal',  'expense', 'revolut',  'Spesa alimentare',        'rev_groceries',        10),
    ('personal',  'expense', 'revolut',  'Benzina',                 'rev_fuel',             20),
    ('personal',  'expense', 'revolut',  'Svago',                   'rev_leisure',          30),
    ('personal',  'expense', 'revolut',  'Acquisti personali',      'rev_personal',         40),
    ('personal',  'expense', 'revolut',  'Spese ordinarie',         'rev_ordinary',         50)
ON CONFLICT (system_key) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;
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
-- ==============================================================================
-- SCAGLIONI TARIFFARI (fasce di prezzo per 2, 3 e 4 persone)
--
-- Ogni appartamento ha i suoi scaglioni (es. "Bassa", "Media", "Alta", "Fiera").
-- Nel calendario si assegna lo scaglione al giorno invece di scrivere il prezzo:
-- price_per_night resta il prezzo per 2 persone e, se si modifica lo scaglione,
-- tutti i giorni che lo usano si aggiornano automaticamente (trigger qui sotto).
--
-- Da eseguire nel SQL Editor di Supabase DOPO le migrazioni precedenti. Rieseguibile.
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
    price_2p NUMERIC(10, 2) NOT NULL CHECK (price_2p >= 0),
    price_3p NUMERIC(10, 2) NOT NULL CHECK (price_3p >= 0),
    price_4p NUMERIC(10, 2) NOT NULL CHECK (price_4p >= 0),
    color TEXT NOT NULL DEFAULT '#039be5',
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (apartment_id, name)
);
CREATE INDEX IF NOT EXISTS idx_rate_tiers_apartment ON public.rate_tiers(apartment_id);

-- Giorno del calendario collegato a uno scaglione (NULL = prezzo manuale)
ALTER TABLE public.daily_rates
    ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES public.rate_tiers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_daily_rates_tier ON public.daily_rates(tier_id);

-- Modificando i prezzi di uno scaglione si aggiornano tutti i giorni che lo usano
-- (il trigger esistente registra la variazione nello storico tariffe).
CREATE OR REPLACE FUNCTION public.propagate_rate_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.price_2p IS DISTINCT FROM OLD.price_2p THEN
        UPDATE public.daily_rates
           SET price_per_night = NEW.price_2p, updated_at = now()
         WHERE tier_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_propagate_rate_tier ON public.rate_tiers;
CREATE TRIGGER trg_propagate_rate_tier
    AFTER UPDATE ON public.rate_tiers
    FOR EACH ROW EXECUTE FUNCTION public.propagate_rate_tier();

DROP TRIGGER IF EXISTS trg_rate_tiers_updated_at ON public.rate_tiers;
CREATE TRIGGER trg_rate_tiers_updated_at
    BEFORE UPDATE ON public.rate_tiers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sicurezza: come daily_rates (lettura pubblica, scrittura solo admin)
ALTER TABLE public.rate_tiers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_tiers FROM anon;
GRANT SELECT ON public.rate_tiers TO anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.rate_tiers FROM anon, authenticated;
DROP POLICY IF EXISTS "rate_tiers_public_read" ON public.rate_tiers;
CREATE POLICY "rate_tiers_public_read" ON public.rate_tiers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "rate_tiers_is_admin" ON public.rate_tiers;
CREATE POLICY "rate_tiers_is_admin" ON public.rate_tiers
    FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- Estensione regole di soggiorno per Fasce di Sconto e Costi Extra (idempotente)
ALTER TABLE public.min_stay_rules
    ADD COLUMN IF NOT EXISTS rule_type TEXT NOT NULL DEFAULT 'min_stay',
    ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS amount_type TEXT,
    ADD COLUMN IF NOT EXISTS charge_basis TEXT,
    ADD COLUMN IF NOT EXISTS threshold_nights INTEGER,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.min_stay_rules ALTER COLUMN min_nights DROP NOT NULL;

-- Inserisce la fascia di sconto predefinita (10+ notti = -5%) se non ci sono ancora sconti configurati
INSERT INTO public.min_stay_rules (rule_type, apartment_id, min_nights, amount, amount_type, threshold_nights, is_active, priority, description)
SELECT 'discount', NULL, NULL, 5, 'percent', 10, true, 5, 'Sconto soggiorno 10+ notti'
WHERE NOT EXISTS (
    SELECT 1 FROM public.min_stay_rules WHERE rule_type = 'discount'
);

NOTIFY pgrst, 'reload schema';

COMMIT;
