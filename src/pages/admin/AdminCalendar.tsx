import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  X,
  History,
  Save,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  getMinStayRules,
  createMinStayRule,
  deleteMinStayRule,
} from '@/lib/admin-api';
import {
  Apartment,
  DailyRate,
  Availability,
  RateHistory,
  EventItem,
  MinStayRule,
} from '@/types/database';

export const AdminCalendar: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [rates, setRates] = useState<DailyRate[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [minStayRules, setMinStayRules] = useState<MinStayRule[]>([]);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Range selection & bulk edit
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<number>(90);
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editHighDemand, setEditHighDemand] = useState<boolean>(false);
  const [editMinStayNights, setEditMinStayNights] = useState<number>(2);
  const [isApplying, setIsApplying] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      const apts = await getApartments();
      setApartments(apts);
      const evts = await getEvents();
      setEvents(evts);
      const rules = await getMinStayRules();
      setMinStayRules(rules);

      const aptFromUrl = searchParams.get('apartment');
      if (aptFromUrl && apts.some((a) => a.id === aptFromUrl)) {
        setSelectedAptId(aptFromUrl);
      } else if (apts.length > 0) {
        setSelectedAptId(apts[0].id);
      }
    }
    init();
  }, [searchParams]);

  // Load calendar when apartment or month changes
  useEffect(() => {
    if (!selectedAptId) return;

    async function loadCal() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = lastDay.toISOString().split('T')[0];

      const data = await getCalendarData(selectedAptId, startStr, endStr);
      setRates(data.rates);
      setAvailability(data.availability);

      const hist = await getRateHistory(selectedAptId);
      setRateHistory(hist);
    }

    loadCal();
  }, [selectedAptId, currentDate]);

  const selectedApt = apartments.find((a) => a.id === selectedAptId);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDates([]);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDates([]);
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
    setSelectedDates([]);
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Italian day indexing: Lunedì = 0, Domenica = 6
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const totalDays = lastDayOfMonth.getDate();
  const calendarCells = [];

  // Blank cells before month starts
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push(dStr);
  }

  // Toggle selection
  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const selectAllMonth = () => {
    const all = [];
    for (let d = 1; d <= totalDays; d++) {
      all.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    setSelectedDates(all);
  };

  const openBulkEdit = () => {
    if (selectedDates.length === 0) {
      toast.warning('Seleziona almeno un giorno sul calendario da modificare.');
      return;
    }
    // Set default price from apartment base price
    setEditPrice(selectedApt?.base_price_2p || 90);
    setEditDialogOpen(true);
  };

  const handleApplyBulk = async () => {
    if (!selectedAptId || selectedDates.length === 0) return;
    setIsApplying(true);
    try {
      await bulkUpdateCalendar(selectedAptId, selectedDates, {
        price: editPrice,
        is_available: editAvailable,
        is_high_demand: editHighDemand,
      });

      // Se specificato soggiorno minimo diverso dal default
      if (editMinStayNights > 2 && selectedDates.length > 1) {
        const sorted = [...selectedDates].sort();
        await createMinStayRule({
          apartment_id: selectedAptId,
          min_nights: editMinStayNights,
          start_date: sorted[0],
          end_date: sorted[sorted.length - 1],
          priority: 5,
          description: `Regola periodo personalizzato (${sorted[0]} → ${sorted[sorted.length - 1]})`,
        });
        const updatedRules = await getMinStayRules();
        setMinStayRules(updatedRules);
      }

      toast.success(`Aggiornati ${selectedDates.length} giorni con successo!`);
      setEditDialogOpen(false);
      setSelectedDates([]);

      // Reload calendar data
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const data = await getCalendarData(selectedAptId, firstDay, lastDay);
      setRates(data.rates);
      setAvailability(data.availability);
      const hist = await getRateHistory(selectedAptId);
      setRateHistory(hist);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante l\'aggiornamento.';
      toast.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Apartment Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Calendario & Tariffe
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestisci prezzi giornalieri, disponibilità, alta richiesta e regole soggiorno minimo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRulesOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            Regole Soggiorno Minimo ({minStayRules.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
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
              selectedAptId === apt.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {apt.name}
          </button>
        ))}
      </div>

      {/* Calendar Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9">
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

        {/* Selection & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300 inline-block" />
          <span>Disponibile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-300 inline-block" />
          <span>Non disponibile / Chiuso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300 inline-block" />
          <span>Alta Richiesta (Fiere/Eventi)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded ring-2 ring-primary bg-primary/10 inline-block" />
          <span>Giorno Selezionato</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Gio</div>
          <div>Ven</div>
          <div className="text-amber-700">Sab</div>
          <div className="text-rose-700">Dom</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {calendarCells.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="bg-slate-50/40 min-h-[95px] p-2" />;
            }

            const dayNum = parseInt(dateStr.split('-')[2], 10);
            const isSelected = selectedDates.includes(dateStr);

            // Rate for this date
            const rateObj = rates.find((r) => r.rate_date === dateStr);
            const price = rateObj?.price_per_night ?? selectedApt?.base_price_2p ?? 90;

            // Availability
            const availObj = availability.find((a) => a.avail_date === dateStr);
            const isAvailable = availObj ? availObj.is_available : true;
            const isHighDemand = availObj ? availObj.is_high_demand : false;

            // Event on this date
            const matchingEvent = events.find((e) => dateStr >= e.start_date && dateStr <= e.end_date);

            // Min stay
            const minStayRule = minStayRules.find(
              (r) =>
                (!r.apartment_id || r.apartment_id === selectedAptId) &&
                (!r.start_date || (dateStr >= r.start_date && dateStr <= (r.end_date || '9999-99-99')))
            );

            return (
              <div
                key={dateStr}
                onClick={() => toggleDateSelection(dateStr)}
                className={`min-h-[100px] p-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/10 ring-2 ring-inset ring-primary z-10'
                    : isAvailable
                    ? isHighDemand || matchingEvent
                      ? 'bg-amber-50/70 hover:bg-amber-100/60'
                      : 'bg-white hover:bg-slate-50'
                    : 'bg-rose-50/80 hover:bg-rose-100/70'
                }`}
              >
                {/* Day Header: Number + Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : isAvailable
                        ? 'text-slate-800'
                        : 'text-rose-700 line-through'
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
                    {!isAvailable && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-1 py-0.5 rounded">
                        Chiuso
                      </span>
                    )}
                  </div>
                </div>

                {/* Event tag if active */}
                {matchingEvent && (
                  <div className="text-[10px] bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded font-medium truncate mt-1">
                    {matchingEvent.name}
                  </div>
                )}

                {/* Bottom: Price + Min Stay */}
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${isAvailable ? 'text-slate-900' : 'text-slate-400'}`}>
                    {price} €
                  </span>
                  {minStayRule && minStayRule.min_nights > 1 && (
                    <span className="text-[9px] text-slate-500 font-medium">
                      min {minStayRule.min_nights}n
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Modifica {selectedDates.length} Giorni Selezionati
            </DialogTitle>
            <DialogDescription className="text-xs">
              Applica variazioni contemporanee a tutte le date selezionate per <strong>{selectedApt?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="bulkPrice" className="text-xs font-semibold">
                Tariffa Giornaliera (€ a notte)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="bulkPrice"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Availability Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div>
                <div className="text-xs font-semibold text-slate-800">Disponibilità Alloggio</div>
                <div className="text-[11px] text-muted-foreground">
                  Se disattivato, le date appariranno occupate o bloccate
                </div>
              </div>
              <Switch checked={editAvailable} onCheckedChange={setEditAvailable} />
            </div>

            {/* High Demand Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <div>
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                  Contrassegno Alta Richiesta
                </div>
                <div className="text-[11px] text-amber-700">
                  Evidenzia il periodo per fiere, congressi o eventi speciali
                </div>
              </div>
              <Switch checked={editHighDemand} onCheckedChange={setEditHighDemand} />
            </div>

            {/* Min Stay Rule for period */}
            <div className="space-y-1.5">
              <Label htmlFor="bulkMinStay" className="text-xs font-semibold">
                Soggiorno Minimo per questo periodo (notti)
              </Label>
              <Input
                id="bulkMinStay"
                type="number"
                min={1}
                max={30}
                value={editMinStayNights}
                onChange={(e) => setEditMinStayNights(Number(e.target.value))}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)} disabled={isApplying}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleApplyBulk} disabled={isApplying} className="gap-1.5 font-semibold">
              <Check className="h-4 w-4" />
              Applica a {selectedDates.length} date
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

      {/* Min Stay Rules Dialog */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Regole Soggiorno Minimo
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configura i vincoli minimi di notti per periodo o generali.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {minStayRules.map((rule) => (
              <div key={rule.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-800">{rule.description || 'Regola soggiorno'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {rule.start_date && rule.end_date ? (
                      <span>Periodo: {rule.start_date} → {rule.end_date}</span>
                    ) : (
                      <span>Regola Predefinita globale</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-[10px]">{rule.min_nights} notti min.</Badge>
                  {rule.start_date && (
                    <button
                      onClick={async () => {
                        await deleteMinStayRule(rule.id);
                        setMinStayRules(await getMinStayRules());
                        toast.success('Regola eliminata');
                      }}
                      className="text-slate-400 hover:text-rose-600 text-xs ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
