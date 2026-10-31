/**
 * Agenda dell'amministratore (stile Google Calendar).
 * Tabella agenda_events (supabase/migrations/20261031_agenda.sql); in locale localStorage.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { generateUUID } from './admin-api';

export type AgendaRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AgendaEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  start_time: string | null; // HH:MM
  end_time: string | null;
  all_day: boolean;
  color: string;
  apartment_id: string | null;
  recurrence: AgendaRecurrence;
  recurrence_until: string | null;
  exdates: string[];
  created_at: string;
  updated_at: string;
}

export type AgendaEventInput = Omit<AgendaEvent, 'id' | 'created_at' | 'updated_at'>;

/** Occorrenza da disegnare nel calendario (un evento ricorrente ne produce molte). */
export interface AgendaInstance {
  key: string;
  eventId: string | null; // null = evento di sola lettura (altri livelli)
  title: string;
  date: string; // giorno di inizio dell'occorrenza
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  color: string;
  layer: 'agenda' | 'events' | 'finance';
  subtitle?: string;
}

// Palette in stile Google Calendar
export const AGENDA_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'tomato', name: 'Pomodoro', hex: '#d50000' },
  { id: 'flamingo', name: 'Fenicottero', hex: '#e67c73' },
  { id: 'tangerine', name: 'Mandarino', hex: '#f4511e' },
  { id: 'banana', name: 'Banana', hex: '#f6bf26' },
  { id: 'sage', name: 'Salvia', hex: '#33b679' },
  { id: 'basil', name: 'Basilico', hex: '#0b8043' },
  { id: 'peacock', name: 'Pavone', hex: '#039be5' },
  { id: 'blueberry', name: 'Mirtillo', hex: '#3f51b5' },
  { id: 'lavender', name: 'Lavanda', hex: '#7986cb' },
  { id: 'grape', name: 'Uva', hex: '#8e24aa' },
  { id: 'graphite', name: 'Grafite', hex: '#616161' },
];

export function colorHex(id: string): string {
  return AGENDA_COLORS.find((c) => c.id === id)?.hex ?? id;
}

// ------------------------------------------------------------------------------
// DATE
// ------------------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0');

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / 86_400_000);
}

/** Lunedì della settimana che contiene la data. */
export function startOfWeek(s: string): string {
  const d = parseIso(s);
  const dow = (d.getDay() + 6) % 7;
  return addDays(s, -dow);
}

export function timeToMinutes(t: string | null): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

const normTime = (t: string | null) => (t ? t.slice(0, 5) : null);

// ------------------------------------------------------------------------------
// RICORRENZE
// ------------------------------------------------------------------------------
function nthOccurrence(start: string, rec: AgendaRecurrence, n: number): string | null {
  const d = parseIso(start);
  if (rec === 'daily') d.setDate(d.getDate() + n);
  else if (rec === 'weekly') d.setDate(d.getDate() + 7 * n);
  else if (rec === 'monthly' || rec === 'yearly') {
    const day = d.getDate();
    const target = new Date(d.getFullYear() + (rec === 'yearly' ? n : 0), d.getMonth() + (rec === 'monthly' ? n : 0), 1);
    const dim = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    if (day > dim) return null; // es. 31 in un mese di 30 giorni: come Google, si salta
    target.setDate(day);
    return iso(target);
  }
  return iso(d);
}

/** Occorrenze (inizio) di un evento che si sovrappongono all'intervallo [from, to]. */
export function expandEvent(e: AgendaEvent, from: string, to: string): AgendaInstance[] {
  const length = diffDays(e.start_date, e.end_date);
  const make = (date: string): AgendaInstance => ({
    key: `${e.id}:${date}`,
    eventId: e.id,
    title: e.title,
    date,
    endDate: addDays(date, length),
    startTime: e.all_day ? null : e.start_time,
    endTime: e.all_day ? null : e.end_time,
    allDay: e.all_day,
    color: colorHex(e.color),
    layer: 'agenda',
    subtitle: e.location ?? undefined,
  });

  if (e.recurrence === 'none') {
    return e.end_date >= from && e.start_date <= to ? [make(e.start_date)] : [];
  }
  const out: AgendaInstance[] = [];
  const ex = new Set(e.exdates ?? []);
  const until = e.recurrence_until && e.recurrence_until < to ? e.recurrence_until : to;
  for (let n = 0; n < 5000; n++) {
    const date = nthOccurrence(e.start_date, e.recurrence, n);
    if (date === null) continue;
    if (date > until) break;
    if (addDays(date, length) < from || ex.has(date)) continue;
    out.push(make(date));
  }
  return out;
}

export function expandAll(events: AgendaEvent[], from: string, to: string): AgendaInstance[] {
  return events.flatMap((e) => expandEvent(e, from, to));
}

/** Ordinamento: prima gli eventi di tutto il giorno / più lunghi, poi per orario. */
export function sortInstances(a: AgendaInstance, b: AgendaInstance): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  const la = diffDays(a.date, a.endDate);
  const lb = diffDays(b.date, b.endDate);
  if (la !== lb) return lb - la;
  return timeToMinutes(a.startTime) - timeToMinutes(b.startTime) || a.title.localeCompare(b.title);
}

/**
 * Disposizione in colonne degli eventi con orario che si sovrappongono nello stesso giorno
 * (come nella vista settimana di Google Calendar).
 */
