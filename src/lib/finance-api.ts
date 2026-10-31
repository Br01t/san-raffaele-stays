/**
 * Accesso ai dati della gestione finanziaria.
 * Con Supabase configurato legge/scrive le tabelle finance_* (solo admin, RLS);
 * in sviluppo locale senza chiavi usa localStorage (stesso schema di admin-api).
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { generateUUID, getApartments, getMonthlyData } from './admin-api';
import { pendingRecurringMovements } from './finance-calc';
import {
  APT_RENT_KEY,
  CategoryInput,
  FinanceBudget,
  FinanceCategory,
  FinanceMovement,
  FinanceRecurring,
  MovementInput,
  RecurringInput,
} from '@/types/finance';
import { Apartment, MonthlyData } from '@/types/database';

const LS_CATEGORIES = 'srs_fin_categories';
const LS_MOVEMENTS = 'srs_fin_movements';
const LS_RECURRING = 'srs_fin_recurring';
const LS_BUDGETS = 'srs_fin_budgets';
const LS_SETTINGS = 'srs_fin_settings';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const nowIso = () => new Date().toISOString();

// ------------------------------------------------------------------------------
// ERRORI
// ------------------------------------------------------------------------------
interface DbErrorLike {
  message: string;
  code?: string;
}

export const MIGRATION_HINT =
  'Tabelle della gestione finanziaria mancanti: esegui supabase/migrations/20261031_finance.sql nel SQL Editor di Supabase.';

function finError(action: string, error: DbErrorLike): Error {
  console.error(`Supabase ${action}:`, error);
  if (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message)) {
    return new Error(MIGRATION_HINT);
  }
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message)) {
    return new Error(`${action}: permesso negato dal database. Esci e rientra nell’area admin.`);
  }
  if (error.code === '23503') {
    return new Error(`${action}: la categoria è usata da movimenti o ricorrenze. Disattivala invece di eliminarla.`);
  }
  return new Error(`${action}: ${error.message}`);
}

async function fetchAll<T>(table: string, orderBy: string): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: true })
      .range(from, from + 999);
    if (error) throw finError(`Lettura ${table}`, error);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

// ------------------------------------------------------------------------------
// CATEGORIE PREDEFINITE (uguali a quelle della migrazione SQL)
// ------------------------------------------------------------------------------
const DEFAULT_CATEGORIES: Omit<CategoryInput, 'is_active'>[] = [
  { scope: 'apartment', kind: 'income', cat_group: null, name: 'Affitti brevi', system_key: 'apt_income_rent', sort_order: 10 },
  { scope: 'apartment', kind: 'income', cat_group: null, name: 'Altri incassi', system_key: 'apt_income_other', sort_order: 20 },
  { scope: 'apartment', kind: 'expense', cat_group: 'fixed', name: 'Mutuo', system_key: 'apt_mortgage', sort_order: 10 },
  { scope: 'apartment', kind: 'expense', cat_group: 'fixed', name: 'Spese condominiali', system_key: 'apt_condo', sort_order: 20 },
  { scope: 'apartment', kind: 'expense', cat_group: 'fixed', name: 'Utenze', system_key: 'apt_utilities', sort_order: 30 },
  { scope: 'apartment', kind: 'expense', cat_group: 'variable', name: 'Tasse', system_key: 'apt_taxes', sort_order: 40 },
  { scope: 'apartment', kind: 'expense', cat_group: 'variable', name: 'Pulizie', system_key: 'apt_cleaning', sort_order: 50 },
  { scope: 'apartment', kind: 'expense', cat_group: 'variable', name: 'Manutenzione', system_key: 'apt_maintenance', sort_order: 60 },
  { scope: 'apartment', kind: 'expense', cat_group: 'variable', name: 'Varie', system_key: 'apt_misc', sort_order: 70 },
  { scope: 'personal', kind: 'income', cat_group: null, name: 'Lavoro dipendente', system_key: 'per_income_salary', sort_order: 10 },
  { scope: 'personal', kind: 'income', cat_group: null, name: 'Navette', system_key: 'per_income_shuttle', sort_order: 20 },
  { scope: 'personal', kind: 'income', cat_group: null, name: 'Extra', system_key: 'per_income_extra', sort_order: 30 },
  { scope: 'personal', kind: 'expense', cat_group: 'fixed', name: 'Affitto', system_key: 'per_rent', sort_order: 10 },
  { scope: 'personal', kind: 'expense', cat_group: 'fixed', name: 'Utenze e bollette', system_key: 'per_utilities', sort_order: 20 },
  { scope: 'personal', kind: 'expense', cat_group: 'fixed', name: 'Asilo nido', system_key: 'per_nursery', sort_order: 30 },
  { scope: 'personal', kind: 'expense', cat_group: 'variable', name: 'Assicurazioni', system_key: 'per_insurance', sort_order: 50 },
  { scope: 'personal', kind: 'expense', cat_group: 'variable', name: 'Viaggi', system_key: 'per_travel', sort_order: 60 },
  { scope: 'personal', kind: 'expense', cat_group: 'variable', name: 'Amazon e acquisti', system_key: 'per_shopping', sort_order: 70 },
  { scope: 'personal', kind: 'expense', cat_group: 'variable', name: 'Altre spese', system_key: 'per_other', sort_order: 80 },
  { scope: 'personal', kind: 'expense', cat_group: 'revolut', name: 'Spesa alimentare', system_key: 'rev_groceries', sort_order: 10 },
  { scope: 'personal', kind: 'expense', cat_group: 'revolut', name: 'Benzina', system_key: 'rev_fuel', sort_order: 20 },
  { scope: 'personal', kind: 'expense', cat_group: 'revolut', name: 'Svago', system_key: 'rev_leisure', sort_order: 30 },
  { scope: 'personal', kind: 'expense', cat_group: 'revolut', name: 'Acquisti personali', system_key: 'rev_personal', sort_order: 40 },
  { scope: 'personal', kind: 'expense', cat_group: 'revolut', name: 'Spese ordinarie', system_key: 'rev_ordinary', sort_order: 50 },
];

function localCategories(): FinanceCategory[] {
  const existing = getLocal<FinanceCategory[] | null>(LS_CATEGORIES, null);
  if (existing) return existing;
  const seeded = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    is_active: true,
    id: generateUUID(),
    created_at: nowIso(),
    updated_at: nowIso(),
  }));
  setLocal(LS_CATEGORIES, seeded);
  return seeded;
}

const sortCategories = (list: FinanceCategory[]) =>
  [...list].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

// ------------------------------------------------------------------------------
// CATEGORIE
// ------------------------------------------------------------------------------
export async function getCategories(): Promise<FinanceCategory[]> {
  if (isSupabaseConfigured()) return sortCategories(await fetchAll<FinanceCategory>('finance_categories', 'sort_order'));
  return sortCategories(localCategories());
}

export async function createCategory(input: CategoryInput): Promise<FinanceCategory> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_categories').insert(input).select().single();
    if (error) throw finError('Creazione categoria', error);
    return data as FinanceCategory;
  }
  const created: FinanceCategory = { ...input, id: generateUUID(), created_at: nowIso(), updated_at: nowIso() };
  setLocal(LS_CATEGORIES, [...localCategories(), created]);
  return created;
}

export async function updateCategory(id: string, updates: Partial<CategoryInput>): Promise<FinanceCategory> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_categories').update(updates).eq('id', id).select();
    if (error) throw finError('Modifica categoria', error);
    if (!data?.length) throw new Error('Modifica categoria: nessuna riga aggiornata.');
    return data[0] as FinanceCategory;
  }
  const list = localCategories();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoria non trovata');
  list[idx] = { ...list[idx], ...updates, updated_at: nowIso() };
  setLocal(LS_CATEGORIES, list);
  return list[idx];
}

/** Elimina una categoria solo se non è usata; altrimenti va disattivata. */
export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('finance_categories').delete().eq('id', id);
    if (error) throw finError('Eliminazione categoria', error);
    return;
  }
  const used =
    getLocal<FinanceMovement[]>(LS_MOVEMENTS, []).some((m) => m.category_id === id) ||
    getLocal<FinanceRecurring[]>(LS_RECURRING, []).some((r) => r.category_id === id);
  if (used) throw new Error('La categoria è usata da movimenti o ricorrenze. Disattivala invece di eliminarla.');
  setLocal(LS_CATEGORIES, localCategories().filter((c) => c.id !== id));
}

