import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, MapPin, AlignLeft, Repeat, Clock, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Apartment } from '@/types/database';
import {
  AGENDA_COLORS,
  AgendaEvent,
  AgendaRecurrence,
  createAgendaEvent,
  deleteAgendaEvent,
  deleteAgendaOccurrence,
  updateAgendaEvent,
} from '@/lib/agenda';

export interface AgendaDraft {
  date: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
}

const WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

function recurrenceLabel(rec: AgendaRecurrence, date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  switch (rec) {
    case 'daily':
      return 'Ogni giorno';
    case 'weekly':
      return `Ogni settimana di ${WEEKDAYS[dt.getDay()]}`;
    case 'monthly':
      return `Ogni mese il giorno ${d}`;
    case 'yearly':
      return `Ogni anno il ${d}/${m}`;
    default:
      return 'Non si ripete';
  }
}

const plusOneHour = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(h >= 23 ? 59 : m).padStart(2, '0')}`;
};

export const AgendaEventDialog: React.FC<{
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event: AgendaEvent | null;
  /** Data dell'occorrenza cliccata (per eliminare solo quella) */
  occurrenceDate?: string | null;
  draft: AgendaDraft | null;
  apartments: Apartment[];
  onSaved: () => void;
}> = ({ open, onOpenChange, event, occurrenceDate, draft, apartments, onSaved }) => {
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [recurrence, setRecurrence] = useState<AgendaRecurrence>('none');
  const [until, setUntil] = useState('');
  const [color, setColor] = useState('peacock');
  const [location, setLocation] = useState('');
  const [apartmentId, setApartmentId] = useState('none');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    if (event) {
      setTitle(event.title);
      setAllDay(event.all_day);
      setStartDate(event.start_date);
      setEndDate(event.end_date);
      setStartTime(event.start_time ?? '09:00');
      setEndTime(event.end_time ?? '10:00');
      setRecurrence(event.recurrence);
      setUntil(event.recurrence_until ?? '');
      setColor(event.color);
      setLocation(event.location ?? '');
      setApartmentId(event.apartment_id ?? 'none');
      setDescription(event.description ?? '');
    } else if (draft) {
      setTitle('');
      setAllDay(draft.allDay ?? false);
      setStartDate(draft.date);
      setEndDate(draft.date);
      const st = draft.startTime ?? '09:00';
      setStartTime(st);
      setEndTime(draft.endTime ?? plusOneHour(st));
      setRecurrence('none');
      setUntil('');
      setColor('peacock');
      setLocation('');
      setApartmentId('none');
      setDescription('');
    }
  }, [open, event, draft]);

  // Spostando l'inizio, la fine segue mantenendo la durata (come in Google Calendar)
  const changeStartDate = (v: string) => {
    if (!v) return;
    if (startDate && endDate) {
      const len = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000);
      const d = new Date(v);
      d.setDate(d.getDate() + Math.max(0, len));
      setEndDate(d.toISOString().slice(0, 10));
    } else setEndDate(v);
    setStartDate(v);
  };
  const changeStartTime = (v: string) => {
    setStartTime(v);
    if (startDate === endDate && endTime <= v) setEndTime(plusOneHour(v));
  };

  const recurrenceOptions = useMemo(
    () => (['none', 'daily', 'weekly', 'monthly', 'yearly'] as AgendaRecurrence[]).map((r) => ({ r, label: recurrenceLabel(r, startDate || '2026-01-01') })),
    [startDate]
  );

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: title.trim() || '(Senza titolo)',
        description: description.trim() || null,
        location: location.trim() || null,
        start_date: startDate,
        end_date: endDate < startDate ? startDate : endDate,
        start_time: allDay ? null : startTime,
        end_time: allDay ? null : endTime,
        all_day: allDay,
        color,
        apartment_id: apartmentId === 'none' ? null : apartmentId,
        recurrence,
        recurrence_until: recurrence === 'none' ? null : until || null,
        exdates: event?.exdates ?? [],
      };
      if (event) await updateAgendaEvent(event.id, payload);
      else await createAgendaEvent(payload);
      toast.success(event ? 'Evento aggiornato' : 'Evento creato');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (scope: 'one' | 'all') => {
    if (!event) return;
    try {
      if (scope === 'one' && occurrenceDate) await deleteAgendaOccurrence(event, occurrenceDate);
      else await deleteAgendaEvent(event.id);
      toast.success('Evento eliminato');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{event ? 'Modifica evento' : 'Nuovo evento'}</DialogTitle>
          <DialogDescription className="sr-only">Titolo, data, orario e dettagli dell’evento</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !saving && save()}
            placeholder="Aggiungi titolo"
            className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary h-11"
          />

          <div className="flex gap-3">
            <Clock className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input type="date" value={startDate} onChange={(e) => changeStartDate(e.target.value)} className="h-9 w-[150px]" aria-label="Data inizio" />
                {!allDay && (
                  <Input type="time" value={startTime} onChange={(e) => changeStartTime(e.target.value)} className="h-9 w-[110px]" aria-label="Ora inizio" step={900} />
                )}
                <span className="text-slate-400 text-sm">–</span>
                {!allDay && (
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9 w-[110px]" aria-label="Ora fine" step={900} />
                )}
                <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-[150px]" aria-label="Data fine" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="allday" checked={allDay} onCheckedChange={setAllDay} />
                <Label htmlFor="allday" className="text-xs font-medium cursor-pointer">
                  Tutto il giorno
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Repeat className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
            <div className="flex-1 flex flex-wrap gap-2">
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as AgendaRecurrence)}>
                <SelectTrigger className="h-9 w-[230px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((o) => (
                    <SelectItem key={o.r} value={o.r}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {recurrence !== 'none' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">fino al</span>
                  <Input type="date" value={until} min={startDate} onChange={(e) => setUntil(e.target.value)} className="h-9 w-[150px]" aria-label="Ripeti fino al" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Aggiungi luogo" className="h-9" />
          </div>

          <div className="flex gap-3">
            <Building2 className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessun appartamento collegato</SelectItem>
                {apartments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <AlignLeft className="h-4 w-4 text-slate-400 mt-2.5 shrink-0" />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Aggiungi descrizione" rows={3} className="text-sm" />
          </div>

          <div className="flex gap-3 items-center">
            <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: AGENDA_COLORS.find((c) => c.id === color)?.hex }} />
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Colore">
              {AGENDA_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={color === c.id}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setColor(c.id)}
                  className={`h-6 w-6 rounded-full transition-transform ${color === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {event && event.recurrence !== 'none' && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2">
              Le modifiche si applicano a tutta la serie. Per togliere un solo giorno usa “Elimina → solo questo evento”.
            </p>
          )}
        </div>

        <DialogFooter className="flex-row items-center sm:justify-between gap-2 pt-2">
          <div className="mr-auto">
            {event &&
              (confirmDelete ? (
                <div className="flex flex-wrap gap-1.5">
                  {event.recurrence !== 'none' && occurrenceDate && (
                    <Button variant="outline" size="sm" className="text-xs text-rose-600" onClick={() => remove('one')}>
                      Solo questo evento
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" className="text-xs" onClick={() => remove('all')}>
                    {event.recurrence !== 'none' ? 'Tutta la serie' : 'Conferma eliminazione'}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="text-rose-600 gap-1.5" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Elimina
                </Button>
              ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Annulla
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
