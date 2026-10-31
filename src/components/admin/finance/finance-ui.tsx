import React, { useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MONTHS_LONG, Period, addMonths, monthEnd, monthKey, monthStart, todayIso } from '@/lib/finance-calc';

export const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const eur2 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '12px',
};

export const APARTMENT_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

// ------------------------------------------------------------------------------
// FILTRO TEMPORALE (mese / anno / intervallo personalizzato)
// ------------------------------------------------------------------------------
export type PeriodMode = 'month' | 'year' | 'custom';

export interface PeriodState {
  mode: PeriodMode;
  month: string; // YYYY-MM
  year: number;
  from: string;
  to: string;
}

export function usePeriod(initialMode: PeriodMode = 'month') {
  const today = todayIso();
  const [state, setState] = useState<PeriodState>({
    mode: initialMode,
    month: monthKey(today),
    year: Number(today.slice(0, 4)),
    from: `${today.slice(0, 4)}-01-01`,
    to: today,
  });

  const period: Period = useMemo(() => {
    if (state.mode === 'month') return { from: monthStart(state.month), to: monthEnd(state.month) };
    if (state.mode === 'year') return { from: `${state.year}-01-01`, to: `${state.year}-12-31` };
    return state.from <= state.to ? { from: state.from, to: state.to } : { from: state.to, to: state.from };
  }, [state]);

  const label = useMemo(() => {
    if (state.mode === 'month') {
      const [y, m] = state.month.split('-').map(Number);
      return `${MONTHS_LONG[m - 1]} ${y}`;
    }
    if (state.mode === 'year') return `Anno ${state.year}`;
    const f = (d: string) => d.split('-').reverse().join('/');
    return `${f(period.from)} – ${f(period.to)}`;
  }, [state, period]);

  return { state, setState, period, label };
}

export const PeriodFilter: React.FC<{
  value: PeriodState;
  onChange: (v: PeriodState) => void;
  years?: number[];
}> = ({ value, onChange, years }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = years ?? Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);
  const [y, m] = value.month.split('-').map(Number);

  const step = (dir: 1 | -1) => {
    if (value.mode === 'month') onChange({ ...value, month: addMonths(value.month, dir) });
    if (value.mode === 'year') onChange({ ...value, year: value.year + dir });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="flex rounded-lg bg-slate-100 p-0.5" role="tablist" aria-label="Tipo di periodo">
        {(
          [
            ['month', 'Mese'],
            ['year', 'Anno'],
            ['custom', 'Intervallo'],
          ] as const
        ).map(([mode, text]) => (
          <button
            key={mode}
            role="tab"
            aria-selected={value.mode === mode}
            onClick={() => onChange({ ...value, mode })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              value.mode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {value.mode !== 'custom' && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => step(-1)} aria-label="Periodo precedente">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {value.mode === 'month' && (
        <>
          <Select value={String(m)} onValueChange={(v) => onChange({ ...value, month: `${y}-${v.padStart(2, '0')}` })}>
            <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Mese">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_LONG.map((name, i) => (
                <SelectItem key={name} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(y)}
            onValueChange={(v) => onChange({ ...value, month: `${v}-${String(m).padStart(2, '0')}` })}
          >
            <SelectTrigger className="h-8 w-[90px] text-xs" aria-label="Anno">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...new Set([...yearOptions, y])].sort((a, b) => b - a).map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {value.mode === 'year' && (
        <Select value={String(value.year)} onValueChange={(v) => onChange({ ...value, year: Number(v) })}>
          <SelectTrigger className="h-8 w-[100px] text-xs" aria-label="Anno">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...new Set([...yearOptions, value.year])].sort((a, b) => b - a).map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {value.mode === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <Input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-8 w-[145px] text-xs"
            aria-label="Dal"
          />
          <span className="text-xs text-slate-400">→</span>
          <Input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-8 w-[145px] text-xs"
            aria-label="Al"
          />
        </div>
      )}

      {value.mode !== 'custom' && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => step(1)} aria-label="Periodo successivo">
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCHEDE INDICATORI
// ------------------------------------------------------------------------------
const TONES = {
  slate: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  primary: 'bg-primary/10 text-primary',
} as const;
export type KpiTone = keyof typeof TONES;

export const KpiCard: React.FC<{
  title: string;
  value: number;
  hint?: React.ReactNode;
  icon: React.ElementType;
  tone?: KpiTone;
  /** Colora il valore in verde/rosso secondo il segno */
  signed?: boolean;
  highlight?: boolean;
}> = ({ title, value, hint, icon: Icon, tone = 'slate', signed, highlight }) => (
  <Card className={`shadow-sm h-full ${highlight ? 'border-primary/30 bg-primary/[0.03]' : 'border-slate-200'}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 p-4">
      <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">{title}</CardTitle>
      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${TONES[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-0">
      <div
        className={`text-xl sm:text-2xl font-bold ${
          signed ? (value < 0 ? 'text-rose-600' : value > 0 ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-900'
        }`}
      >
        {eur.format(value)}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{hint}</p>}
    </CardContent>
  </Card>
);

export const SectionTitle: React.FC<{ icon: React.ElementType; title: string; description?: string }> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex items-start gap-2">
    <Icon className="h-4 w-4 text-primary mt-1 shrink-0" />
    <div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  </div>
);

export const FinanceErrorBanner: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</div>
  ) : null;

// ------------------------------------------------------------------------------
// RIPARTIZIONE PER CATEGORIA (barre orizzontali)
// ------------------------------------------------------------------------------
export const CategoryBreakdown: React.FC<{
  items: { id: string; name: string; amount: number; hint?: string }[];
  color?: string;
  empty?: string;
}> = ({ items, color = 'bg-rose-500', empty = 'Nessuna voce nel periodo.' }) => {
  const max = Math.max(...items.map((i) => i.amount), 0);
  if (items.length === 0 || max === 0) return <p className="text-xs text-slate-400 py-2">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.id}>
          <div className="flex justify-between text-xs mb-0.5 gap-2">
            <span className="font-medium text-slate-700 truncate">
              {i.name}
              {i.hint && <span className="text-slate-400 font-normal"> · {i.hint}</span>}
            </span>
            <span className="font-semibold text-slate-900 shrink-0">{eur.format(i.amount)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${(i.amount / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export const FinanceLoading: React.FC = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);