// ------------------------------------------------------------------------------
// MOVIMENTI
// ------------------------------------------------------------------------------
function validateMovement(m: Partial<MovementInput>) {
  if (m.amount !== undefined && (!Number.isFinite(Number(m.amount)) || Number(m.amount) < 0)) {
    throw new Error('Importo non valido.');
  }
  if (m.invoiced_amount != null && m.amount !== undefined && Number(m.invoiced_amount) > Number(m.amount)) {
    throw new Error('L’importo fatturato non può superare l’incasso.');
  }
  if (m.interest_amount != null && m.amount !== undefined && Number(m.interest_amount) > Number(m.amount)) {
    throw new Error('La quota interessi non può superare la rata.');
  }
}

export async function getMovements(): Promise<FinanceMovement[]> {
  if (isSupabaseConfigured()) return fetchAll<FinanceMovement>('finance_movements', 'movement_date');
  return getLocal<FinanceMovement[]>(LS_MOVEMENTS, []);
}

export async function createMovements(inputs: MovementInput[]): Promise<FinanceMovement[]> {
  if (inputs.length === 0) return [];
  inputs.forEach(validateMovement);
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_movements').insert(inputs).select();
    if (error) throw finError('Salvataggio movimento', error);
    return (data ?? []) as FinanceMovement[];
  }
  const created = inputs.map((m) => ({ ...m, id: generateUUID(), created_at: nowIso(), updated_at: nowIso() }));
  setLocal(LS_MOVEMENTS, [...getLocal<FinanceMovement[]>(LS_MOVEMENTS, []), ...created]);
  return created;
}

