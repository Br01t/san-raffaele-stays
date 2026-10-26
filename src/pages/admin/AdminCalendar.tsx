import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  History,
  Save,
  Sliders,
  DollarSign,
  StickyNote,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getApartments,
  getCalendarData,
  bulkUpdateCalendar,
  getRateHistory,
  getEvents,
  getNotes,
  getStayRules,
} from '@/lib/admin-api';
import { isSupabaseConfigured } from '@/lib/supabase';
import { monthRange, toDateStr } from '@/lib/date-utils';
import { CalendarSidePanel } from '@/components/admin/CalendarSidePanel';
import { StayRulesDialog } from '@/components/admin/StayRulesDialog';
import { MinStayNotice } from '@/components/admin/MinStayNotice';
import {
  Apartment,
  DailyRate,
  Availability,
  RateHistory,
  EventItem,
  InternalNote,
  MinStayRule,
} from '@/types/database';

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export const AdminCalendar: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [rates, setRates] = useState<DailyRate[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [stayRules, setStayRules] = useState<MinStayRule[]>([]);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const dbConnected = isSupabaseConfigured();

  // Range selection & bulk edit
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Prezzo: stringa vuota = "non modificare". Si invia solo se cambiato.
  const [editPrice, setEditPrice] = useState<string>('');
  const [initialPrice, setInitialPrice] = useState<string>('');
  const [priceMixed, setPriceMixed] = useState(false);
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [availTouched, setAvailTouched] = useState(false);
  const [availMixed, setAvailMixed] = useState(false);
  const [editHighDemand, setEditHighDemand] = useState<boolean>(false);
  const [demandTouched, setDemandTouched] = useState(false);
  const [demandMixed, setDemandMixed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const reloadRules = useCallback(async () => {
    setStayRules(await getStayRules());
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const apts = await getApartments();
        setApartments(apts);
        const [evts, nts, rules] = await Promise.all([getEvents(), getNotes(), getStayRules()]);
        setEvents(evts);
        setNotes(nts);
        setStayRules(rules);

        const aptFromUrl = searchParams.get('apartment');
        if (aptFromUrl && apts.some((a) => a.id === aptFromUrl)) {
          setSelectedAptId(aptFromUrl);
        } else if (apts.length > 0) {
          setSelectedAptId(apts[0].id);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Caricamento dati non riuscito.');
      }
    }
    init();
  }, [searchParams]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const { start: monthStart, end: monthEnd } = monthRange(year, month);

  const loadCalendar = useCallback(async () => {
    if (!selectedAptId) return;
    try {
      const data = await getCalendarData(selectedAptId, monthStart, monthEnd);
      setRates(data.rates);
      setAvailability(data.availability);
      setRateHistory(await getRateHistory(selectedAptId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Caricamento calendario non riuscito.');
    }
  }, [selectedAptId, monthStart, monthEnd]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const selectedApt = apartments.find((a) => a.id === selectedAptId);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDates([]);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDates([]);
  };
  const resetToToday = () => {
    setCurrentDate(new Date());
    setSelectedDates([]);
  };

  // Generate calendar days (lunedì = 0)
  const firstDayOfMonth = new Date(year, month, 1);
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarCells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= totalDays; d++) calendarCells.push(toDateStr(new Date(year, month, d)));

  // Note con data, valide per l'alloggio selezionato, raggruppate per giorno
  const notesByDate = useMemo(() => {
    const map = new Map<string, InternalNote[]>();
    for (const n of notes) {
      if (!n.note_date) continue;
      if (n.apartment_id && n.apartment_id !== selectedAptId) continue;
      map.set(n.note_date, [...(map.get(n.note_date) ?? []), n]);
    }
    return map;
  }, [notes, selectedAptId]);

  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) => (prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]));
  };

  const selectAllMonth = () => setSelectedDates(calendarCells.filter((c): c is string => !!c));

  const selectRange = (start: string, end: string) => {
    setSelectedDates(calendarCells.filter((c): c is string => !!c && c >= start && c <= end));
  };

  const openBulkEdit = () => {
    if (selectedDates.length === 0) {
      toast.warning('Seleziona almeno un giorno sul calendario da modificare.');
      return;
    }
    const base = Number(selectedApt?.base_price_2p ?? 0);

    // Valori attuali dei giorni selezionati: se sono tutti uguali li mostra, altrimenti lascia "invariato"
    const prices = new Set(
      selectedDates.map((d) => Number(rates.find((r) => r.rate_date === d)?.price_per_night ?? base))
    );
    const priceStr = prices.size === 1 ? String([...prices][0]) : '';
    setEditPrice(priceStr);
    setInitialPrice(priceStr);
    setPriceMixed(prices.size > 1);

    const avail = new Set(selectedDates.map((d) => availability.find((a) => a.avail_date === d)?.is_available ?? true));
    setEditAvailable(avail.size === 1 ? [...avail][0] : true);
    setAvailMixed(avail.size > 1);
    setAvailTouched(false);

    const demand = new Set(selectedDates.map((d) => availability.find((a) => a.avail_date === d)?.is_high_demand ?? false));
    setEditHighDemand(demand.size === 1 ? [...demand][0] : false);
    setDemandMixed(demand.size > 1);
    setDemandTouched(false);

    setEditDialogOpen(true);
  };

  const handleApplyBulk = async () => {
    if (!selectedAptId || selectedDates.length === 0) return;

    const priceChanged = editPrice.trim() !== '' && editPrice !== initialPrice;
    if (priceChanged && (!Number.isFinite(Number(editPrice)) || Number(editPrice) < 0)) {
      toast.error('Inserisci un prezzo valido.');
      return;
    }
    if (!priceChanged && !availTouched && !demandTouched) {
      toast.info('Nessuna modifica da applicare.');
      return;
    }

    setIsApplying(true);
    try {
      if (priceChanged || availTouched || demandTouched) {
        await bulkUpdateCalendar(selectedAptId, selectedDates, {
          ...(priceChanged ? { price: Number(editPrice) } : {}),
          ...(availTouched ? { is_available: editAvailable } : {}),
          ...(demandTouched ? { is_high_demand: editHighDemand } : {}),
        });
      }

      toast.success(`Aggiornati ${selectedDates.length} giorni: modifica confermata dal database.`);
      setEditDialogOpen(false);
      setSelectedDates([]);
      await loadCalendar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Errore durante l'aggiornamento.");
    } finally {
      setIsApplying(false);
    }
  };

  const activeRulesCount = stayRules.filter((r) => r.is_active !== false).length;

  return (
    <div className="space-y-6">
      {!dbConnected && (
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Database non collegato:</strong> mancano <code>VITE_SUPABASE_URL</code> e{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> nella build. Le modifiche a prezzi, disponibilità e regole vengono
            salvate <strong>solo in questo browser</strong> e non compaiono sul sito né su altri dispositivi.
          </p>
        </div>
      )}

      {/* Header & Apartment Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Calendario & Tariffe</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestisci prezzi giornalieri, disponibilità, alta richiesta e regole di soggiorno (minimo notti, costi, sconti).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRulesOpen(true)} className="gap-1.5 text-xs font-semibold">
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            Regole di Soggiorno ({activeRulesCount})
          </Button>
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)} className="gap-1.5 text-xs font-semibold">
            <History className="h-3.5 w-3.5 text-slate-500" />
            Storico Tariffe ({rateHistory.length})
          </Button>
        </div>
      </div>

      {/* Apartment Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-md">
        {apartments.map((apt) => (
          <button
            key={apt.id}
            onClick={() => {
              setSelectedAptId(apt.id);
              setSelectedDates([]);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedAptId === apt.id ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {apt.name}
          </button>
        ))}
      </div>

      {/* Calendar Control Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9" aria-label="Mese precedente">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9" aria-label="Mese successivo">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-bold text-slate-900 capitalize">
            {monthNames[month]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={resetToToday} className="text-xs text-primary font-semibold">
            Oggi
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
          <Button variant="ghost" size="sm" onClick={selectAllMonth} className="text-xs text-slate-600">
            Seleziona tutto il mese
          </Button>
          {selectedDates.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDates([])} className="text-xs text-rose-600">
              Deseleziona ({selectedDates.length})
            </Button>
          )}
          <Button
            size="sm"
            onClick={openBulkEdit}
            disabled={selectedDates.length === 0}
            className="gap-1.5 font-semibold text-xs shadow-sm bg-primary"
          >
            <Save className="h-3.5 w-3.5" />
            Modifica Selezionati ({selectedDates.length})
          </Button>
        </div>
      </div>

      {/* Calendario + pannello eventi/note */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          {/* Notti minime: solo testo informativo, valido sempre */}
          <MinStayNotice
            apartmentId={selectedAptId}
            apartmentName={selectedApt?.name}
            rules={stayRules}
            onChanged={reloadRules}
          />

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400 inline-block" />
              <span>Disponibile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-400 inline-block" />
              <span>Occupato</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Alta Richiesta / Evento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-sky-600" />
              <span>Nota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded ring-2 ring-primary bg-primary/10 inline-block" />
              <span>Selezionato</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mer</div>
              <div>Gio</div>
              <div>Ven</div>
              <div className="text-amber-700">Sab</div>
              <div className="text-rose-700">Dom</div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {calendarCells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className="bg-slate-50/40 min-h-[95px] p-2" />;
                }

                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const isSelected = selectedDates.includes(dateStr);

                const rateObj = rates.find((r) => r.rate_date === dateStr);
                const price = rateObj?.price_per_night ?? selectedApt?.base_price_2p ?? 90;

                const availObj = availability.find((a) => a.avail_date === dateStr);
                const isAvailable = availObj ? availObj.is_available : true;
                const isHighDemand = availObj ? availObj.is_high_demand : false;

                const dayEvents = events.filter((e) => dateStr >= e.start_date && dateStr <= e.end_date);
                const matchingEvent = dayEvents[0];
                const dayNotes = notesByDate.get(dateStr) ?? [];

                return (
                  <div
                    key={dateStr}
                    onClick={() => toggleDateSelection(dateStr)}
                    className={`min-h-[100px] p-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/10 ring-2 ring-inset ring-primary z-10'
                        : isAvailable
                        ? 'bg-emerald-100 hover:bg-emerald-200/80'
                        : 'bg-rose-100 hover:bg-rose-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary text-white shadow-sm'
                            : isAvailable
                            ? 'text-emerald-900'
                            : 'text-rose-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <div className="flex items-center gap-1">
                        {(isHighDemand || matchingEvent?.is_high_demand) && (
                          <span title="Alta Richiesta">
                            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          </span>
                        )}
                        {dayNotes.length > 0 && (
                          <span title={dayNotes.map((n) => n.content).join('\n')}>
                            <StickyNote className="h-3.5 w-3.5 text-sky-600" />
                          </span>
                        )}
                        {!isAvailable && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-200 px-1 py-0.5 rounded">
                            Occupato
                          </span>
                        )}
                      </div>
                    </div>

                    {matchingEvent && (
                      <div
                        className="text-[10px] bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded font-medium truncate mt-1"
                        title={dayEvents.map((e) => e.name).join(' · ')}
                      >
                        {matchingEvent.name}
                        {dayEvents.length > 1 ? ` +${dayEvents.length - 1}` : ''}
                      </div>
                    )}

                    {dayNotes.length > 0 && (
                      <div
                        className="text-[9px] leading-tight text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded truncate mt-1"
                        title={dayNotes.map((n) => n.content).join('\n')}
                      >
                        {dayNotes[0].content}
                        {dayNotes.length > 1 ? ` +${dayNotes.length - 1}` : ''}
                      </div>
                    )}

                    <div className={`mt-2 pt-1 border-t flex items-center justify-between ${isAvailable ? 'border-emerald-200' : 'border-rose-200'}`}>
                      <span className={`text-xs font-extrabold ${isAvailable ? 'text-emerald-950' : 'text-rose-400'}`}>
                        {price} €
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <CalendarSidePanel
          monthStart={monthStart}
          monthEnd={monthEnd}
          monthLabel={`${monthNames[month]} ${year}`}
          apartmentId={selectedAptId}
          apartmentName={selectedApt?.name}
          events={events}
          notes={notes}
          onSelectRange={selectRange}
        />
      </div>

      {/* Bulk Edit Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Modifica {selectedDates.length} Giorni Selezionati</DialogTitle>
            <DialogDescription className="text-xs">
              Per <strong>{selectedApt?.name}</strong>. Vengono salvati solo i campi che modifichi: gli altri restano come sono.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulkPrice" className="text-xs font-semibold">
                Tariffa Giornaliera (€ a notte)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="bulkPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={priceMixed ? 'Prezzi diversi: lascia vuoto per non modificarli' : ''}
                  className="pl-9 h-9"
                />
              </div>
              {priceMixed && (
                <p className="text-[11px] text-amber-700">
                  I giorni selezionati hanno prezzi diversi. Inserisci un valore solo se vuoi impostare lo stesso prezzo su tutti.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div>
                <div className="text-xs font-semibold text-slate-800">Disponibilità Alloggio</div>
                <div className="text-[11px] text-muted-foreground">
                  {availMixed && !availTouched
                    ? 'Valori diversi nella selezione: invariato finché non lo cambi'
                    : 'Se disattivato, le date risulteranno occupate'}
                </div>
              </div>
              <Switch
                checked={editAvailable}
                onCheckedChange={(v) => {
                  setEditAvailable(v);
                  setAvailTouched(true);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <div>
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                  Contrassegno Alta Richiesta
                </div>
                <div className="text-[11px] text-amber-700">
                  {demandMixed && !demandTouched
                    ? 'Valori diversi nella selezione: invariato finché non lo cambi'
                    : 'Evidenzia il periodo per fiere, congressi o eventi speciali'}
                </div>
              </div>
              <Switch
                checked={editHighDemand}
                onCheckedChange={(v) => {
                  setEditHighDemand(v);
                  setDemandTouched(true);
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)} disabled={isApplying}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleApplyBulk} disabled={isApplying} className="gap-1.5 font-semibold">
              <Check className="h-4 w-4" />
              {isApplying ? 'Salvataggio…' : `Applica a ${selectedDates.length} date`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Storico Variazioni Tariffe ({selectedApt?.name})
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registro audit di tutti i cambi tariffa effettuati nell'area amministrativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {rateHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nessuna variazione registrata per questo alloggio. Modificando i prezzi dal calendario comparirà qui lo storico.
              </p>
            ) : (
              rateHistory.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">Data soggiorno: {item.rate_date}</div>
                    <div className="text-[11px] text-slate-500">
                      Modificato il {new Date(item.changed_at).toLocaleString('it-IT')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 line-through mr-2">{item.old_price ?? '—'} €</span>
                    <span className="font-extrabold text-emerald-600">{item.new_price} €</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Regole di soggiorno */}
      <StayRulesDialog
        open={rulesOpen}
        onOpenChange={setRulesOpen}
        rules={stayRules}
        apartments={apartments}
        onChanged={reloadRules}
      />
    </div>
  );
};
