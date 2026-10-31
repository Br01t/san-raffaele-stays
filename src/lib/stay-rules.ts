import { MinStayRule, StayRuleType } from '@/types/database';

export const DEFAULT_MIN_NIGHTS = 2;

export const RULE_TYPE_LABELS: Record<StayRuleType, string> = {
  min_stay: 'Soggiorno minimo',
  fee: 'Costo aggiuntivo',
  discount: 'Sconto',
};

export const CHARGE_BASIS_LABELS = {
  per_stay: 'per soggiorno',
  per_night: 'per notte',
  per_guest: 'per ospite (a soggiorno)',
} as const;

/** Le righe create prima della migrazione non hanno rule_type: sono soggiorni minimi. */
export function getRuleType(rule: MinStayRule): StayRuleType {
  return rule.rule_type ?? 'min_stay';
}

export function isRuleActive(rule: MinStayRule): boolean {
  return rule.is_active !== false;
}

function appliesToApartment(rule: MinStayRule, apartmentId: string): boolean {
  return !rule.apartment_id || rule.apartment_id === apartmentId;
}

/** La regola vale se almeno una delle date cade nel suo periodo (nessun periodo = sempre). */
function overlapsDates(rule: MinStayRule, dates: string[]): boolean {
  if (!rule.start_date && !rule.end_date) return true;
  const from = rule.start_date ?? '0000-01-01';
  const to = rule.end_date ?? '9999-12-31';
  return dates.some((d) => d >= from && d <= to);
}

/** Priorità più alta prima; a parità vince la regola specifica dell'alloggio su quella globale. */
function byPrecedence(a: MinStayRule, b: MinStayRule): number {
  if (b.priority !== a.priority) return b.priority - a.priority;
  const as = a.apartment_id ? 1 : 0;
  const bs = b.apartment_id ? 1 : 0;
  return bs - as;
}

export function getMinStayRuleFor(
  rules: MinStayRule[],
  apartmentId: string,
  dates: string[]
): MinStayRule | null {
  const candidates = rules
    .filter((r) => getRuleType(r) === 'min_stay' && isRuleActive(r))
    .filter((r) => appliesToApartment(r, apartmentId) && overlapsDates(r, dates))
    .sort(byPrecedence);
  return candidates[0] ?? null;
}

/**
 * Regola "sempre valida" di soggiorno minimo, quella mostrata come testo accanto al calendario:
 * senza periodo, attiva, dell'alloggio (o in mancanza quella generale).
 */
export function getAlwaysMinStayRule(rules: MinStayRule[], apartmentId: string): MinStayRule | null {
  const candidates = rules
    .filter((r) => getRuleType(r) === 'min_stay' && isRuleActive(r))
    .filter((r) => !r.start_date && !r.end_date && appliesToApartment(r, apartmentId))
    .sort((a, b) => {
      const as = a.apartment_id ? 1 : 0;
      const bs = b.apartment_id ? 1 : 0;
      return bs - as || b.priority - a.priority;
    });
  return candidates[0] ?? null;
}

export function getMinNightsForStay(rules: MinStayRule[], apartmentId: string, dates: string[]): number {
  const rule = getMinStayRuleFor(rules, apartmentId, dates);
  return rule?.min_nights ?? DEFAULT_MIN_NIGHTS;
}

export interface FeeLine {
  ruleId: string;
  label: string;
  /** Importo realmente addebitato (0 se omaggio). */
  amount: number;
  /** Importo pieno prima dell'eventuale omaggio. */
  fullAmount: number;
  waived: boolean;
}

export interface DiscountLine {
  ruleId: string;
  label: string;
  amount: number;
  amountType?: 'fixed' | 'percent';
  rawValue?: number;
  thresholdNights?: number | null;
  badgeText?: string;
}

