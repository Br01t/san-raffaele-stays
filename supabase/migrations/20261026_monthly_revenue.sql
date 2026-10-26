-- ==============================================================================
-- Fatturato mensile per appartamento
-- NULL = fatturato non ancora inserito per quel mese
-- ==============================================================================
BEGIN;

ALTER TABLE public.monthly_data
    ADD COLUMN IF NOT EXISTS revenue NUMERIC(12, 2) CHECK (revenue IS NULL OR revenue >= 0);

ALTER TABLE public.monthly_data_history
    ADD COLUMN IF NOT EXISTS old_revenue NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS new_revenue NUMERIC(12, 2);

-- Il trigger di audit ora considera anche le variazioni di fatturato
CREATE OR REPLACE FUNCTION public.track_monthly_data_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND (
        OLD.occupancy_percentage <> NEW.occupancy_percentage
        OR OLD.average_price <> NEW.average_price
        OR OLD.revenue IS DISTINCT FROM NEW.revenue
    )) THEN
        INSERT INTO public.monthly_data_history (
            monthly_data_id, old_occupancy, new_occupancy, old_avg_price, new_avg_price,
            old_revenue, new_revenue, change_reason
        )
        VALUES (
            NEW.id, OLD.occupancy_percentage, NEW.occupancy_percentage, OLD.average_price, NEW.average_price,
            OLD.revenue, NEW.revenue, 'Rettifica dato mensile'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mantiene il search_path fisso impostato dalla migrazione di hardening
ALTER FUNCTION public.track_monthly_data_history() SET search_path = '';

NOTIFY pgrst, 'reload schema';

COMMIT;
