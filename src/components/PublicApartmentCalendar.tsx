import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Apartment, Availability, DailyRate, MinStayRule, RateTier } from '@/types/database';
import { calculateStayQuote } from '@/lib/pricing-calculator';
import { getMinNightsForStay } from '@/lib/stay-rules';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MONTHS_IT = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const formatIt = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Calcola il prezzo di un singolo giorno per il numero di ospiti scelto,
 * rispettando in ordine:
 * 1) Scaglione tariffario assegnato al giorno (2p / 3p / 4p)
 * 2) Prezzo manuale del giorno (adattato per 3p / 4p in base alla differenza tariffa standard)
 * 3) Tariffa standard dell'appartamento (base_price_2p / 3p / 4p)
 */
export function getPublicDayPrice(
  apartment: Apartment,
  dateIso: string,
  guests: number,
  ratesByDate: Map<string, DailyRate>,
  tiersById: Map<string, RateTier>
): { price: number; tier: RateTier | undefined } {
  const rate = ratesByDate.get(dateIso);
  const tier = rate?.tier_id ? tiersById.get(rate.tier_id) : undefined;

  if (tier) {
    const price =
      guests >= 4 ? Number(tier.price_4p) : guests === 3 ? Number(tier.price_3p) : Number(tier.price_2p);
    return { price, tier };
  }

  const b2 = Number(apartment.base_price_2p);
  const b3 = Number(apartment.base_price_3p);
  const b4 = Number(apartment.base_price_4p);

  if (rate) {
    const base2 = Number(rate.price_per_night);
    const diff = guests >= 4 ? Math.max(0, b4 - b2) : guests === 3 ? Math.max(0, b3 - b2) : 0;
    return { price: base2 + diff, tier: undefined };
  }

  const std = guests >= 4 ? b4 : guests === 3 ? b3 : b2;
  return { price: std, tier: undefined };
}

interface PublicApartmentCalendarProps {
  apartment: Apartment;
  dailyRates: DailyRate[];
  availability: Availability[];
  stayRules: MinStayRule[];
  rateTiers: RateTier[];
  extras?: string[];
}

