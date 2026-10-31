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
