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

NOTIFY pgrst, 'reload schema';

COMMIT;
