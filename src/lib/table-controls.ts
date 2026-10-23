import { useCallback, useMemo, useState } from 'react';

export type ColumnType = 'text' | 'select' | 'number';

export interface ColumnDef<T> {
  key: string;
  type: ColumnType;
  /** Valore mostrato / usato per filtrare (testo, opzioni, numero). */
  accessor: (row: T) => string | number;
  /** Valore usato per ordinare, se diverso da accessor (es. data, mese+anno). */
  sortValue?: (row: T) => string | number;
}

export interface ColumnFilter {
  text?: string;
  selected?: string[];
  min?: string;
  max?: string;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

const collator = new Intl.Collator('it', { numeric: true, sensitivity: 'base' });

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

export function isFilterActive(f?: ColumnFilter): boolean {
  if (!f) return false;
  return (
    !!f.text?.trim() ||
    (f.selected?.length ?? 0) > 0 ||
    (f.min ?? '') !== '' ||
    (f.max ?? '') !== ''
  );
}

export interface TableControls<T> {
  rows: T[];
  totalRows: number;
  sort: SortState | null;
  filters: Record<string, ColumnFilter>;
  activeFilterCount: number;
  columns: ColumnDef<T>[];
  setSort: (key: string, dir: 'asc' | 'desc' | null) => void;
  setFilter: (key: string, filter: ColumnFilter | null) => void;
  clearFilters: () => void;
  /** Valori distinti di una colonna (per i filtri a selezione), già ordinati. */
  getOptions: (key: string) => string[];
}

/** Ordinamento + filtri per colonna, lato client. */
export function useTableControls<T>(
  data: T[],
  columns: ColumnDef<T>[],
  initialSort: SortState | null = null
): TableControls<T> {
  const [sort, setSortState] = useState<SortState | null>(initialSort);
  const [filters, setFilters] = useState<Record<string, ColumnFilter>>({});

  const colMap = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);

  const rows = useMemo(() => {
    let out = data.filter((row) =>
      Object.entries(filters).every(([key, f]) => {
        if (!isFilterActive(f)) return true;
        const col = colMap.get(key);
        if (!col) return true;
        const v = col.accessor(row);
        if (col.type === 'text') {
          return String(v).toLowerCase().includes((f.text ?? '').trim().toLowerCase());
        }
        if (col.type === 'select') {
          return (f.selected ?? []).includes(String(v));
        }
        const n = Number(v);
        if ((f.min ?? '') !== '' && n < Number(f.min)) return false;
        if ((f.max ?? '') !== '' && n > Number(f.max)) return false;
        return true;
      })
    );
    if (sort) {
      const col = colMap.get(sort.key);
      if (col) {
        const get = col.sortValue ?? col.accessor;
        const factor = sort.dir === 'asc' ? 1 : -1;
        out = [...out].sort((a, b) => factor * compare(get(a), get(b)));
      }
    }
    return out;
  }, [data, filters, sort, colMap]);

  const setSort = useCallback((key: string, dir: 'asc' | 'desc' | null) => {
    setSortState(dir ? { key, dir } : null);
  }, []);

  const setFilter = useCallback((key: string, filter: ColumnFilter | null) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (filter && isFilterActive(filter)) next[key] = filter;
      else delete next[key];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const getOptions = useCallback(
    (key: string) => {
      const col = colMap.get(key);
      if (!col) return [];
      const seen = new Map<string, string | number>();
      for (const row of data) {
        const label = String(col.accessor(row));
        if (!seen.has(label)) seen.set(label, (col.sortValue ?? col.accessor)(row));
      }
      return [...seen.entries()].sort((a, b) => compare(a[1], b[1])).map(([label]) => label);
    },
    [data, colMap]
  );

  return {
    rows,
    totalRows: data.length,
    sort,
    filters,
    activeFilterCount: Object.values(filters).filter(isFilterActive).length,
    columns,
    setSort,
    setFilter,
    clearFilters,
    getOptions,
  };
}
