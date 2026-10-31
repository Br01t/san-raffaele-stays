import { describe, it, expect } from 'vitest';
import {
  apartmentShare,
  budgetFor,
  forecastMovements,
  monthsBetween,
  occurrenceDates,
  pendingRecurringMovements,
  summarizeApartments,
  summarizePersonal,
  monthlyRows,
} from '@/lib/finance-calc';
import { FinanceCategory, FinanceMovement, FinanceRecurring } from '@/types/finance';

const cat = (id: string, over: Partial<FinanceCategory>): FinanceCategory => ({
  id,
  scope: 'apartment',
  kind: 'expense',
  cat_group: 'variable',
  name: id,
  system_key: null,
  sort_order: 0,
  is_active: true,
  created_at: '',
  updated_at: '',
  ...over,
});

const mv = (over: Partial<FinanceMovement>): FinanceMovement => ({
  id: Math.random().toString(36),
  scope: 'apartment',
  direction: 'expense',
  category_id: null,
  apartment_id: null,
  movement_date: '2026-05-10',
  amount: 0,
  invoiced_amount: null,
  interest_amount: null,
  description: null,
  status: 'actual',
  source: 'manual',
  source_ref: null,
  recurring_id: null,
  created_at: '',
  updated_at: '',
  ...over,
});

const rule = (over: Partial<FinanceRecurring>): FinanceRecurring => ({
  id: 'r1',
  scope: 'personal',
  direction: 'expense',
  category_id: 'c',
  apartment_id: null,
  amount: 100,
  interest_amount: null,
  frequency: 'monthly',
  day_of_month: 31,
  month_of_year: null,
  start_date: '2026-01-31',
  end_date: null,
  description: null,
  is_active: true,
  created_at: '',
  updated_at: '',
  ...over,
});

const cats = new Map<string, FinanceCategory>([
  ['rent', cat('rent', { kind: 'income', cat_group: null })],
  ['mortgage', cat('mortgage', { cat_group: 'fixed', system_key: 'apt_mortgage' })],
  ['clean', cat('clean', { cat_group: 'variable' })],
  ['salary', cat('salary', { scope: 'personal', kind: 'income', cat_group: null })],
  ['rentP', cat('rentP', { scope: 'personal', cat_group: 'fixed' })],
  ['food', cat('food', { scope: 'personal', cat_group: 'revolut' })],
  ['travel', cat('travel', { scope: 'personal', cat_group: 'variable' })],
]);

const MAY = { from: '2026-05-01', to: '2026-05-31' };