export function layoutDay(items: AgendaInstance[]): { item: AgendaInstance; col: number; cols: number }[] {
  const sorted = [...items].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const result: { item: AgendaInstance; col: number; cols: number }[] = [];
  let cluster: { item: AgendaInstance; col: number; end: number }[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.col + 1));
    cluster.forEach((c) => result.push({ item: c.item, col: c.col, cols }));
    cluster = [];
  };
  for (const it of sorted) {
    const start = timeToMinutes(it.startTime);
    const end = Math.max(start + 30, it.endTime ? timeToMinutes(it.endTime) : start + 60);
    if (start >= clusterEnd && cluster.length) flush();
    const used = new Set(cluster.filter((c) => c.end > start).map((c) => c.col));
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ item: it, col, end });
    clusterEnd = Math.max(clusterEnd, end);
  }
  if (cluster.length) flush();
  return result;
}

// ------------------------------------------------------------------------------
// API
// ------------------------------------------------------------------------------
const LS_AGENDA = 'srs_agenda_events';
const nowIso = () => new Date().toISOString();

function getLocal(): AgendaEvent[] {
  try {
    return JSON.parse(localStorage.getItem(LS_AGENDA) || '[]') as AgendaEvent[];
  } catch {
    return [];
  }
}
const setLocal = (list: AgendaEvent[]) => localStorage.setItem(LS_AGENDA, JSON.stringify(list));

let agendaTableMissing = false;

function isMissingTable(error: { message: string; code?: string }): boolean {
  return error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message);
}

function useAgendaDb(): boolean {
  return isSupabaseConfigured() && !agendaTableMissing;
}

function agendaError(action: string, error: { message: string; code?: string }): Error {
  console.error(`Supabase ${action}:`, error);
  if (isMissingTable(error)) {
    return new Error('Tabella agenda mancante: esegui supabase/migrations/20261031_agenda.sql nel SQL Editor di Supabase.');
  }
  return new Error(`${action}: ${error.message}`);
}

const normalize = (e: AgendaEvent): AgendaEvent => ({
  ...e,
  start_time: normTime(e.start_time),
  end_time: normTime(e.end_time),
  exdates: e.exdates ?? [],
});

function validate(e: Partial<AgendaEventInput>) {
  if (e.title !== undefined && !e.title.trim()) throw new Error('Inserisci un titolo.');
  if (e.start_date && e.end_date && e.end_date < e.start_date) throw new Error('La fine non può precedere l’inizio.');
  if (
    e.start_date &&
    e.end_date === e.start_date &&
    !e.all_day &&
    e.start_time &&
    e.end_time &&
    e.end_time < e.start_time
  ) {
    throw new Error('L’ora di fine non può precedere l’ora di inizio.');
  }
}

export async function getAgendaEvents(): Promise<AgendaEvent[]> {
  if (useAgendaDb()) {
    const out: AgendaEvent[] = [];
    let fallback = false;
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from('agenda_events')
        .select('*')
        .order('start_date', { ascending: true })
        .range(from, from + 999);
      if (error) {
        if (isMissingTable(error)) {
          agendaTableMissing = true;
          fallback = true;
          break;
        }
        throw agendaError('Lettura agenda', error);
      }
      out.push(...((data ?? []) as AgendaEvent[]));
      if (!data || data.length < 1000) break;
    }
    if (!fallback) return out.map(normalize);
  }
  return getLocal().map(normalize);
}

export async function createAgendaEvent(input: AgendaEventInput): Promise<AgendaEvent> {
  validate(input);
  if (useAgendaDb()) {
    const { data, error } = await supabase.from('agenda_events').insert(input).select().single();
    if (!error) return normalize(data as AgendaEvent);
    if (!isMissingTable(error)) throw agendaError('Creazione evento', error);
    agendaTableMissing = true;
  }
  const created: AgendaEvent = { ...input, id: generateUUID(), created_at: nowIso(), updated_at: nowIso() };
  setLocal([...getLocal(), created]);
  return created;
}

export async function updateAgendaEvent(id: string, updates: Partial<AgendaEventInput>): Promise<AgendaEvent> {
  validate(updates);
  if (useAgendaDb()) {
    const { data, error } = await supabase.from('agenda_events').update(updates).eq('id', id).select();
    if (!error) {
      if (!data?.length) throw new Error('Modifica evento: nessuna riga aggiornata.');
      return normalize(data[0] as AgendaEvent);
    }
    if (!isMissingTable(error)) throw agendaError('Modifica evento', error);
    agendaTableMissing = true;
  }
  const list = getLocal();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Evento non trovato');
  list[idx] = { ...list[idx], ...updates, updated_at: nowIso() };
  setLocal(list);
  return list[idx];
}

export async function deleteAgendaEvent(id: string): Promise<void> {
  if (useAgendaDb()) {
    const { error } = await supabase.from('agenda_events').delete().eq('id', id);
    if (!error) return;
    if (!isMissingTable(error)) throw agendaError('Eliminazione evento', error);
    agendaTableMissing = true;
  }
  setLocal(getLocal().filter((e) => e.id !== id));
}

/** Elimina una sola occorrenza di un evento ricorrente. */
export async function deleteAgendaOccurrence(event: AgendaEvent, date: string): Promise<void> {
  await updateAgendaEvent(event.id, { exdates: [...new Set([...(event.exdates ?? []), date])] });
}