/** Inserimento dei movimenti automatici: un source_ref già presente viene ignorato (niente duplicati). */
async function insertAutoMovements(inputs: MovementInput[]): Promise<void> {
  if (inputs.length === 0) return;
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('finance_movements')
      .upsert(inputs, { onConflict: 'source_ref', ignoreDuplicates: true });
    if (error) throw finError('Aggiornamento automatico movimenti', error);
    return;
  }
  const list = getLocal<FinanceMovement[]>(LS_MOVEMENTS, []);
  const known = new Set(list.map((m) => m.source_ref).filter(Boolean));
  const fresh = inputs
    .filter((m) => !known.has(m.source_ref))
    .map((m) => ({ ...m, id: generateUUID(), created_at: nowIso(), updated_at: nowIso() }));
  setLocal(LS_MOVEMENTS, [...list, ...fresh]);
}

export async function createMovement(input: MovementInput): Promise<FinanceMovement> {
  const [m] = await createMovements([input]);
  return m;
}

export async function updateMovement(id: string, updates: Partial<MovementInput>): Promise<FinanceMovement> {
  validateMovement(updates);
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_movements').update(updates).eq('id', id).select();
    if (error) throw finError('Modifica movimento', error);
    if (!data?.length) throw new Error('Modifica movimento: nessuna riga aggiornata.');
    return data[0] as FinanceMovement;
  }
  const list = getLocal<FinanceMovement[]>(LS_MOVEMENTS, []);
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Movimento non trovato');
  list[idx] = { ...list[idx], ...updates, updated_at: nowIso() };
  setLocal(LS_MOVEMENTS, list);
  return list[idx];
}

/**
 * Elimina un movimento. Le occorrenze generate da una ricorrenza vengono invece
 * marcate "skipped", altrimenti verrebbero ricreate al prossimo aggiornamento.
 */
export async function deleteMovement(m: FinanceMovement): Promise<void> {
  if (m.source === 'monthly_data') {
    throw new Error('Questo incasso arriva da “Dati Mensili”: modificalo o cancellalo da lì.');
  }
  if (m.source === 'recurring' && m.source_ref) {
    await updateMovement(m.id, { status: 'skipped' });
    return;
  }
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('finance_movements').delete().eq('id', m.id);
    if (error) throw finError('Eliminazione movimento', error);
    return;
  }
  setLocal(LS_MOVEMENTS, getLocal<FinanceMovement[]>(LS_MOVEMENTS, []).filter((x) => x.id !== m.id));
}

