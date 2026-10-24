-- ==============================================================================
-- Regole di soggiorno: minimo notti + costi (es. pulizie) + sconti fissi/percentuali
-- Estende la tabella esistente min_stay_rules (le righe già presenti restano
-- valide e diventano automaticamente regole di tipo 'min_stay').
-- Eseguire una sola volta dal SQL Editor di Supabase.
-- ==============================================================================

ALTER TABLE public.min_stay_rules
    ADD COLUMN IF NOT EXISTS rule_type TEXT NOT NULL DEFAULT 'min_stay',   -- 'min_stay' | 'fee' | 'discount'
    ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2),                        -- importo costo / valore sconto
    ADD COLUMN IF NOT EXISTS amount_type TEXT,                             -- sconti: 'fixed' (€) | 'percent' (%)
    ADD COLUMN IF NOT EXISTS charge_basis TEXT,                            -- costi: 'per_stay' | 'per_night' | 'per_guest'
    ADD COLUMN IF NOT EXISTS threshold_nights INTEGER,                     -- costi: gratis da N notti | sconti: valido da N notti
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Per costi e sconti il minimo notti non ha significato
ALTER TABLE public.min_stay_rules ALTER COLUMN min_nights DROP NOT NULL;

ALTER TABLE public.min_stay_rules DROP CONSTRAINT IF EXISTS chk_stay_rule_type;
ALTER TABLE public.min_stay_rules ADD CONSTRAINT chk_stay_rule_type CHECK (rule_type IN ('min_stay', 'fee', 'discount'));
ALTER TABLE public.min_stay_rules DROP CONSTRAINT IF EXISTS chk_stay_rule_amount_type;
ALTER TABLE public.min_stay_rules ADD CONSTRAINT chk_stay_rule_amount_type CHECK (amount_type IS NULL OR amount_type IN ('fixed', 'percent'));
ALTER TABLE public.min_stay_rules DROP CONSTRAINT IF EXISTS chk_stay_rule_charge_basis;
ALTER TABLE public.min_stay_rules ADD CONSTRAINT chk_stay_rule_charge_basis CHECK (charge_basis IS NULL OR charge_basis IN ('per_stay', 'per_night', 'per_guest'));
ALTER TABLE public.min_stay_rules DROP CONSTRAINT IF EXISTS chk_stay_rule_amount_positive;
ALTER TABLE public.min_stay_rules ADD CONSTRAINT chk_stay_rule_amount_positive CHECK (amount IS NULL OR amount >= 0);

CREATE INDEX IF NOT EXISTS idx_min_stay_rule_type ON public.min_stay_rules(rule_type, is_active);

-- Obbliga PostgREST (API di Supabase) a ricaricare lo schema con le nuove colonne
NOTIFY pgrst, 'reload schema';
