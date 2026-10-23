import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isFilterActive, TableControls } from '@/lib/table-controls';

interface ColumnHeaderProps<T> {
  label: string;
  columnKey: string;
  controls: TableControls<T>;
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Intestazione <th> cliccabile: apre un menu per ordinare (crescente/decrescente)
 * e filtrare la colonna (testo, valori o intervallo numerico).
 */
export function ColumnHeader<T>({
  label,
  columnKey,
  controls,
  align = 'left',
  className = 'py-3 px-4',
}: ColumnHeaderProps<T>) {
  const [open, setOpen] = useState(false);
  const col = controls.columns.find((c) => c.key === columnKey);
  const filter = controls.filters[columnKey];
  const filtered = isFilterActive(filter);
  const sorted = controls.sort?.key === columnKey ? controls.sort.dir : null;

  const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th
      className={className}
      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`group inline-flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:text-slate-900 transition-colors ${
              align === 'right' ? 'flex-row-reverse' : ''
            } ${sorted || filtered ? 'text-primary' : ''}`}
            title="Clicca per ordinare o filtrare"
          >
            {label}
            <SortIcon className={`h-3 w-3 ${sorted ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`} />
            {filtered && <Filter className="h-3 w-3 fill-current" />}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align === 'right' ? 'end' : 'start'}
          className="w-60 p-3 space-y-3 normal-case tracking-normal font-normal text-slate-700"
        >
          {/* Ordinamento */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Ordina</p>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={sorted === 'asc' ? 'default' : 'outline'}
                className="h-8 text-xs gap-1"
                onClick={() => controls.setSort(columnKey, sorted === 'asc' ? null : 'asc')}
              >
                <ArrowUp className="h-3 w-3" /> Crescente
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sorted === 'desc' ? 'default' : 'outline'}
                className="h-8 text-xs gap-1"
                onClick={() => controls.setSort(columnKey, sorted === 'desc' ? null : 'desc')}
              >
                <ArrowDown className="h-3 w-3" /> Decrescente
              </Button>
            </div>
          </div>

          {/* Filtro */}
          {col && (
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Filtra</p>
                {filtered && (
                  <button
                    type="button"
                    className="text-[11px] text-primary font-semibold hover:underline"
                    onClick={() => controls.setFilter(columnKey, null)}
                  >
                    Azzera
                  </button>
                )}
              </div>

              {col.type === 'text' && (
                <Input
                  autoFocus
                  value={filter?.text ?? ''}
                  onChange={(e) => controls.setFilter(columnKey, { text: e.target.value })}
                  placeholder="Contiene…"
                  className="h-8 text-xs"
                />
              )}

              {col.type === 'number' && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={filter?.min ?? ''}
                    onChange={(e) => controls.setFilter(columnKey, { ...filter, min: e.target.value })}
                    placeholder="Min"
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    value={filter?.max ?? ''}
                    onChange={(e) => controls.setFilter(columnKey, { ...filter, max: e.target.value })}
                    placeholder="Max"
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {col.type === 'select' && (
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {controls.getOptions(columnKey).map((opt) => {
                    const checked = filter?.selected?.includes(opt) ?? false;
                    return (
                      <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const cur = filter?.selected ?? [];
                            const next = v ? [...cur, opt] : cur.filter((x) => x !== opt);
                            controls.setFilter(columnKey, { selected: next });
                          }}
                        />
                        <span className="truncate">{opt || '—'}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </th>
  );
}

/** Barra sopra la tabella: quante righe, filtri attivi e pulsante per azzerarli. */
export function TableToolbar<T>({ controls }: { controls: TableControls<T> }) {
  if (controls.activeFilterCount === 0 && !controls.sort) {
    return (
      <p className="px-4 pb-3 text-[11px] text-slate-400">
        Clicca sull'intestazione di una colonna per ordinare o filtrare.
      </p>
    );
  }
  return (
    <div className="px-4 pb-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
      <span>
        <strong className="text-slate-800">{controls.rows.length}</strong> di {controls.totalRows} righe
      </span>
      {controls.activeFilterCount > 0 && (
        <button
          type="button"
          onClick={controls.clearFilters}
          className="text-primary font-semibold hover:underline"
        >
          Azzera {controls.activeFilterCount} {controls.activeFilterCount === 1 ? 'filtro' : 'filtri'}
        </button>
      )}
      {controls.sort && (
        <button
          type="button"
          onClick={() => controls.setSort(controls.sort!.key, null)}
          className="text-slate-500 hover:underline"
        >
          Rimuovi ordinamento
        </button>
      )}
    </div>
  );
}

export default ColumnHeader;
