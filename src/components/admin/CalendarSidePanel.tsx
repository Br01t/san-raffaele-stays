import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Flame, StickyNote, MousePointerClick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EventItem, InternalNote } from '@/types/database';

const CATEGORY_LABELS: Record<InternalNote['category'], string> = {
  tariff: 'Tariffe',
  reminder: 'Promemoria',
  maintenance: 'Manutenzione',
  general: 'Generale',
};

const CATEGORY_STYLES: Record<InternalNote['category'], string> = {
  tariff: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reminder: 'bg-sky-50 text-sky-700 border-sky-200',
  maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
  general: 'bg-slate-50 text-slate-600 border-slate-200',
};

const fmt = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}${y ? `/${y.slice(2)}` : ''}`;
};

interface Props {
  /** Primo e ultimo giorno del mese visualizzato (YYYY-MM-DD) */
  monthStart: string;
  monthEnd: string;
  monthLabel: string;
  apartmentId: string;
  apartmentName?: string;
  events: EventItem[];
  notes: InternalNote[];
  /** Seleziona sul calendario i giorni (del mese) coperti da un intervallo */
  onSelectRange: (start: string, end: string) => void;
}

/** Riferimento sempre visibile di eventi e note del mese, accanto al calendario. */
export const CalendarSidePanel: React.FC<Props> = ({
  monthStart,
  monthEnd,
  monthLabel,
  apartmentId,
  apartmentName,
  events,
  notes,
  onSelectRange,
}) => {
  const { monthEvents, notesByEvent, datedNotes, generalNotes } = useMemo(() => {
    const monthEvents = events
      .filter((e) => e.end_date >= monthStart && e.start_date <= monthEnd)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
    const eventIds = new Set(monthEvents.map((e) => e.id));

    // Note valide per questo alloggio (quelle senza alloggio valgono per tutti)
    const relevant = notes.filter((n) => !n.apartment_id || n.apartment_id === apartmentId);

    const notesByEvent = new Map<string, InternalNote[]>();
    const datedNotes: InternalNote[] = [];
    const generalNotes: InternalNote[] = [];

    for (const n of relevant) {
      if (n.event_id && eventIds.has(n.event_id)) {
        notesByEvent.set(n.event_id, [...(notesByEvent.get(n.event_id) ?? []), n]);
      } else if (n.note_date) {
        if (n.note_date >= monthStart && n.note_date <= monthEnd) datedNotes.push(n);
      } else if (!n.event_id) {
        generalNotes.push(n);
      }
    }
    datedNotes.sort((a, b) => (a.note_date ?? '').localeCompare(b.note_date ?? ''));
    return { monthEvents, notesByEvent, datedNotes, generalNotes };
  }, [events, notes, monthStart, monthEnd, apartmentId]);

  const NoteLine: React.FC<{ note: InternalNote; showDate?: boolean }> = ({ note, showDate }) => (
    <div className="text-[11px] leading-snug text-slate-700 flex gap-1.5">
      <StickyNote className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1 mb-0.5">
          {showDate && note.note_date && (
            <span className="font-bold text-slate-800">{fmt(note.note_date)}</span>
          )}
          <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${CATEGORY_STYLES[note.category]}`}>
            {CATEGORY_LABELS[note.category]}
          </Badge>
          {!note.apartment_id && <span className="text-[9px] text-slate-400">tutti gli alloggi</span>}
        </div>
        <p className="whitespace-pre-wrap break-words">{note.content}</p>
      </div>
    </div>
  );

  const empty = monthEvents.length === 0 && datedNotes.length === 0 && generalNotes.length === 0;

  return (
    <aside className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 lg:sticky lg:top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Eventi e note</h3>
          <p className="text-[11px] text-slate-500 capitalize">
            {monthLabel}
            {apartmentName ? ` · ${apartmentName}` : ''}
          </p>
        </div>
        <Link to="/admin/eventi" className="text-[11px] text-primary font-semibold hover:underline shrink-0">
          Gestisci
        </Link>
      </div>

      {empty && (
        <p className="text-[11px] text-slate-400">
          Nessun evento o nota per questo mese. Aggiungili da "Eventi &amp; Note": compariranno qui e nel calendario.
        </p>
      )}

      {monthEvents.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" /> Eventi ({monthEvents.length})
          </h4>
          {monthEvents.map((e) => {
            const linked = notesByEvent.get(e.id) ?? [];
            const from = e.start_date < monthStart ? monthStart : e.start_date;
            const to = e.end_date > monthEnd ? monthEnd : e.end_date;
            return (
              <div key={e.id} className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      {e.is_high_demand && <Flame className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <span className="break-words">{e.name}</span>
                    </div>
                    <div className="text-[11px] text-amber-800/80">
                      {fmt(e.start_date)} → {fmt(e.end_date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectRange(from, to)}
                    className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
                    title="Seleziona sul calendario i giorni di questo evento"
                  >
                    <MousePointerClick className="h-3 w-3" /> Seleziona
                  </button>
                </div>
                {e.description && <p className="text-[11px] text-slate-600 whitespace-pre-wrap break-words">{e.description}</p>}
                {linked.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-amber-200/70">
                    {linked.map((n) => (
                      <NoteLine key={n.id} note={n} showDate />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {datedNotes.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <StickyNote className="h-3 w-3" /> Note del mese ({datedNotes.length})
          </h4>
          {datedNotes.map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <NoteLine note={n} showDate />
            </div>
          ))}
        </section>
      )}

      {generalNotes.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <StickyNote className="h-3 w-3" /> Note generali ({generalNotes.length})
          </h4>
          {generalNotes.map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <NoteLine note={n} />
            </div>
          ))}
        </section>
      )}
    </aside>
  );
};

export default CalendarSidePanel;