async function deleteMovementsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('finance_movements').delete().in('id', ids);
    if (error) throw finError('Eliminazione movimenti', error);
    return;
  }
  const set = new Set(ids);
  setLocal(LS_MOVEMENTS, getLocal<FinanceMovement[]>(LS_MOVEMENTS, []).filter((m) => !set.has(m.id)));
}

// ------------------------------------------------------------------------------
// RICORRENZE
// ------------------------------------------------------------------------------
export async function getRecurring(): Promise<FinanceRecurring[]> {
  if (isSupabaseConfigured()) return fetchAll<FinanceRecurring>('finance_recurring', 'start_date');
  return getLocal<FinanceRecurring[]>(LS_RECURRING, []);
}

export async function createRecurring(input: RecurringInput): Promise<FinanceRecurring> {
  if (!(Number(input.amount) >= 0)) throw new Error('Importo non valido.');
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_recurring').insert(input).select().single();
    if (error) throw finError('Salvataggio ricorrenza', error);
    return data as FinanceRecurring;
  }
  const created: FinanceRecurring = { ...input, id: generateUUID(), created_at: nowIso(), updated_at: nowIso() };
  setLocal(LS_RECURRING, [...getLocal<FinanceRecurring[]>(LS_RECURRING, []), created]);
  return created;
}

export async function updateRecurring(id: string, updates: Partial<RecurringInput>): Promise<FinanceRecurring> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_recurring').update(updates).eq('id', id).select();
    if (error) throw finError('Modifica ricorrenza', error);
    if (!data?.length) throw new Error('Modifica ricorrenza: nessuna riga aggiornata.');
    return data[0] as FinanceRecurring;
  }
  const list = getLocal<FinanceRecurring[]>(LS_RECURRING, []);
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Ricorrenza non trovata');
  list[idx] = { ...list[idx], ...updates, updated_at: nowIso() };
  setLocal(LS_RECURRING, list);
  return list[idx];
}

/**
 * Elimina la regola. I movimenti già registrati restano (sono spese realmente
 * sostenute); con `removeGenerated` si cancellano anche quelli generati.
 */
export async function deleteRecurring(id: string, removeGenerated = false): Promise<void> {
  if (removeGenerated) {
    const ids = (await getMovements()).filter((m) => m.recurring_id === id).map((m) => m.id);
    await deleteMovementsByIds(ids);
  }
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('finance_recurring').delete().eq('id', id);
    if (error) throw finError('Eliminazione ricorrenza', error);
    return;
  }
  setLocal(LS_RECURRING, getLocal<FinanceRecurring[]>(LS_RECURRING, []).filter((r) => r.id !== id));
  setLocal(
    LS_MOVEMENTS,
    getLocal<FinanceMovement[]>(LS_MOVEMENTS, []).map((m) => (m.recurring_id === id ? { ...m, recurring_id: null } : m))
  );
}

// ------------------------------------------------------------------------------
// BUDGET E IMPOSTAZIONI
// ------------------------------------------------------------------------------
export async function getBudgets(): Promise<FinanceBudget[]> {
  if (isSupabaseConfigured()) return fetchAll<FinanceBudget>('finance_budgets', 'month');
  return getLocal<FinanceBudget[]>(LS_BUDGETS, []);
}

/** month = 'YYYY-MM' per un mese specifico, 'default' per il valore di tutti i mesi. */
export async function setBudget(budgetKey: string, month: string, amount: number): Promise<void> {
  if (!(amount >= 0)) throw new Error('Budget non valido.');
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('finance_budgets')
      .upsert({ budget_key: budgetKey, month, amount, updated_at: nowIso() }, { onConflict: 'budget_key,month' });
    if (error) throw finError('Salvataggio budget', error);
    return;
  }
  const list = getLocal<FinanceBudget[]>(LS_BUDGETS, []);
  const idx = list.findIndex((b) => b.budget_key === budgetKey && b.month === month);
  if (idx !== -1) list[idx] = { ...list[idx], amount, updated_at: nowIso() };
  else list.push({ id: generateUUID(), budget_key: budgetKey, month, amount, created_at: nowIso(), updated_at: nowIso() });
  setLocal(LS_BUDGETS, list);
}

