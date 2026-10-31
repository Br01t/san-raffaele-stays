import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AgendaEventDialog, AgendaDraft } from '@/components/admin/agenda/AgendaEventDialog';
import {
  AgendaEvent,
  AgendaInstance,
  addDays,
  diffDays,
  expandAll,
  getAgendaEvents,
  iso,
  layoutDay,
  parseIso,
  sortInstances,
  startOfWeek,
  timeToMinutes,
} from '@/lib/agenda';
import { getApartments, getEvents } from '@/lib/admin-api';
import { getCategories, getRecurring } from '@/lib/finance-api';
import { occurrenceDates } from '@/lib/finance-calc';
import { Apartment, EventItem } from '@/types/database';
import { FinanceCategory, FinanceRecurring } from '@/types/finance';
import { isSupabaseConfigured } from '@/lib/supabase';

type View = 'month' | 'week' | 'day' | 'list';

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const DOW_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
const DOW_LONG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const HOUR_PX = 48;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const eurFmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function monthGrid(cursor: string): string[] {
  const d = parseIso(cursor);
  const first = iso(new Date(d.getFullYear(), d.getMonth(), 1));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const covers = (it: AgendaInstance, day: string) => it.date <= day && it.endDate >= day;

// ------------------------------------------------------------------------------
// MINI CALENDARIO
// ------------------------------------------------------------------------------
const MiniCalendar: React.FC<{ cursor: string; selected: string; today: string; onPick: (d: string) => void; marks: Set<string> }> = ({
  cursor,
  selected,
  today,
  onPick,
  marks,
}) => {
  const [view, setView] = useState(cursor);
  useEffect(() => setView(cursor), [cursor]);
  const d = parseIso(view);
  const days = monthGrid(view);
  const shift = (n: number) => setView(iso(new Date(d.getFullYear(), d.getMonth() + n, 1)));
  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-800">
          {cap(MONTHS[d.getMonth()])} {d.getFullYear()}
        </span>
        <div className="flex">
          <button className="p-1 rounded-full hover:bg-slate-100" onClick={() => shift(-1)} aria-label="Mese precedente">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="p-1 rounded-full hover:bg-slate-100" onClick={() => shift(1)} aria-label="Mese successivo">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-semibold">
        {DOW_SHORT.map((x) => (
          <div key={x} className="py-1">{x[0]}</div>
        ))}
        {days.map((day) => {
          const inMonth = parseIso(day).getMonth() === d.getMonth();
          return (
            <button
              key={day}
              onClick={() => onPick(day)}
              className={`relative mx-auto my-0.5 h-7 w-7 rounded-full text-[11px] transition-colors ${
                day === today
                  ? 'bg-primary text-white font-bold'
                  : day === selected
                    ? 'bg-primary/15 text-primary font-bold'
                    : inMonth
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              {parseIso(day).getDate()}
              {marks.has(day) && day !== today && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// CHIP EVENTO (vista mese)
// ------------------------------------------------------------------------------
const Chip: React.FC<{ it: AgendaInstance; onClick: (it: AgendaInstance) => void }> = ({ it, onClick }) => {
  const solid = it.allDay || it.date !== it.endDate;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(it);
      }}
      className={`w-full text-left truncate rounded px-1.5 py-[1px] text-[11px] leading-4 ${solid ? 'text-white font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
      style={solid ? { backgroundColor: it.color } : undefined}
      title={it.title}
    >
      {!solid && <span className="inline-block h-2 w-2 rounded-full mr-1 align-middle" style={{ backgroundColor: it.color }} />}
      {!solid && it.startTime && <span className="text-slate-500 mr-1">{it.startTime}</span>}
      {it.title}
    </button>
  );
};

// ------------------------------------------------------------------------------
// PAGINA
// ------------------------------------------------------------------------------
export const AdminAgenda: React.FC = () => {
  const today = iso(new Date());
  const [cursor, setCursor] = useState(today);
  const [view, setView] = useState<View>(() => (window.innerWidth < 640 ? 'list' : 'month'));
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [zoneEvents, setZoneEvents] = useState<EventItem[]>([]);
  const [recurring, setRecurring] = useState<FinanceRecurring[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [layers, setLayers] = useState({ agenda: true, events: true, finance: true });
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);
  const [occurrence, setOccurrence] = useState<string | null>(null);
  const [draft, setDraft] = useState<AgendaDraft | null>(null);
  const [info, setInfo] = useState<AgendaInstance | null>(null);
  const [moreDay, setMoreDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setEvents(await getAgendaEvents());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dell’agenda.');
    }
    // Livelli aggiuntivi: se non disponibili si ignorano
    getApartments().then(setApartments).catch(() => undefined);
    getEvents().then(setZoneEvents).catch(() => undefined);
    Promise.all([getRecurring(), getCategories()])
      .then(([r, c]) => {
        setRecurring(r);
        setCategories(c);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Intervallo visibile
  const range = useMemo(() => {
    if (view === 'month') {
      const g = monthGrid(cursor);
      return { from: g[0], to: g[41], days: g };
    }
    if (view === 'week') {
      const s = startOfWeek(cursor);
      return { from: s, to: addDays(s, 6), days: Array.from({ length: 7 }, (_, i) => addDays(s, i)) };
    }
    if (view === 'day') return { from: cursor, to: cursor, days: [cursor] };
    return { from: cursor, to: addDays(cursor, 59), days: Array.from({ length: 60 }, (_, i) => addDays(cursor, i)) };
  }, [view, cursor]);

  const instances = useMemo(() => {
    const out: AgendaInstance[] = [];
    if (layers.agenda) out.push(...expandAll(events, range.from, range.to));
    if (layers.events) {
      for (const e of zoneEvents) {
        if (e.end_date < range.from || e.start_date > range.to) continue;
        out.push({
          key: `evt:${e.id}`,
          eventId: null,
          title: e.name,
          date: e.start_date,
          endDate: e.end_date,
          startTime: null,
          endTime: null,
          allDay: true,
          color: e.is_high_demand ? '#d97706' : '#94a3b8',
          layer: 'events',
          subtitle: e.is_high_demand ? 'Alta richiesta' : 'Evento in zona',
        });
      }
    }
    if (layers.finance) {
      const cat = new Map(categories.map((c) => [c.id, c.name]));
      for (const r of recurring) {
        for (const date of occurrenceDates(r, range.from, range.to)) {
          out.push({
            key: `fin:${r.id}:${date}`,
            eventId: null,
            title: `${r.direction === 'income' ? '+' : '−'}${eurFmt.format(Number(r.amount))} ${cat.get(r.category_id) ?? ''}`,
            date,
            endDate: date,
            startTime: null,
            endTime: null,
            allDay: true,
            color: r.direction === 'income' ? '#0b8043' : '#616161',
            layer: 'finance',
            subtitle: r.description ?? (r.scope === 'apartment' ? 'Scadenza appartamenti' : 'Scadenza personale'),
          });
        }
      }
    }
    return out.sort(sortInstances);
  }, [layers, events, zoneEvents, recurring, categories, range]);

  const marks = useMemo(() => {
    const s = new Set<string>();
    expandAll(events, addDays(cursor, -45), addDays(cursor, 75)).forEach((i) => {
      for (let d = i.date; d <= i.endDate; d = addDays(d, 1)) s.add(d);
    });
    return s;
  }, [events, cursor]);

  // Navigazione
  const move = useCallback(
    (dir: 1 | -1) => {
      const d = parseIso(cursor);
      if (view === 'month') setCursor(iso(new Date(d.getFullYear(), d.getMonth() + dir, 1)));
      else if (view === 'week') setCursor(addDays(cursor, 7 * dir));
      else if (view === 'day') setCursor(addDays(cursor, dir));
      else setCursor(addDays(cursor, 30 * dir));
    },
    [cursor, view]
  );

  const openCreate = useCallback((d: AgendaDraft) => {
    setEditing(null);
    setOccurrence(null);
    setDraft(d);
    setDialogOpen(true);
  }, []);

  const openInstance = (it: AgendaInstance) => {
    if (it.layer !== 'agenda' || !it.eventId) {
      setInfo(it);
      return;
    }
    const ev = events.find((e) => e.id === it.eventId) ?? null;
    setEditing(ev);
    setOccurrence(it.date);
    setDraft(null);
    setDialogOpen(true);
  };

  // Scorciatoie da tastiera come Google Calendar: t, m, w/s, d/g, a/l, c/n, ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (dialogOpen || info || moreDay || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      const k = e.key.toLowerCase();
      if (k === 't') setCursor(today);
      else if (k === 'm') setView('month');
      else if (k === 'w' || k === 's') setView('week');
      else if (k === 'd' || k === 'g') setView('day');
      else if (k === 'a' || k === 'l') setView('list');
      else if (k === 'c' || k === 'n') openCreate({ date: cursor });
      else if (e.key === 'ArrowLeft' || k === 'k' || k === 'p') move(-1);
      else if (e.key === 'ArrowRight' || k === 'j') move(1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogOpen, info, moreDay, today, cursor, move, openCreate]);

  const title = useMemo(() => {
    const d = parseIso(cursor);
    if (view === 'month') return `${cap(MONTHS[d.getMonth()])} ${d.getFullYear()}`;
    if (view === 'day') return `${cap(DOW_LONG[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const a = parseIso(range.from);
    const b = parseIso(range.to);
    if (view === 'week') {
      return a.getMonth() === b.getMonth()
        ? `${a.getDate()} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
        : `${a.getDate()} ${MONTHS[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTHS[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
    }
    return `Da ${a.getDate()} ${MONTHS[a.getMonth()]} · prossimi 60 giorni`;
  }, [cursor, view, range]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Agenda</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(today)} title="Oggi (T)">
            Oggi
          </Button>
          <div className="flex">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(-1)} aria-label="Precedente">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(1)} aria-label="Successivo">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 min-w-[10rem]">{title}</h2>
          <div className="flex rounded-lg bg-slate-100 p-0.5 ml-auto lg:ml-2" role="tablist" aria-label="Vista">
            {(
              [
                ['day', 'Giorno', 'D'],
                ['week', 'Settimana', 'W'],
                ['month', 'Mese', 'M'],
                ['list', 'Elenco', 'A'],
              ] as [View, string, string][]
            ).map(([v, label, key]) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                title={`${label} (${key})`}
                onClick={() => setView(v)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
      {!isSupabaseConfigured() && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
          Modalità anteprima locale: gli eventi restano solo in questo browser.
        </div>
      )}

      <div className="flex gap-6">
        {/* Colonna sinistra (desktop) */}
        <aside className="hidden xl:block w-60 shrink-0 space-y-6">
          <Button onClick={() => openCreate({ date: cursor })} className="h-12 px-5 rounded-2xl shadow-md gap-2 font-semibold" title="Crea (C)">
            <Plus className="h-5 w-5" /> Crea
          </Button>
          <MiniCalendar cursor={cursor} selected={cursor} today={today} onPick={setCursor} marks={marks} />
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Calendari</h3>
            {(
              [
                ['agenda', 'I miei impegni', '#039be5'],
                ['events', 'Eventi & alta richiesta', '#d97706'],
                ['finance', 'Scadenze spese/entrate', '#616161'],
              ] as [keyof typeof layers, string, string][]
            ).map(([k, label, color]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <Checkbox
                  checked={layers[k]}
                  onCheckedChange={(v) => setLayers({ ...layers, [k]: v === true })}
                  style={{ backgroundColor: layers[k] ? color : undefined, borderColor: color }}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scorciatoie: <kbd>T</kbd> oggi · <kbd>M</kbd>/<kbd>W</kbd>/<kbd>D</kbd>/<kbd>A</kbd> viste · <kbd>C</kbd> crea · <kbd>←</kbd>
            <kbd>→</kbd> sposta
          </p>
        </aside>

        {/* Calendario */}
        <div className="flex-1 min-w-0">
          {view === 'month' && (
            <MonthView
              days={range.days}
              cursor={cursor}
              today={today}
              instances={instances}
              onCreate={(date) => openCreate({ date, allDay: false })}
              onOpen={openInstance}
              onMore={setMoreDay}
              onDayTitle={(d) => {
                setCursor(d);
                setView('day');
              }}
            />
          )}
          {(view === 'week' || view === 'day') && (
            <TimeGrid
              days={range.days}
              today={today}
              instances={instances}
              onCreate={openCreate}
              onOpen={openInstance}
              onDayTitle={(d) => {
                setCursor(d);
                setView('day');
              }}
            />
          )}
          {view === 'list' && <ListView days={range.days} today={today} instances={instances} onOpen={openInstance} />}
        </div>
      </div>

      {/* Pulsante flottante (mobile/tablet) */}
      <button
        onClick={() => openCreate({ date: cursor })}
        className="xl:hidden fixed bottom-5 right-5 z-40 h-14 w-14 rounded-2xl bg-primary text-white shadow-lg flex items-center justify-center"
        aria-label="Crea evento"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AgendaEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        occurrenceDate={occurrence}
        draft={draft}
        apartments={apartments}
        onSaved={load}
      />

      {/* Dettaglio eventi di sola lettura */}
      <Dialog open={!!info} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: info?.color }} />
              {info?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {info && (info.date === info.endDate ? info.date.split('-').reverse().join('/') : `${info.date.split('-').reverse().join('/')} → ${info.endDate.split('-').reverse().join('/')}`)}
              {info?.subtitle && ` · ${info.subtitle}`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-slate-600 flex gap-2">
            <Info className="h-4 w-4 shrink-0 text-primary" />
            {info?.layer === 'events'
              ? 'Evento gestito nella pagina Eventi & Note.'
              : 'Scadenza generata da una ricorrenza della gestione finanziaria.'}
          </p>
          <Link
            to={info?.layer === 'events' ? '/admin/eventi' : '/admin/finanze-personali'}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Apri la pagina →
          </Link>
        </DialogContent>
      </Dialog>

      {/* Tutti gli eventi di un giorno (“+N altri”) */}
      <Dialog open={!!moreDay} onOpenChange={(o) => !o && setMoreDay(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">
              <span className="block text-xs font-semibold text-slate-500 uppercase">
                {moreDay && DOW_LONG[parseIso(moreDay).getDay()]}
              </span>
              <span className="text-3xl">{moreDay && parseIso(moreDay).getDate()}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">Eventi del giorno</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            {moreDay &&
              instances
                .filter((i) => covers(i, moreDay))
                .map((i) => (
                  <Chip
                    key={i.key}
                    it={i}
                    onClick={(x) => {
                      setMoreDay(null);
                      openInstance(x);
                    }}
                  />
                ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ------------------------------------------------------------------------------
// VISTA MESE
// ------------------------------------------------------------------------------
const MAX_CHIPS = 3;

const MonthView: React.FC<{
  days: string[];
  cursor: string;
  today: string;
  instances: AgendaInstance[];
  onCreate: (date: string) => void;
  onOpen: (it: AgendaInstance) => void;
  onMore: (date: string) => void;
  onDayTitle: (date: string) => void;
}> = ({ days, cursor, today, instances, onCreate, onOpen, onMore, onDayTitle }) => {
  const month = parseIso(cursor).getMonth();
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DOW_SHORT.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-500">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((day, idx) => {
          const items = instances.filter((i) => covers(i, day));
          const extra = items.length - MAX_CHIPS;
          const inMonth = parseIso(day).getMonth() === month;
          return (
            <div
              key={day}
              onClick={() => onCreate(day)}
              className={`min-h-[96px] sm:min-h-[112px] p-1 border-slate-100 cursor-pointer hover:bg-slate-50/70 ${idx % 7 !== 6 ? 'border-r' : ''} ${idx < 35 ? 'border-b' : ''} ${inMonth ? '' : 'bg-slate-50/50'}`}
            >
              <div className="flex justify-center mb-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayTitle(day);
                  }}
                  className={`h-6 min-w-6 px-1 rounded-full text-[11px] font-semibold ${
                    day === today ? 'bg-primary text-white' : inMonth ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {parseIso(day).getDate() === 1 ? `1 ${MONTHS[parseIso(day).getMonth()].slice(0, 3)}` : parseIso(day).getDate()}
                </button>
              </div>
              <div className="space-y-0.5">
                {items.slice(0, extra > 0 ? MAX_CHIPS - 1 : MAX_CHIPS).map((it) => (
                  <Chip key={it.key} it={it} onClick={onOpen} />
                ))}
                {extra > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMore(day);
                    }}
                    className="w-full text-left px-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded"
                  >
                    altri {extra + 1}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// VISTA SETTIMANA / GIORNO (griglia oraria)
// ------------------------------------------------------------------------------
const TimeGrid: React.FC<{
  days: string[];
  today: string;
  instances: AgendaInstance[];
  onCreate: (d: AgendaDraft) => void;
  onOpen: (it: AgendaInstance) => void;
  onDayTitle: (date: string) => void;
}> = ({ days, today, instances, onCreate, onOpen, onDayTitle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: HOUR_PX * 7 - 10 });
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const allDay = (day: string) => instances.filter((i) => covers(i, day) && (i.allDay || i.date !== i.endDate));
  const timed = (day: string) => instances.filter((i) => i.date === day && i.date === i.endDate && !i.allDay);
  const cols = `56px repeat(${days.length}, minmax(0, 1fr))`;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slotClick = (day: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const minutes = Math.floor(((e.clientY - rect.top) / HOUR_PX) * 2) * 30;
    const h = Math.min(23, Math.floor(minutes / 60));
    const m = minutes % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    onCreate({ date: day, startTime: `${pad(h)}:${pad(m)}` });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* intestazione giorni */}
      <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
        <div />
        {days.map((day) => {
          const d = parseIso(day);
          return (
            <button key={day} onClick={() => onDayTitle(day)} className="py-2 text-center group">
              <div className={`text-[11px] font-semibold ${day === today ? 'text-primary' : 'text-slate-500'}`}>
                {DOW_SHORT[(d.getDay() + 6) % 7]}
              </div>
              <div
                className={`mx-auto mt-0.5 h-9 w-9 rounded-full flex items-center justify-center text-lg font-medium ${
                  day === today ? 'bg-primary text-white' : 'text-slate-800 group-hover:bg-slate-100'
                }`}
              >
                {d.getDate()}
              </div>
            </button>
          );
        })}
      </div>
      {/* riga "tutto il giorno" */}
      <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
        <div className="text-[9px] leading-tight text-slate-400 text-right pr-1.5 pt-1">tutto il<br />giorno</div>
        {days.map((day) => (
          <div
            key={day}
            className="border-l border-slate-100 p-0.5 space-y-0.5 min-h-[34px] cursor-pointer hover:bg-slate-50"
            onClick={() => onCreate({ date: day, allDay: true })}
          >
            {allDay(day).map((it) => (
              <Chip key={it.key} it={it} onClick={onOpen} />
            ))}
          </div>
        ))}
      </div>
      {/* ore */}
      <div ref={scrollRef} className="overflow-y-auto max-h-[calc(100vh-300px)] min-h-[420px]">
        <div className="grid relative" style={{ gridTemplateColumns: cols, height: HOUR_PX * 24 }}>
          <div className="relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="absolute right-2 text-[10px] text-slate-400 -translate-y-1/2" style={{ top: h * HOUR_PX }}>
                {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="relative border-l border-slate-100 cursor-pointer" onClick={(e) => slotClick(day, e)}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: h * HOUR_PX }} />
              ))}
              {layoutDay(timed(day)).map(({ item, col, cols: n }) => {
                const start = timeToMinutes(item.startTime);
                const end = Math.max(start + 20, item.endTime ? timeToMinutes(item.endTime) : start + 60);
                return (
                  <button
                    key={item.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(item);
                    }}
                    className="absolute rounded-md px-1.5 py-0.5 text-left text-white text-[11px] leading-tight overflow-hidden shadow-sm border border-white/60 hover:brightness-95"
                    style={{
                      top: (start / 60) * HOUR_PX,
                      height: Math.max(18, ((end - start) / 60) * HOUR_PX - 2),
                      left: `calc(${(col / n) * 100}% + 2px)`,
                      width: `calc(${100 / n}% - 4px)`,
                      backgroundColor: item.color,
                    }}
                  >
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className="opacity-90 truncate">
                      {item.startTime}
                      {item.endTime && ` – ${item.endTime}`}
                      {item.subtitle && `, ${item.subtitle}`}
                    </div>
                  </button>
                );
              })}
              {day === today && (
                <div className="absolute inset-x-0 z-10 pointer-events-none" style={{ top: (nowMin / 60) * HOUR_PX }}>
                  <div className="h-[2px] bg-rose-500 relative">
                    <span className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-rose-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// VISTA ELENCO
// ------------------------------------------------------------------------------
const ListView: React.FC<{
  days: string[];
  today: string;
  instances: AgendaInstance[];
  onOpen: (it: AgendaInstance) => void;
}> = ({ days, today, instances, onOpen }) => {
  const groups = days
    .map((day) => ({ day, items: instances.filter((i) => covers(i, day)) }))
    .filter((g) => g.items.length > 0);
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        Nessun impegno nei prossimi 60 giorni.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm">
      {groups.map(({ day, items }) => {
        const d = parseIso(day);
        return (
          <div key={day} className="flex gap-3 sm:gap-6 px-3 sm:px-4 py-3">
            <div className="w-16 sm:w-28 shrink-0 flex items-start gap-2">
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-base font-medium ${day === today ? 'bg-primary text-white' : 'text-slate-800'}`}
              >
                {d.getDate()}
              </span>
              <span className="text-[11px] text-slate-500 uppercase mt-2 hidden sm:inline">
                {MONTHS[d.getMonth()].slice(0, 3)}, {DOW_LONG[d.getDay()].slice(0, 3)}
              </span>
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              {items.map((it) => (
                <button key={it.key} onClick={() => onOpen(it)} className="w-full flex items-center gap-3 text-left rounded-md px-2 py-1 hover:bg-slate-50">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="w-24 shrink-0 text-xs text-slate-500">
                    {it.allDay || it.date !== it.endDate
                      ? it.date !== it.endDate
                        ? `${diffDays(it.date, day) + 1}° di ${diffDays(it.date, it.endDate) + 1} gg`
                        : 'Tutto il giorno'
                      : `${it.startTime}${it.endTime ? ` – ${it.endTime}` : ''}`}
                  </span>
                  <span className="text-sm text-slate-800 truncate">{it.title}</span>
                  {it.subtitle && <span className="text-xs text-slate-400 truncate hidden md:inline">{it.subtitle}</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
