import { describe, it, expect, beforeEach } from 'vitest';
import {
  bulkUpdateCalendar,
  createRateTier,
  deleteRateTier,
  getCalendarData,
  getRateHistory,
  updateRateTier,
} from '@/lib/admin-api';
import { calculateStayQuote } from '@/lib/pricing-calculator';
import { INITIAL_APARTMENTS } from '@/lib/mock-data';

const APT = INITIAL_APARTMENTS[0];

beforeEach(() => {
  localStorage.removeItem('srs_rate_tiers');
  localStorage.setItem('srs_daily_rates', '[]');
  localStorage.setItem('srs_rate_history', '[]');
});

describe('scaglioni tariffari (modalità locale)', () => {
  it('assegnando uno scaglione il giorno prende il prezzo per 2 persone', async () => {
    const t = await createRateTier({ apartment_id: APT.id, name: 'Alta', price_2p: 120, price_3p: 135, price_4p: 150, color: '#f00', sort_order: 1 });
    await bulkUpdateCalendar(APT.id, ['2026-11-10', '2026-11-11'], { price: t.price_2p, tierId: t.id });
    const { rates } = await getCalendarData(APT.id, '2026-11-01', '2026-11-30');
    expect(rates.map((r) => [r.price_per_night, r.tier_id])).toEqual([
      [120, t.id],
      [120, t.id],
    ]);
  });

  it('modificando lo scaglione i giorni si aggiornano da soli (con storico)', async () => {
    const t = await createRateTier({ apartment_id: APT.id, name: 'Media', price_2p: 90, price_3p: 95, price_4p: 110, color: '#00f', sort_order: 1 });
    await bulkUpdateCalendar(APT.id, ['2026-11-10'], { price: 90, tierId: t.id });
    await bulkUpdateCalendar(APT.id, ['2026-11-11'], { price: 90, tierId: null }); // manuale: non deve cambiare
    await updateRateTier(t.id, { price_2p: 100, price_3p: 105, price_4p: 120 });
    const { rates } = await getCalendarData(APT.id, '2026-11-01', '2026-11-30');
    expect(rates.find((r) => r.rate_date === '2026-11-10')?.price_per_night).toBe(100);
    expect(rates.find((r) => r.rate_date === '2026-11-11')?.price_per_night).toBe(90);
    const hist = await getRateHistory(APT.id);
    expect(hist[0].change_reason).toContain('Media');
  });

  it('il prezzo manuale toglie lo scaglione; eliminando lo scaglione il prezzo resta', async () => {
    const t = await createRateTier({ apartment_id: APT.id, name: 'Bassa', price_2p: 80, price_3p: 85, price_4p: 95, color: '#0f0', sort_order: 1 });
    await bulkUpdateCalendar(APT.id, ['2026-11-10', '2026-11-12'], { price: 80, tierId: t.id });
    await bulkUpdateCalendar(APT.id, ['2026-11-12'], { price: 77, tierId: null });
    await deleteRateTier(t.id);
    const { rates } = await getCalendarData(APT.id, '2026-11-01', '2026-11-30');
    expect(rates.find((r) => r.rate_date === '2026-11-10')).toMatchObject({ price_per_night: 80, tier_id: null });
    expect(rates.find((r) => r.rate_date === '2026-11-12')).toMatchObject({ price_per_night: 77, tier_id: null });
  });

  it('nomi duplicati non ammessi nello stesso appartamento', async () => {
    await createRateTier({ apartment_id: APT.id, name: 'Fiera', price_2p: 150, price_3p: 160, price_4p: 170, color: '#000', sort_order: 1 });
    await expect(
      createRateTier({ apartment_id: APT.id, name: 'fiera', price_2p: 1, price_3p: 1, price_4p: 1, color: '#000', sort_order: 1 })
    ).rejects.toThrow(/esiste già/);
  });
});

describe('preventivo con scaglioni', () => {
  const tier = { id: 't1', apartment_id: APT.id, name: 'Alta', price_2p: 120, price_3p: 135, price_4p: 150, color: '', sort_order: 1, created_at: '', updated_at: '' };
  const rate = (date: string, tierId: string | null, price: number) => ({
    id: date, apartment_id: APT.id, rate_date: date, price_per_night: price, is_manual_override: true,
    source: 'manual' as const, tier_id: tierId, created_at: '', updated_at: '',
  });

  it('usa il prezzo dello scaglione per il numero di ospiti, senza supplemento', () => {
    const q = calculateStayQuote({
      apartment: { ...APT, extra_guest_supplement: 15, base_guests_included: 2, cleaning_fee: 0 },
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      guests: 3,
      dailyRates: [rate('2026-11-10', 't1', 120), rate('2026-11-11', null, 100)],
      rateTiers: [tier],
      minStayRules: [],
    });
    expect(q.dailyBreakdown.map((d) => d.basePrice)).toEqual([135, 100]);
    expect(q.extraGuestsFee).toBe(15); // solo la notte senza scaglione
  });
});