export async function getSettings(): Promise<Record<string, unknown>> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('finance_settings').select('*');
    if (error) throw finError('Lettura impostazioni', error);
    return Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  }
  return getLocal<Record<string, unknown>>(LS_SETTINGS, {});
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('finance_settings')
      .upsert({ key, value, updated_at: nowIso() }, { onConflict: 'key' });
    if (error) throw finError('Salvataggio impostazione', error);
    return;
  }
  setLocal(LS_SETTINGS, { ...getLocal<Record<string, unknown>>(LS_SETTINGS, {}), [key]: value });
}

// ------------------------------------------------------------------------------
// AUTOMAZIONI
// ------------------------------------------------------------------------------
export function monthlyDataRef(m: Pick<MonthlyData, 'apartment_id' | 'year' | 'month'>): string {
  return `md:${m.apartment_id}:${m.year}-${String(m.month).padStart(2, '0')}`;
}

/**
 * Collega il fatturato inserito in "Dati Mensili" alla contabilità, senza doppie
 * registrazioni: un solo movimento per appartamento/mese, aggiornato se cambia
 * l'importo e rimosso se il fatturato viene cancellato. Lo stato di fatturazione
 * (importo già fatturato) inserito dall'admin viene conservato.
 */
async function syncMonthlyRevenue(
  monthly: MonthlyData[],
  movements: FinanceMovement[],
  categories: FinanceCategory[]
): Promise<number> {
  const rentCat = categories.find((c) => c.system_key === APT_RENT_KEY);
  if (!rentCat) return 0;
  const existing = new Map(
    movements.filter((m) => m.source === 'monthly_data' && m.source_ref).map((m) => [m.source_ref as string, m])
  );
  const toCreate: MovementInput[] = [];
  const seen = new Set<string>();
  let changes = 0;

  for (const md of monthly) {
    if (md.revenue == null) continue;
    const ref = monthlyDataRef(md);
    seen.add(ref);
    const amount = Number(md.revenue);
    const cur = existing.get(ref);
    if (!cur) {
      toCreate.push({
        scope: 'apartment',
        direction: 'income',
        category_id: rentCat.id,
        apartment_id: md.apartment_id,
        movement_date: `${md.year}-${String(md.month).padStart(2, '0')}-01`,
        amount,
        invoiced_amount: 0,
        interest_amount: null,
        description: 'Fatturato da Dati Mensili',
        status: 'actual',
        source: 'monthly_data',
        source_ref: ref,
        recurring_id: null,
      });
    } else if (Number(cur.amount) !== amount) {
      await updateMovement(cur.id, {
        amount,
        invoiced_amount: Math.min(Number(cur.invoiced_amount ?? 0), amount),
      });
      changes++;
    }
  }
  await insertAutoMovements(toCreate);
  const stale = [...existing.entries()].filter(([ref]) => !seen.has(ref)).map(([, m]) => m.id);
  await deleteMovementsByIds(stale);
  return changes + toCreate.length + stale.length;
}

export interface FinanceData {
  apartments: Apartment[];
  categories: FinanceCategory[];
  movements: FinanceMovement[];
  recurring: FinanceRecurring[];
  budgets: FinanceBudget[];
  settings: Record<string, unknown>;
}

/**
 * Carica tutto ed esegue le automazioni (incassi dal gestionale + occorrenze
 * ricorrenti maturate). Se qualcosa cambia, rilegge i movimenti.
 */
export async function loadFinanceData(): Promise<FinanceData> {
  const [apartments, categories, recurring, budgets, settings, monthly] = await Promise.all([
    getApartments(),
    getCategories(),
    getRecurring(),
    getBudgets(),
    getSettings(),
    getMonthlyData(),
  ]);
  let movements = await getMovements();

  let changed = await syncMonthlyRevenue(monthly, movements, categories);
  const pending = pendingRecurringMovements(recurring, movements);
  if (pending.length > 0) {
    await insertAutoMovements(pending);
    changed += pending.length;
  }
  if (changed > 0) movements = await getMovements();

  return { apartments, categories, movements, recurring, budgets, settings };
}