describe('date e ricorrenze', () => {
  it('monthsBetween include gli estremi', () => {
    expect(monthsBetween('2025-11-15', '2026-02-01')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('il giorno 31 diventa l’ultimo giorno dei mesi più corti', () => {
    expect(occurrenceDates(rule({}), '2026-01-01', '2026-04-30')).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('le ricorrenze annuali cadono solo nel mese di pagamento', () => {
    const r = rule({ frequency: 'yearly', day_of_month: 15, month_of_year: 3, start_date: '2025-03-15' });
    expect(occurrenceDates(r, '2025-01-01', '2027-12-31')).toEqual(['2025-03-15', '2026-03-15', '2027-03-15']);
  });

  it('rispetta la data di fine e le regole disattivate', () => {
    expect(occurrenceDates(rule({ end_date: '2026-02-28' }), '2026-01-01', '2026-12-31')).toHaveLength(2);
    expect(occurrenceDates(rule({ is_active: false }), '2026-01-01', '2026-12-31')).toHaveLength(0);
  });

  it('genera solo le occorrenze maturate e non ancora presenti (anche se annullate)', () => {
    const existing = [{ source_ref: 'rec:r1:2026-01-31' }, { source_ref: 'rec:r1:2026-02-28' }];
    const pending = pendingRecurringMovements([rule({})], existing, '2026-04-15');
    expect(pending.map((p) => p.movement_date)).toEqual(['2026-03-31']);
    expect(pending[0].status).toBe('actual');
  });

  it('la previsione contiene solo date future e i movimenti previsti', () => {
    const planned = mv({ scope: 'personal', status: 'planned', movement_date: '2026-06-02', amount: 50 });
    const f = forecastMovements([rule({})], [planned], { from: '2026-04-01', to: '2026-06-30' }, '2026-04-15');
    expect(f.map((m) => m.movement_date)).toEqual(['2026-04-30', '2026-05-31', '2026-06-02', '2026-06-30']);
    expect(f.every((m) => m.status === 'planned')).toBe(true);
  });
});

describe('contabilità appartamenti', () => {
  const A = 'a1';
  const B = 'a2';
  const C = 'a3';
  const data = [
    mv({ direction: 'income', category_id: 'rent', apartment_id: A, amount: 1000, invoiced_amount: 600 }),
    mv({ direction: 'income', category_id: 'rent', apartment_id: B, amount: 500, invoiced_amount: 500 }),
    mv({ category_id: 'mortgage', apartment_id: A, amount: 400, interest_amount: 100 }),
    mv({ category_id: 'clean', apartment_id: null, amount: 300 }), // condivisa
    mv({ category_id: 'clean', apartment_id: A, amount: 50, status: 'skipped' }),
    mv({ category_id: 'clean', apartment_id: A, amount: 70, status: 'planned' }),
    mv({ category_id: 'clean', apartment_id: A, amount: 999, movement_date: '2026-06-01' }),
  ];

  it('separa fatturato e da fatturare', () => {
    const s = summarizeApartments(data, cats, 'all', 3, MAY);
    expect(s.invoiced).toBe(1100);
    expect(s.toInvoice).toBe(400);
    expect(s.income).toBe(1500);
  });

  it('la spesa condivisa conta una volta nel totale e 1/3 per appartamento', () => {
    const total = summarizeApartments(data, cats, 'all', 3, MAY);
    expect(total.expenses).toBe(700);
    const parts = [A, B, C].map((id) => summarizeApartments(data, cats, id, 3, MAY).expenses);
    expect(parts[0]).toBe(500);
    expect(parts[1]).toBe(100);
    expect(parts.reduce((a, b) => a + b, 0)).toBeCloseTo(total.expenses, 2);
  });

  it('distingue cassa e redditività per il mutuo', () => {
    const s = summarizeApartments(data, cats, A, 3, MAY);
    expect(s.fixed).toBe(400);
    expect(s.variable).toBe(100);
    expect(s.net).toBe(500); // 1000 - 400 - 100
    expect(s.mortgageCapital).toBe(300);
    expect(s.economicNet).toBe(800);
  });

  it('apartmentShare', () => {
    expect(apartmentShare(mv({ apartment_id: null }), 'all', 3)).toBe(1);
    expect(apartmentShare(mv({ apartment_id: A }), B, 3)).toBe(0);
  });
});

describe('finanze personali e bilancio', () => {
  const data = [
    mv({ scope: 'personal', direction: 'income', category_id: 'salary', amount: 2500 }),
    mv({ scope: 'personal', category_id: 'rentP', amount: 900 }),
    mv({ scope: 'personal', direction: 'transfer', amount: 600 }), // giroconto su Revolut
    mv({ scope: 'personal', category_id: 'food', amount: 420 }),
    mv({ scope: 'personal', category_id: 'travel', amount: 200 }),
  ];

  it('il giroconto Revolut non è una spesa', () => {
    const s = summarizePersonal(data, cats, MAY);
    expect(s.transfers).toBe(600);
    expect(s.revolut).toBe(420);
    expect(s.variable).toBe(620);
    expect(s.fixed).toBe(900);
    expect(s.expenses).toBe(1520);
    expect(s.balance).toBe(980);
  });

  it('budget del mese o predefinito', () => {
    const b = [
      { budget_key: 'revolut', month: 'default', amount: 800 },
      { budget_key: 'revolut', month: '2026-08', amount: 1200 },
    ];
    expect(budgetFor(b, 'revolut', '2026-05')).toBe(800);
    expect(budgetFor(b, 'revolut', '2026-08')).toBe(1200);
  });

  it('saldo complessivo = risultato appartamenti + saldo personale, senza doppio conteggio', () => {
    const all = [
      ...data,
      mv({ direction: 'income', category_id: 'rent', apartment_id: 'a1', amount: 1000 }),
      mv({ category_id: 'clean', apartment_id: 'a1', amount: 300 }),
    ];
    const [row] = monthlyRows(all, ['2026-05']);
    expect(row.income).toBe(3500);
    expect(row.expenses).toBe(1820);
    expect(row.aptNet).toBe(700);
    expect(row.net).toBe(700 + 980);
  });
});
