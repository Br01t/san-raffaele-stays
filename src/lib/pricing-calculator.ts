import { Apartment, DailyRate, Availability, MinStayRule } from '@/types/database';

export interface QuoteInput {
  apartment: Apartment;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  dailyRates?: DailyRate[];
  availability?: Availability[];
  minStayRules?: MinStayRule[];
}

export interface DayBreakdown {
  date: string;
  basePrice: number;
  isHighDemand: boolean;
  isAvailable: boolean;
}

export interface QuoteResult {
  isValid: boolean;
  validationErrors: string[];
  totalNights: number;
  apartmentName: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  dailyBreakdown: DayBreakdown[];
  nightsTotal: number;
  extraGuestsFee: number;
  cleaningFee: number;
  grandTotal: number;
  formattedMessageSummary: string;
}

/**
 * Calcola l'elenco dei giorni compresi tra check-in (incluso) e check-out (escluso).
 */
export function getStayDates(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Motore di calcolo preventivo (Fase 2)
 * Calcola la tariffa esatta considerando tariffe giornaliere, numero ospiti, supplementi e pulizie.
 */
export function calculateStayQuote(input: QuoteInput): QuoteResult {
  const { apartment, checkIn, checkOut, guests, dailyRates = [], availability = [], minStayRules = [] } = input;
  const validationErrors: string[] = [];

  const stayDates = getStayDates(checkIn, checkOut);
  const totalNights = stayDates.length;

  if (totalNights <= 0) {
    validationErrors.push('La data di check-out deve essere successiva alla data di check-in.');
  }

  // Verifica capienza massima
  if (guests > apartment.max_guests) {
    validationErrors.push(`L'alloggio ${apartment.name} può ospitare al massimo ${apartment.max_guests} persone.`);
  }

  // Verifica soggiorno minimo
  let requiredMinNights = 2; // Default generale
  const relevantRule = minStayRules.find((rule) => {
    if (rule.apartment_id && rule.apartment_id !== apartment.id) return false;
    if (!rule.start_date || !rule.end_date) return true;
    return stayDates.some((d) => d >= (rule.start_date as string) && d <= (rule.end_date as string));
  });

  if (relevantRule) {
    requiredMinNights = relevantRule.min_nights;
  }

  if (totalNights > 0 && totalNights < requiredMinNights) {
    validationErrors.push(
      `Per le date selezionate è richiesto un soggiorno minimo di ${requiredMinNights} notti (hai selezionato ${totalNights} ${
        totalNights === 1 ? 'notte' : 'notti'
      }).`
    );
  }

  // Mappa tariffe e disponibilità per giorno
  const dailyBreakdown: DayBreakdown[] = [];
  let nightsTotal = 0;

  for (const date of stayDates) {
    const rateItem = dailyRates.find((r) => r.rate_date === date);
    const availItem = availability.find((a) => a.avail_date === date);

    const isAvailable = availItem ? availItem.is_available : true;
    const isHighDemand = availItem ? availItem.is_high_demand : false;

    if (!isAvailable) {
      validationErrors.push(`La data ${date} risulta già occupata o non disponibile per ${apartment.name}.`);
    }

    // Tariffa base per 2 persone o tariffa giornaliera registrata
    let dayRate = rateItem ? Number(rateItem.price_per_night) : Number(apartment.base_price_2p);

    // Se per 3 o 4 persone senza override manuale, adatta alla tariffa base specifica
    if (!rateItem) {
      if (guests === 3) dayRate = Number(apartment.base_price_3p);
      else if (guests >= 4) dayRate = Number(apartment.base_price_4p);
    }

    nightsTotal += dayRate;

    dailyBreakdown.push({
      date,
      basePrice: dayRate,
      isHighDemand,
      isAvailable,
    });
  }

  // Supplemento ospiti extra (se più di 2 ospiti e tariffa fissa extra guest impostata)
  let extraGuestsFee = 0;
  if (guests > apartment.base_guests_included && apartment.extra_guest_supplement > 0) {
    const extraGuestsCount = guests - apartment.base_guests_included;
    extraGuestsFee = extraGuestsCount * Number(apartment.extra_guest_supplement) * totalNights;
  }

  // Costo pulizia (azzerato se soggiorno >= threshold o se impostato a 0)
  let cleaningFee = Number(apartment.cleaning_fee);
  if (
    apartment.cleaning_fee_threshold_nights > 0 &&
    totalNights >= apartment.cleaning_fee_threshold_nights
  ) {
    cleaningFee = 0;
  }

  const grandTotal = nightsTotal + extraGuestsFee + cleaningFee;

  // Testo riepilogativo formattato pronto per il campo 'message' del modulo Netlify Contatti
  const formattedMessageSummary = [
    `--- RICHIESTA PREVENTIVO DAL SITO ---`,
    `Alloggio: ${apartment.name}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut} (${totalNights} notti)`,
    `Ospiti: ${guests}`,
    `Totale stimato: € ${grandTotal.toFixed(2)}`,
    cleaningFee > 0 ? `(Include pulizia: € ${cleaningFee.toFixed(2)})` : `(Pulizia inclusa/gratuita)`,
    `--------------------------------------`,
  ].join('\n');

  return {
    isValid: validationErrors.length === 0,
    validationErrors,
    totalNights,
    apartmentName: apartment.name,
    guests,
    checkIn,
    checkOut,
    dailyBreakdown,
    nightsTotal,
    extraGuestsFee,
    cleaningFee,
    grandTotal,
    formattedMessageSummary,
  };
}