export const PublicApartmentCalendar: React.FC<PublicApartmentCalendarProps> = ({
  apartment,
  dailyRates,
  availability,
  stayRules,
  rateTiers,
  extras = ['Nessun costo pulizie', 'Notte regalo per chi si ospedalizza'],
}) => {
  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIso(now.getFullYear(), now.getMonth(), now.getDate()), [now]);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [guests, setGuests] = useState<number>(2);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const maxGuests = Math.max(3, Math.min(4, apartment.max_guests || 4));
  const guestOptions = useMemo(
    () => [2, 3, ...(maxGuests >= 4 ? [4] : [])],
    [maxGuests]
  );

  const ratesByDate = useMemo(
    () => new Map(dailyRates.filter((r) => r.apartment_id === apartment.id).map((r) => [r.rate_date, r])),
    [dailyRates, apartment.id]
  );

  const availByDate = useMemo(
    () => new Map(availability.filter((a) => a.apartment_id === apartment.id).map((a) => [a.avail_date, a])),
    [availability, apartment.id]
  );

  const tiersById = useMemo(
    () => new Map(rateTiers.filter((t) => t.apartment_id === apartment.id).map((t) => [t.id, t])),
    [rateTiers, apartment.id]
  );

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Lunedì = 0
    const cells: Array<{
      dateIso: string;
      day: number;
      isPast: boolean;
      isAvailable: boolean;
      isHighDemand: boolean;
      price: number;
      tier?: RateTier;
    } | null> = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateIso = toIso(viewYear, viewMonth, d);
      const avail = availByDate.get(dateIso);
      const isAvailable = avail ? avail.is_available : true;
      const isHighDemand = avail ? avail.is_high_demand : false;
      const isPast = dateIso < todayIso;
      const { price, tier } = getPublicDayPrice(apartment, dateIso, guests, ratesByDate, tiersById);
      cells.push({ dateIso, day: d, isPast, isAvailable, isHighDemand, price, tier });
    }
    return cells;
  }, [viewYear, viewMonth, availByDate, todayIso, apartment, guests, ratesByDate, tiersById]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateIso: string, isPast: boolean, isAvailable: boolean) => {
    if (isPast) return;
    if (!checkIn || (checkIn && checkOut)) {
      if (!isAvailable) return;
      setCheckIn(dateIso);
      setCheckOut(null);
      return;
    }
    if (dateIso <= checkIn) {
      if (!isAvailable) return;
      setCheckIn(dateIso);
      setCheckOut(null);
      return;
    }
    setCheckOut(dateIso);
  };

  const quote = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const aptRates = dailyRates.filter((r) => r.apartment_id === apartment.id);
    const aptAvail = availability.filter((a) => a.apartment_id === apartment.id);
    const aptTiers = rateTiers.filter((t) => t.apartment_id === apartment.id);
    return calculateStayQuote({
      apartment: { ...apartment, extra_guest_supplement: 0 },
      checkIn,
      checkOut,
      guests,
      dailyRates: aptRates.map((r) => {
        if (r.tier_id) return r;
        const { price } = getPublicDayPrice(apartment, r.rate_date, guests, ratesByDate, tiersById);
        return { ...r, price_per_night: price };
      }),
      availability: aptAvail,
      minStayRules: stayRules,
      rateTiers: aptTiers,
    });
  }, [checkIn, checkOut, dailyRates, availability, rateTiers, apartment, guests, stayRules, ratesByDate, tiersById]);

  const minNightsDefault = useMemo(
    () => getMinNightsForStay(stayRules, apartment.id, [todayIso]),
    [stayRules, apartment.id, todayIso]
  );

  const whatsappHref = useMemo(() => {
    const base = 'https://wa.me/393457956159';
    if (checkIn && checkOut && quote) {
      const text = `Ciao Gabriele, vorrei richiedere disponibilità per *${apartment.name}* dal ${formatIt(
        checkIn
      )} al ${formatIt(checkOut)} (${quote.totalNights} notti) per ${guests} persone. Preventivo stimato dal sito: € ${quote.grandTotal.toFixed(
        0
      )}.`;
      return `${base}?text=${encodeURIComponent(text)}`;
    }
    const text = `Ciao Gabriele, vorrei richiedere disponibilità e informazioni per l'alloggio *${apartment.name}* (${guests} persone).`;
    return `${base}?text=${encodeURIComponent(text)}`;
  }, [apartment.name, checkIn, checkOut, quote, guests]);

  return (
    <div className="flex flex-col justify-between h-full bg-muted/30 rounded-2xl p-4 sm:p-5 border border-border/70">
      <div className="space-y-4">
        {/* Intestazione: Titolo + Selettore Ospiti */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="font-display text-primary text-base sm:text-lg flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              Calendario Disponibilità & Prezzi
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              Seleziona il numero di ospiti e clicca le date di Check-in e Check-out
            </p>
          </div>

          {/* Selettore 2 / 3 / 4 persone */}
          <div className="inline-flex items-center bg-background rounded-full p-1 border border-border shadow-sm self-start sm:self-auto">
            {guestOptions.map((g) => {
              const active = guests === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGuests(g)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {g} Pers.
                </button>
              );
            })}
          </div>
        </div>

        {/* Pillole vantaggi (Nessun costo pulizie / Notte regalo / Prezzi base) */}
        <div className="flex flex-wrap items-center gap-2">
          {extras.map((e) => (
            <span
              key={e}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-accent/70 text-primary px-2.5 py-1 rounded-full border border-primary/15"
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              {e}
            </span>
          ))}
          <span className="inline-flex items-center text-[11px] text-muted-foreground bg-background px-2.5 py-1 rounded-full border border-border/60">
            Soggiorno min. {minNightsDefault} notti
          </span>
        </div>

        {/* Controlli Mese */}
        <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2 border border-border/60">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mese precedente"
            className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display text-primary text-sm sm:text-base font-bold">
              {MONTHS_IT[viewMonth]} {viewYear}
            </span>
            {(viewYear !== now.getFullYear() || viewMonth !== now.getMonth()) && (
              <button
                type="button"
                onClick={() => {
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                }}
                className="text-[11px] font-semibold text-primary underline hover:no-underline"
              >
                Oggi
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mese successivo"
            className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Griglia Calendario */}
        <div className="bg-background rounded-xl border border-border/70 overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-muted/60 border-b border-border/60">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-1.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                  idx >= 5 ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border/40">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="bg-muted/20 min-h-[48px] sm:min-h-[54px]" />;
              }

              const isStart = checkIn === cell.dateIso;
              const isEnd = checkOut === cell.dateIso;
              const inRange =
                Boolean(checkIn && checkOut && cell.dateIso > checkIn && cell.dateIso < checkOut);
              const isSelected = isStart || isEnd;

              let cellStyle = 'bg-background hover:bg-emerald-50/70 text-foreground cursor-pointer';
              if (cell.isPast) {
                cellStyle = 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed';
              } else if (!cell.isAvailable && !isEnd) {
                cellStyle = 'bg-rose-50/80 text-rose-400 cursor-not-allowed';
              } else if (isSelected) {
                cellStyle = 'bg-primary text-primary-foreground font-bold shadow-inner cursor-pointer';
              } else if (inRange) {
                cellStyle = 'bg-emerald-100/80 text-emerald-950 font-semibold cursor-pointer';
              } else if (cell.isAvailable) {
                cellStyle = 'bg-emerald-50/40 hover:bg-emerald-100/60 text-foreground cursor-pointer';
              }

              return (
                <button
                  key={cell.dateIso}
                  type="button"
                  disabled={cell.isPast || (!cell.isAvailable && !checkIn)}
                  onClick={() => handleDayClick(cell.dateIso, cell.isPast, cell.isAvailable)}
                  className={`relative min-h-[48px] sm:min-h-[54px] p-1 flex flex-col items-center justify-between transition-colors ${cellStyle}`}
                  title={
                    cell.isPast
                      ? 'Data passata'
                      : !cell.isAvailable
                      ? 'Occupato'
                      : `${formatIt(cell.dateIso)}: ${cell.price}€ a notte (${guests} pers.)`
                  }
                >
                  <div className="w-full flex items-center justify-between px-0.5">
                    <span
                      className={`text-[11px] sm:text-xs leading-none ${
                        cell.dateIso === todayIso && !isSelected
                          ? 'font-extrabold text-primary underline'
                          : 'font-medium'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.tier && cell.isAvailable && !cell.isPast && !isSelected && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cell.tier.color }}
                        title={`Fascia ${cell.tier.name}`}
                      />
                    )}
                  </div>

                  {cell.isPast ? (
                    <span className="text-[9px] text-muted-foreground/40">—</span>
                  ) : !cell.isAvailable ? (
                    <span className="text-[9px] sm:text-[10px] font-semibold text-rose-500 leading-tight">
                      Occupato
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                        isSelected ? 'text-primary-foreground' : 'text-emerald-800'
                      }`}
                    >
                      {cell.price}€
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legenda rapida */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground px-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400" />
              Disponibile (prezzo per {guests} pers.)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300" />
              Occupato
            </span>
          </div>
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={() => {
                setCheckIn(null);
                setCheckOut(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Azzera date
            </button>
          )}
        </div>

        {/* Box Preventivo se l'utente ha selezionato date */}
        {checkIn && !checkOut && (
          <div className="rounded-xl bg-accent/60 border border-primary/20 px-3.5 py-2.5 text-xs text-primary flex items-center justify-between">
            <span>
              Check-in selezionato: <strong>{formatIt(checkIn)}</strong> — clicca ora la data di{' '}
              <strong>Check-out</strong>
            </span>
          </div>
        )}

        {checkIn && checkOut && quote && (
          <div
            className={`rounded-xl px-3.5 py-3 border text-xs space-y-1.5 ${
              quote.isValid
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                {quote.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                {formatIt(checkIn)} → {formatIt(checkOut)} ({quote.totalNights}{' '}
                {quote.totalNights === 1 ? 'notte' : 'notti'}, {guests} pers.)
              </span>
              <span className="text-sm sm:text-base font-extrabold text-primary">
                Totale: {quote.grandTotal.toFixed(0)}€
              </span>
            </div>
            {quote.discount && (
              <p className="text-[11px] text-emerald-700 font-medium">
                Sconto applicato ({quote.discount.label}): -{quote.discount.amount.toFixed(0)}€
              </p>
            )}
            {!quote.isValid && (
              <p className="text-[11px] text-amber-800">{quote.validationErrors.join(' ')}</p>
            )}
          </div>
        )}
      </div>

      {/* Sotto il calendario: Pulsante Richiedi disponibilità */}
      <div className="pt-4 mt-4 border-t border-border/60 flex justify-center">
        <Button asChild className="rounded-full px-8 w-full sm:w-auto shadow-sm">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-track-label="alloggi_richiedi_disponibilita"
            data-track-apartment={apartment.name}
          >
            {checkIn && checkOut && quote
              ? `Richiedi disponibilità (${formatIt(checkIn)} - ${formatIt(checkOut)})`
              : 'Richiedi disponibilità'}
          </a>
        </Button>
      </div>
    </div>
  );
};