export interface StayExtras {
  fees: FeeLine[];
  feesTotal: number;
  discount: DiscountLine | null;
  discountTotal: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Costi extra e sconto per un soggiorno.
 * - Costi: tutti quelli validi si sommano; se nights >= threshold_nights sono omaggio.
 * - Sconti: si applica solo il più vantaggioso (non si sommano), da threshold_nights notti.
 */
export function computeStayExtras(input: {
  rules: MinStayRule[];
  apartmentId: string;
  dates: string[];
  guests: number;
  nightsTotal: number;
}): StayExtras {
  const { rules, apartmentId, dates, guests, nightsTotal } = input;
  const nights = dates.length;
  const applicable = rules.filter(
    (r) => isRuleActive(r) && appliesToApartment(r, apartmentId) && overlapsDates(r, dates)
  );

  const fees: FeeLine[] = applicable
    .filter((r) => getRuleType(r) === 'fee')
    .map((r) => {
      const unit = Number(r.amount ?? 0);
      const basis = r.charge_basis ?? 'per_stay';
      const full = round2(basis === 'per_night' ? unit * nights : basis === 'per_guest' ? unit * guests : unit);
      const waived = !!r.threshold_nights && r.threshold_nights > 0 && nights >= r.threshold_nights;
      return {
        ruleId: r.id,
        label: r.description || 'Costo aggiuntivo',
        fullAmount: full,
        amount: waived ? 0 : full,
        waived,
      };
    });
  const feesTotal = round2(fees.reduce((sum, f) => sum + f.amount, 0));

  let best: DiscountLine | null = null;
  for (const r of applicable.filter((x) => getRuleType(x) === 'discount')) {
    if (nights < (r.threshold_nights ?? 0)) continue;
    const value = Number(r.amount ?? 0);
    const amountType = r.amount_type ?? 'percent';
    const raw = amountType === 'percent' ? (nightsTotal * value) / 100 : value;
    const amount = round2(Math.min(Math.max(raw, 0), nightsTotal));
    const badgeText = amountType === 'percent' ? `${value}%` : `${value} €`;
    if (amount > 0 && (!best || amount > best.amount)) {
      best = {
        ruleId: r.id,
        label: r.description || 'Sconto',
        amount,
        amountType,
        rawValue: value,
        thresholdNights: r.threshold_nights ?? null,
        badgeText,
      };
    }
  }

  return { fees, feesTotal, discount: best, discountTotal: best?.amount ?? 0 };
}

/**
 * Restituisce tutte le fasce di sconto attive per un alloggio, ordinate per numero di notti crescente.
 */
export function getActiveDiscountTiersForApartment(
  rules: MinStayRule[],
  apartmentId: string
): MinStayRule[] {
  return rules
    .filter((r) => getRuleType(r) === 'discount' && isRuleActive(r) && appliesToApartment(r, apartmentId))
    .filter((r) => Number(r.amount ?? 0) > 0)
    .sort((a, b) => (a.threshold_nights ?? 0) - (b.threshold_nights ?? 0) || Number(a.amount ?? 0) - Number(b.amount ?? 0));
}

/**
 * Se l'utente non ha ancora raggiunto la soglia di uno sconto superiore, restituisce il prossimo sconto sbloccabile.
 */
export function getNextDiscountTierHint(
  rules: MinStayRule[],
  apartmentId: string,
  dates: string[]
): { missingNights: number; thresholdNights: number; rule: MinStayRule; discountLabel: string } | null {
  const nights = dates.length;
  const candidates = rules
    .filter((r) => getRuleType(r) === 'discount' && isRuleActive(r) && appliesToApartment(r, apartmentId))
    .filter((r) => (dates.length === 0 ? true : overlapsDates(r, dates)))
    .filter((r) => (r.threshold_nights ?? 0) > nights && Number(r.amount ?? 0) > 0)
    .sort((a, b) => (a.threshold_nights ?? 0) - (b.threshold_nights ?? 0));

  const next = candidates[0];
  if (!next || !next.threshold_nights) return null;
  const val = Number(next.amount ?? 0);
  const discountLabel = next.amount_type === 'fixed' ? `${val} €` : `${val}%`;
  return {
    missingNights: next.threshold_nights - nights,
    thresholdNights: next.threshold_nights,
    rule: next,
    discountLabel,
  };
}

/** Descrizione leggibile della regola, per elenchi e riepiloghi. */
export function describeRule(rule: MinStayRule): string {
  const type = getRuleType(rule);
  if (type === 'min_stay') return `Minimo ${rule.min_nights ?? DEFAULT_MIN_NIGHTS} notti`;
  if (type === 'fee') {
    const basis = CHARGE_BASIS_LABELS[rule.charge_basis ?? 'per_stay'];
    const free = rule.threshold_nights ? ` · omaggio da ${rule.threshold_nights} notti` : '';
    return `${Number(rule.amount ?? 0)} € ${basis}${free}`;
  }
  const value = rule.amount_type === 'percent' ? `${Number(rule.amount ?? 0)}%` : `${Number(rule.amount ?? 0)} €`;
  const from = rule.threshold_nights ? ` da ${rule.threshold_nights} notti` : '';
  return `Sconto ${value}${from}`;
}
