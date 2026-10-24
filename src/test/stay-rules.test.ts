import { describe, it, expect } from "vitest";
import { computeStayExtras, getMinNightsForStay, getMinStayRuleFor, describeRule } from "@/lib/stay-rules";
import { calculateStayQuote } from "@/lib/pricing-calculator";
import { MinStayRule, Apartment } from "@/types/database";

const base = { created_at: "", updated_at: "", start_date: null, end_date: null, priority: 1, description: null };
const rule = (r: Partial<MinStayRule>): MinStayRule =>
  ({ id: Math.random().toString(36), apartment_id: null, min_nights: null, ...base, ...r }) as MinStayRule;

const APT = "apt-1";
const days = (from: number, n: number) =>
  Array.from({ length: n }, (_, i) => `2027-05-${String(from + i).padStart(2, "0")}`);

describe("soggiorno minimo", () => {
  const rules = [
    rule({ rule_type: "min_stay", min_nights: 2, priority: 1 }),
    rule({ rule_type: "min_stay", min_nights: 4, priority: 10, start_date: "2027-05-10", end_date: "2027-05-15" }),
    rule({ rule_type: "min_stay", min_nights: 6, priority: 10, apartment_id: APT, start_date: "2027-05-10", end_date: "2027-05-15" }),
    rule({ rule_type: "min_stay", min_nights: 9, priority: 99, is_active: false }),
  ];

  it("a parità di priorità vince la regola dell'alloggio; le regole disattivate si ignorano", () => {
    expect(getMinNightsForStay(rules, APT, days(11, 2))).toBe(6);
    expect(getMinNightsForStay(rules, "altro", days(11, 2))).toBe(4);
  });
  it("fuori periodo vale la regola generale; senza regole il default è 2", () => {
    expect(getMinNightsForStay(rules, APT, days(20, 2))).toBe(2);
    expect(getMinNightsForStay([], APT, days(20, 2))).toBe(2);
  });
  it("le righe vecchie senza rule_type sono soggiorni minimi", () => {
    const legacy = rule({ min_nights: 3 });
    expect(getMinStayRuleFor([legacy], APT, days(1, 3))?.min_nights).toBe(3);
  });
});

describe("costi e sconti", () => {
  const cleaning = rule({ rule_type: "fee", description: "Pulizie", amount: 40, charge_basis: "per_stay", threshold_nights: 7 });
  const discount10 = rule({ rule_type: "discount", description: "Settimana -10%", amount: 10, amount_type: "percent", threshold_nights: 7 });
  const discount30 = rule({ rule_type: "discount", description: "-30€", amount: 30, amount_type: "fixed", threshold_nights: 3 });

  it("pulizie a pagamento sotto soglia, omaggio da 7 notti", () => {
    const short = computeStayExtras({ rules: [cleaning], apartmentId: APT, dates: days(1, 3), guests: 2, nightsTotal: 300 });
    expect(short.feesTotal).toBe(40);
    const week = computeStayExtras({ rules: [cleaning], apartmentId: APT, dates: days(1, 7), guests: 2, nightsTotal: 700 });
    expect(week.feesTotal).toBe(0);
    expect(week.fees[0].waived).toBe(true);
    expect(week.fees[0].fullAmount).toBe(40);
  });

  it("costo per notte e per ospite", () => {
    const perNight = rule({ rule_type: "fee", amount: 5, charge_basis: "per_night" });
    const perGuest = rule({ rule_type: "fee", amount: 10, charge_basis: "per_guest" });
    const r = computeStayExtras({ rules: [perNight, perGuest], apartmentId: APT, dates: days(1, 4), guests: 3, nightsTotal: 400 });
    expect(r.feesTotal).toBe(5 * 4 + 10 * 3);
  });

  it("si applica solo lo sconto più vantaggioso, mai la somma", () => {
    const r = computeStayExtras({ rules: [discount10, discount30], apartmentId: APT, dates: days(1, 7), guests: 2, nightsTotal: 700 });
    expect(r.discountTotal).toBe(70); // 10% di 700 > 30 €
    const r2 = computeStayExtras({ rules: [discount10, discount30], apartmentId: APT, dates: days(1, 4), guests: 2, nightsTotal: 400 });
    expect(r2.discountTotal).toBe(30); // sotto 7 notti vale solo il -30 €
  });

  it("regole disattivate, di altri alloggi o fuori periodo non contano", () => {
    const off = rule({ rule_type: "fee", amount: 99, is_active: false });
    const other = rule({ rule_type: "fee", amount: 99, apartment_id: "altro" });
    const outside = rule({ rule_type: "fee", amount: 99, start_date: "2027-08-01", end_date: "2027-08-10" });
    expect(computeStayExtras({ rules: [off, other, outside], apartmentId: APT, dates: days(1, 3), guests: 2, nightsTotal: 300 }).feesTotal).toBe(0);
  });

  it("descrizioni leggibili", () => {
    expect(describeRule(cleaning)).toBe("40 € per soggiorno · omaggio da 7 notti");
    expect(describeRule(discount10)).toBe("Sconto 10% da 7 notti");
  });
});

describe("preventivo completo", () => {
  const apartment = {
    id: APT, name: "AMICI 1", base_price_2p: 100, base_price_3p: 120, base_price_4p: 140,
    extra_guest_supplement: 0, cleaning_fee: 0, cleaning_fee_threshold_nights: 0,
    max_guests: 4, base_guests_included: 2,
  } as Apartment;
  const rules = [
    rule({ rule_type: "min_stay", min_nights: 2 }),
    rule({ rule_type: "fee", description: "Pulizie", amount: 40, charge_basis: "per_stay", threshold_nights: 7 }),
    rule({ rule_type: "discount", description: "Settimana -10%", amount: 10, amount_type: "percent", threshold_nights: 7 }),
  ];

  it("3 notti: 300 + 40 pulizie", () => {
    const q = calculateStayQuote({ apartment, checkIn: "2027-05-01", checkOut: "2027-05-04", guests: 2, minStayRules: rules });
    expect(q.isValid).toBe(true);
    expect(q.grandTotal).toBe(340);
  });
  it("7 notti: 700 - 10% e pulizie in omaggio = 630", () => {
    const q = calculateStayQuote({ apartment, checkIn: "2027-05-01", checkOut: "2027-05-08", guests: 2, minStayRules: rules });
    expect(q.totalNights).toBe(7);
    expect(q.extraFees[0].waived).toBe(true);
    expect(q.discountTotal).toBe(70);
    expect(q.grandTotal).toBe(630);
    expect(q.formattedMessageSummary).toContain("omaggio");
  });
  it("sotto il minimo di notti il preventivo non è valido", () => {
    const q = calculateStayQuote({ apartment, checkIn: "2027-05-01", checkOut: "2027-05-02", guests: 2, minStayRules: rules });
    expect(q.isValid).toBe(false);
  });
  it("conta i giorni giusti anche a cavallo del cambio ora legale", () => {
    const q = calculateStayQuote({ apartment, checkIn: "2027-03-26", checkOut: "2027-04-02", guests: 2 });
    expect(q.dailyBreakdown.map((d) => d.date)).toEqual([
      "2027-03-26", "2027-03-27", "2027-03-28", "2027-03-29", "2027-03-30", "2027-03-31", "2027-04-01",
    ]);
  });
});
