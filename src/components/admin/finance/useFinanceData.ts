import { useCallback, useEffect, useMemo, useState } from 'react';
import { FinanceData, loadFinanceData } from '@/lib/finance-api';
import { FinanceCategory } from '@/types/finance';

/** Carica i dati finanziari (con automazioni) e offre reload() dopo ogni modifica. */
export function useFinanceData() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const d = await loadFinanceData();
      setData(d);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati finanziari.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const categoryMap = useMemo(
    () => new Map<string, FinanceCategory>((data?.categories ?? []).map((c) => [c.id, c])),
    [data]
  );
  const apartmentNames = useMemo(
    () => new Map<string, string>((data?.apartments ?? []).map((a) => [a.id, a.name])),
    [data]
  );

  return { data, error, loading, reload, categoryMap, apartmentNames };
}
