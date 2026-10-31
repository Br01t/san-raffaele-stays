import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Percent,
  Send,
  Phone,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Apartment, Availability, DailyRate, MinStayRule, RateTier } from '@/types/database';
import { calculateStayQuote } from '@/lib/pricing-calculator';
import { getPublicDayPrice } from '@/components/PublicApartmentCalendar';
import {
  getActiveDiscountTiersForApartment,
  getMinNightsForStay,
  getNextDiscountTierHint,
} from '@/lib/stay-rules';

interface PublicQuoteCalculatorProps {
  apartments: Apartment[];
  selectedApartmentSlug: string;
  onSelectApartmentSlug: (slug: string) => void;
  externalCheckIn?: string | null;
  externalCheckOut?: string | null;
  externalGuests?: 2 | 3 | 4;
  dailyRates: DailyRate[];
  availability: Availability[];
  stayRules: MinStayRule[];
  rateTiers: RateTier[];
}

function addDaysIso(isoDate: string, daysToAdd: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + daysToAdd));
  return dt.toISOString().slice(0, 10);
}

function formatIt(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export const PublicQuoteCalculator: React.FC<PublicQuoteCalculatorProps> = ({
  apartments,
  selectedApartmentSlug,
  onSelectApartmentSlug,
  externalCheckIn,
  externalCheckOut,
  externalGuests,
  dailyRates,
  availability,
  stayRules,
  rateTiers,
}) => {
  const todayIso = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(
      t.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const defaultCheckIn = useMemo(() => addDaysIso(todayIso, 1), [todayIso]);
  const defaultCheckOut = useMemo(() => addDaysIso(defaultCheckIn, 10), [defaultCheckIn]);

  const [checkIn, setCheckIn] = useState<string>(externalCheckIn || defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(externalCheckOut || defaultCheckOut);
  const [guests, setGuests] = useState<2 | 3 | 4>(externalGuests || 2);

  useEffect(() => {
    if (externalCheckIn) setCheckIn(externalCheckIn);
    if (externalCheckOut) setCheckOut(externalCheckOut);
    else if (externalCheckIn) setCheckOut(addDaysIso(externalCheckIn, 10));
  }, [externalCheckIn, externalCheckOut]);

  useEffect(() => {
    if (externalGuests) setGuests(externalGuests);
  }, [externalGuests]);

  const selectedApartment = useMemo(() => {
    return (
      apartments.find(
        (a) =>
          a.slug === selectedApartmentSlug ||
          a.name.toLowerCase().replace(/\s+/g, '-') === selectedApartmentSlug
      ) ?? apartments[0]
    );
  }, [apartments, selectedApartmentSlug]);

  const maxGuests = Math.min(Math.max(selectedApartment?.max_guests || 4, 2), 4);
  const guestOptions: (2 | 3 | 4)[] = maxGuests >= 4 ? [2, 3, 4] : [2, 3];

  useEffect(() => {
    if (guests > maxGuests) {
      setGuests(maxGuests as 2 | 3 | 4);
    }
  }, [guests, maxGuests]);

  const ratesByDate = useMemo(() => {
    const map = new Map<string, DailyRate>();
    if (!selectedApartment) return map;
    for (const r of dailyRates) {
      if (r.apartment_id === selectedApartment.id) {
        map.set(r.rate_date, r);
      }
    }
    return map;
  }, [dailyRates, selectedApartment]);

  const tiersById = useMemo(() => {
    const map = new Map<string, RateTier>();
    if (!selectedApartment) return map;
    for (const t of rateTiers) {
      if (t.apartment_id === selectedApartment.id) {
        map.set(t.id, t);
      }
    }
    return map;
  }, [rateTiers, selectedApartment]);

  const activeDiscountTiers = useMemo(() => {
    if (!selectedApartment) return [];
    return getActiveDiscountTiersForApartment(stayRules, selectedApartment.id);
  }, [stayRules, selectedApartment]);

  const quote = useMemo(() => {
    if (!selectedApartment || !checkIn || !checkOut || checkOut <= checkIn) return null;
    const aptRates = dailyRates.filter((r) => r.apartment_id === selectedApartment.id);
    const aptAvail = availability.filter((a) => a.apartment_id === selectedApartment.id);
    const aptTiers = rateTiers.filter((t) => t.apartment_id === selectedApartment.id);

    return calculateStayQuote({
      apartment: { ...selectedApartment, extra_guest_supplement: 0 },
      checkIn,
      checkOut,
      guests,
      dailyRates: aptRates.map((r) => {
        if (r.tier_id) return r;
        const { price } = getPublicDayPrice(
          selectedApartment,
          r.rate_date,
          guests,
          ratesByDate,
          tiersById
        );
        return { ...r, price_per_night: price };
      }),
      availability: aptAvail,
      minStayRules: stayRules,
      rateTiers: aptTiers,
    });
  }, [
    selectedApartment,
    checkIn,
    checkOut,
    guests,
    dailyRates,
    availability,
    rateTiers,
    stayRules,
    ratesByDate,
    tiersById,
  ]);

  const nextDiscountHint = useMemo(() => {
    if (!selectedApartment || !quote) return null;
    const stayDates = quote.dailyBreakdown.map((d) => d.date);
    return getNextDiscountTierHint(stayRules, selectedApartment.id, stayDates);
  }, [selectedApartment, quote, stayRules]);

  const minNightsDefault = useMemo(() => {
    if (!selectedApartment) return 2;
    return getMinNightsForStay(stayRules, selectedApartment.id, [checkIn || todayIso]);
  }, [stayRules, selectedApartment, checkIn, todayIso]);

  const applyQuickDuration = (nights: number) => {
    const start = checkIn && checkIn >= todayIso ? checkIn : defaultCheckIn;
    setCheckIn(start);
    setCheckOut(addDaysIso(start, nights));
  };

  const whatsappQuoteHref = useMemo(() => {
    const base = 'https://wa.me/393457956159';
    if (!selectedApartment) return base;
    if (checkIn && checkOut && quote && quote.totalNights > 0) {
      const discountPart = quote.discount
        ? ` (Prezzo base € ${quote.nightsTotal.toFixed(0)} - Sconto ${
            quote.discount.badgeText || quote.discount.label
          }: -€ ${quote.discount.amount.toFixed(0)})`
        : '';
      const text = `Ciao Gabriele, ho calcolato un preventivo sul sito per *${selectedApartment.name}*:\n• Check-in: ${formatIt(
        checkIn
      )}\n• Check-out: ${formatIt(checkOut)} (${quote.totalNights} notti)\n• Ospiti: ${guests} persone\n• Totale preventivo: *€ ${quote.grandTotal.toFixed(
        0
      )}*${discountPart}\n\nVorrei verificare la disponibilità e confermare la richiesta.`;
      return `${base}?text=${encodeURIComponent(text)}`;
    }
    const text = `Ciao Gabriele, vorrei richiedere un preventivo per *${selectedApartment.name}* (${guests} persone).`;
    return `${base}?text=${encodeURIComponent(text)}`;
  }, [selectedApartment, checkIn, checkOut, quote, guests]);

  if (!selectedApartment) return null;

  return (
    <div
      id="calcolatore-preventivo"
      className="scroll-mt-24 bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-teal-500/40 ring-1 ring-cyan-500/25 shadow-[0_0_40px_-6px_rgba(20,184,166,0.26)]"
    >
      {/* Intestazione Calcolatore */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/70">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            Preventivatore Automatico & Sconti
          </div>
          <h2 className="font-display text-primary text-2xl sm:text-3xl leading-tight">
            Calcola il tuo Preventivo Personalizzato
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl">
            Seleziona l'alloggio, le date e il numero di persone: il sistema analizza in tempo reale il calendario dei prezzi e applica automaticamente gli <strong>sconti per soggiorni prolungati</strong>.
          </p>
        </div>

        {/* Fasce di Sconto Attive */}
        {activeDiscountTiers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3 sm:px-4">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs sm:text-sm">
              <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sconti attivi:</span>
            </div>
            {activeDiscountTiers.map((tier) => {
              const val =
                tier.amount_type === 'fixed'
                  ? `-${Number(tier.amount)}€`
                  : `-${Number(tier.amount)}%`;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => tier.threshold_nights && applyQuickDuration(tier.threshold_nights)}
                  className="inline-flex items-center gap-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Clicca per simulare subito questo soggiorno"
                >
                  <Percent className="w-3 h-3 text-emerald-600" />
                  {tier.threshold_nights ? `Da ${tier.threshold_nights} notti: ` : ''}
                  <span className="text-emerald-700">{val}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Griglia Principale: Sinistra (Parametri scelta) | Destra (Risultato Preventivo e Sconto) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Colonna Sinistra (7 col): Scelta Alloggio, Date, Ospiti */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5 bg-muted/30 rounded-2xl p-4 sm:p-6 border border-border/60">
          <div className="space-y-5">
            {/* 1. Scelta Alloggio */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                1. Scegli l'Appartamento
              </Label>
              <div className="grid grid-cols-3 gap-2.5">
                {apartments.map((apt) => {
                  const slug = apt.slug || apt.name.toLowerCase().replace(/\s+/g, '-');
                  const isSelected = selectedApartment.id === apt.id;
                  return (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => onSelectApartmentSlug(slug)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                          : 'bg-background hover:bg-accent/60 text-foreground border-border/80'
                      }`}
                    >
                      <div className="font-display font-bold text-sm sm:text-base leading-tight">
                        {apt.name}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground'
                        }`}
                      >
                        Max {apt.max_guests} ospiti
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Scelta Date Check-in e Check-out */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  2. Inserisci le Date del Soggiorno
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Soggiorno minimo: <strong>{minNightsDefault} notti</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="calc-checkin" className="text-xs text-muted-foreground">
                    Data Check-in (Arrivo)
                  </Label>
                  <Input
                    id="calc-checkin"
                    type="date"
                    min={todayIso}
                    value={checkIn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCheckIn(val);
                      if (checkOut && val >= checkOut) {
                        setCheckOut(addDaysIso(val, Math.max(minNightsDefault, 2)));
                      }
                    }}
                    className="bg-background h-11 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="calc-checkout" className="text-xs text-muted-foreground">
                    Data Check-out (Partenza)
                  </Label>
                  <Input
                    id="calc-checkout"
                    type="date"
                    min={checkIn ? addDaysIso(checkIn, 1) : todayIso}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-background h-11 font-medium"
                  />
                </div>
              </div>

              {/* Bottoni rapidi per durata soggiorno */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Durata rapida:</span>
                {[
                  { nights: 5, label: '5 notti' },
                  { nights: 7, label: '7 notti' },
                  { nights: 10, label: '10 notti (Con Sconto)' },
                  { nights: 14, label: '14 notti' },
                ].map((preset) => {
                  const isCurrent = quote?.totalNights === preset.nights;
                  return (
                    <button
                      key={preset.nights}
                      type="button"
                      onClick={() => applyQuickDuration(preset.nights)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent text-foreground border-border'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Scelta Numero Ospiti */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                3. Numero di Persone che alloggeranno
              </Label>
              <div
                className={`grid ${
                  guestOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
                } gap-2.5`}
              >
                {guestOptions.map((g) => {
                  const active = guests === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuests(g)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background hover:bg-accent/60 text-foreground border-border/80'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      {g} Persone
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Nessun costo di pulizia finale
            </span>
            <span>Prezzi reali dal calendario di {selectedApartment.name}</span>
          </div>
        </div>

        {/* Colonna Destra (5 col): Risultato Preventivo, Box Sconto e Invio Richiesta */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-accent/35 rounded-2xl p-5 sm:p-6 border border-primary/20 shadow-xs">
          {quote && quote.totalNights > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Riepilogo Preventivo
                  </span>
                  <h3 className="font-display text-primary text-xl font-bold">
                    {selectedApartment.name} · {quote.totalNights}{' '}
                    {quote.totalNights === 1 ? 'notte' : 'notti'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-full text-xs font-semibold border border-border">
                    <Users className="w-3.5 h-3.5 text-primary" /> {guests} pers.
                  </span>
                </div>
              </div>

              {/* Box SCONTO APPLICATO se l'utente ha diritto allo sconto */}
              {quote.discount ? (
                <div
                  data-testid="quote-discount-banner"
                  className="rounded-xl bg-emerald-500/15 border-2 border-emerald-500/50 p-3.5 text-emerald-950 space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-sm sm:text-base text-emerald-900 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      Hai diritto a uno sconto del {quote.discount.badgeText || quote.discount.label}!
                    </span>
                    <span className="bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                      -{quote.discount.amount.toFixed(0)}€
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Sconto automatico applicato sul preventivo per soggiorni di{' '}
                    <strong>{quote.totalNights} notti</strong> ({quote.discount.label}).
                  </p>
                </div>
              ) : (
                nextDiscountHint && (
                  <div className="rounded-xl bg-amber-50/90 border border-amber-300/80 p-3 text-amber-950 space-y-2">
                    <div className="text-xs leading-relaxed">
                      💡 <strong>Vuoi risparmiare sul preventivo?</strong> Con almeno{' '}
                      <strong>{nextDiscountHint.thresholdNights} notti</strong> hai diritto a uno{' '}
                      <strong>sconto del {nextDiscountHint.discountLabel}</strong> (ti mancano solo{' '}
                      {nextDiscountHint.missingNights}{' '}
                      {nextDiscountHint.missingNights === 1 ? 'notte' : 'notti'}!).
                    </div>
                    <button
                      type="button"
                      onClick={() => applyQuickDuration(nextDiscountHint.thresholdNights)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Calcola con {nextDiscountHint.thresholdNights} notti e applica lo sconto{' '}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              )}

              {/* Voci di costo */}
              <div className="space-y-2.5 text-xs sm:text-sm pt-1">
                <div className="flex items-center justify-between text-foreground/90">
                  <span>
                    Soggiorno ({formatIt(checkIn)} → {formatIt(checkOut)})
                  </span>
                  <span className="font-semibold">{quote.nightsTotal.toFixed(0)} €</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tariffa media per {guests} persone</span>
                  <span>
                    {(quote.nightsTotal / Math.max(quote.totalNights, 1)).toFixed(0)} € / notte
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>Costi di pulizia finale</span>
                  <span>0 € (Gratuiti)</span>
                </div>

                {quote.discount && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold pt-1 border-t border-border/50">
                    <span>
                      Sconto applicato ({quote.discount.label}{' '}
                      {quote.discount.badgeText ? `· -${quote.discount.badgeText}` : ''})
                    </span>
                    <span>-{quote.discount.amount.toFixed(0)} €</span>
                  </div>
                )}
              </div>

              {/* Totale Finale */}
              <div className="rounded-xl bg-background p-4 border border-primary/25 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Totale Preventivo
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Tutto incluso · Nessuna commissione
                  </div>
                </div>
                <div className="text-right">
                  {quote.discount && (
                    <div className="text-xs text-muted-foreground line-through">
                      {quote.nightsTotal.toFixed(0)} €
                    </div>
                  )}
                  <div
                    data-testid="quote-grand-total"
                    className="font-display text-2xl sm:text-3xl font-extrabold text-primary leading-none"
                  >
                    {quote.grandTotal.toFixed(0)} €
                  </div>
                </div>
              </div>

              {/* Stato disponibilità / validazione */}
              {quote.isValid ? (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Tutte le <strong>{quote.totalNights} notti</strong> selezionate risultano{' '}
                    <strong>disponibili</strong>!
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{quote.validationErrors.join(' ')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Seleziona una data di Check-in e Check-out valida per visualizzare il preventivo.
            </div>
          )}

          {/* Azioni: Invia richiesta con preventivo */}
          <div className="pt-4 mt-4 border-t border-border/70 space-y-2.5">
            <Button asChild size="lg" className="w-full rounded-full font-bold gap-2 shadow-sm">
              <a
                href={whatsappQuoteHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track-label="calcolatore_invia_richiesta"
                data-track-apartment={selectedApartment.name}
              >
                <Send className="w-4 h-4" />
                Invia richiesta con questo preventivo
              </a>
            </Button>
            <div className="text-center">
              <a
                href="tel:+393457956159"
                data-track-label="calcolatore_chiama"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> Preferisci parlare con Gabriele? Chiama +39 345 795 6159
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
