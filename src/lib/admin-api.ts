import { supabase, isSupabaseConfigured } from './supabase';
import {
  Apartment,
  DailyRate,
  Availability,
  MinStayRule,
  MonthlyData,
  EventItem,
  InternalNote,
  RateHistory,
  MonthlyDataHistory,
} from '@/types/database';
import {
  INITIAL_APARTMENTS,
  INITIAL_EVENTS,
  INITIAL_MONTHLY_DATA,
  INITIAL_MIN_STAY_RULES,
  INITIAL_NOTES,
} from './mock-data';

// Helper per generare UUID conformi allo standard PostgreSQL
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Local storage keys for fallback/mock mode
const LS_APARTMENTS = 'srs_apartments';
const LS_RATES = 'srs_daily_rates';
const LS_AVAIL = 'srs_availability';
const LS_MIN_STAY = 'srs_min_stay_rules';
const LS_MONTHLY = 'srs_monthly_data';
const LS_EVENTS = 'srs_events';
const LS_NOTES = 'srs_notes';
const LS_RATE_HISTORY = 'srs_rate_history';
const LS_MONTHLY_HISTORY = 'srs_monthly_history';

// Helper storage functions
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// Inizializza mock data se non presenti
function ensureLocalInitialized() {
  if (!localStorage.getItem(LS_APARTMENTS)) {
    setLocal(LS_APARTMENTS, INITIAL_APARTMENTS);
  }
  if (!localStorage.getItem(LS_EVENTS)) {
    setLocal(LS_EVENTS, INITIAL_EVENTS);
  }
  if (!localStorage.getItem(LS_MIN_STAY)) {
    setLocal(LS_MIN_STAY, INITIAL_MIN_STAY_RULES);
  }
  if (!localStorage.getItem(LS_MONTHLY)) {
    setLocal(LS_MONTHLY, INITIAL_MONTHLY_DATA);
  }
  if (!localStorage.getItem(LS_NOTES)) {
    setLocal(LS_NOTES, INITIAL_NOTES);
  }
  if (!localStorage.getItem(LS_RATES)) {
    const today = new Date();
    const rates: DailyRate[] = [];
    INITIAL_APARTMENTS.forEach((apt) => {
      for (let day = 1; day <= 31; day++) {
        const d = new Date(today.getFullYear(), today.getMonth(), day);
        if (d.getMonth() === today.getMonth()) {
          const dateStr = d.toISOString().split('T')[0];
          rates.push({
            id: generateUUID(),
            apartment_id: apt.id,
            rate_date: dateStr,
            price_per_night: apt.base_price_2p,
            is_manual_override: false,
            source: 'rule',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    });
    setLocal(LS_RATES, rates);
  }
  if (!localStorage.getItem(LS_AVAIL)) {
    setLocal(LS_AVAIL, []);
  }
  if (!localStorage.getItem(LS_RATE_HISTORY)) {
    setLocal(LS_RATE_HISTORY, []);
  }
  if (!localStorage.getItem(LS_MONTHLY_HISTORY)) {
    setLocal(LS_MONTHLY_HISTORY, []);
  }
}

ensureLocalInitialized();

// ==============================================================================
// APARTMENTS API
// ==============================================================================
export async function getApartments(): Promise<Apartment[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('name');
    if (!error && data && data.length > 0) return data as Apartment[];
  }
  return getLocal<Apartment[]>(LS_APARTMENTS, INITIAL_APARTMENTS);
}

export async function updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('apartments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Apartment;
    if (error) console.error('Supabase updateApartment error:', error);
  }
  const apts = getLocal<Apartment[]>(LS_APARTMENTS, INITIAL_APARTMENTS);
  const index = apts.findIndex((a) => a.id === id);
  if (index !== -1) {
    apts[index] = { ...apts[index], ...updates, updated_at: new Date().toISOString() };
    setLocal(LS_APARTMENTS, apts);
    return apts[index];
  }
  throw new Error('Alloggio non trovato');
}

// ==============================================================================
// DAILY RATES & AVAILABILITY API
// ==============================================================================
export async function getCalendarData(apartmentId: string, startDate: string, endDate: string) {
  let rates: DailyRate[] = [];
  let availability: Availability[] = [];

  if (isSupabaseConfigured()) {
    const [ratesRes, availRes] = await Promise.all([
      supabase
        .from('daily_rates')
        .select('*')
        .eq('apartment_id', apartmentId)
        .gte('rate_date', startDate)
        .lte('rate_date', endDate),
      supabase
        .from('availability')
        .select('*')
        .eq('apartment_id', apartmentId)
        .gte('avail_date', startDate)
        .lte('avail_date', endDate),
    ]);

    if (!ratesRes.error && ratesRes.data) rates = ratesRes.data as DailyRate[];
    if (!availRes.error && availRes.data) availability = availRes.data as Availability[];

    if (!ratesRes.error && !availRes.error) {
      return { rates, availability };
    }
  }

  const allRates = getLocal<DailyRate[]>(LS_RATES, []);
  const allAvail = getLocal<Availability[]>(LS_AVAIL, []);

  rates = allRates.filter(
    (r) => r.apartment_id === apartmentId && r.rate_date >= startDate && r.rate_date <= endDate
  );
  availability = allAvail.filter(
    (a) => a.apartment_id === apartmentId && a.avail_date >= startDate && a.avail_date <= endDate
  );

  return { rates, availability };
}

export async function setDailyRate(
  apartmentId: string,
  date: string,
  price: number,
  source: 'manual' | 'bulk' = 'manual'
) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('daily_rates')
      .upsert(
        {
          apartment_id: apartmentId,
          rate_date: date,
          price_per_night: price,
          is_manual_override: true,
          source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'apartment_id, rate_date' }
      )
      .select()
      .single();
    if (!error && data) return data as DailyRate;
    if (error) console.error('Supabase setDailyRate error:', error);
  }

  const allRates = getLocal<DailyRate[]>(LS_RATES, []);
  const history = getLocal<RateHistory[]>(LS_RATE_HISTORY, []);
  const existingIdx = allRates.findIndex(
    (r) => r.apartment_id === apartmentId && r.rate_date === date
  );

  let updatedRate: DailyRate;
  if (existingIdx !== -1) {
    const oldPrice = allRates[existingIdx].price_per_night;
    updatedRate = {
      ...allRates[existingIdx],
      price_per_night: price,
      is_manual_override: true,
      source,
      updated_at: new Date().toISOString(),
    };
    allRates[existingIdx] = updatedRate;
    if (oldPrice !== price) {
      history.unshift({
        id: generateUUID(),
        apartment_id: apartmentId,
        daily_rate_id: updatedRate.id,
        rate_date: date,
        old_price: oldPrice,
        new_price: price,
        change_reason: 'Modifica manuale admin',
        changed_at: new Date().toISOString(),
      });
    }
  } else {
    updatedRate = {
      id: generateUUID(),
      apartment_id: apartmentId,
      rate_date: date,
      price_per_night: price,
      is_manual_override: true,
      source,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allRates.push(updatedRate);
  }

  setLocal(LS_RATES, allRates);
  setLocal(LS_RATE_HISTORY, history);
  return updatedRate;
}

export async function setAvailability(
  apartmentId: string,
  date: string,
  isAvailable: boolean,
  isHighDemand: boolean = false,
  notes: string = ''
) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('availability')
      .upsert(
        {
          apartment_id: apartmentId,
          avail_date: date,
          is_available: isAvailable,
          is_high_demand: isHighDemand,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'apartment_id, avail_date' }
      )
      .select()
      .single();
    if (!error && data) return data as Availability;
    if (error) console.error('Supabase setAvailability error:', error);
  }

  const allAvail = getLocal<Availability[]>(LS_AVAIL, []);
  const existingIdx = allAvail.findIndex(
    (a) => a.apartment_id === apartmentId && a.avail_date === date
  );

  let updatedAvail: Availability;
  if (existingIdx !== -1) {
    updatedAvail = {
      ...allAvail[existingIdx],
      is_available: isAvailable,
      is_high_demand: isHighDemand,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };
    allAvail[existingIdx] = updatedAvail;
  } else {
    updatedAvail = {
      id: generateUUID(),
      apartment_id: apartmentId,
      avail_date: date,
      is_available: isAvailable,
      is_high_demand: isHighDemand,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allAvail.push(updatedAvail);
  }

  setLocal(LS_AVAIL, allAvail);
  return updatedAvail;
}

export async function bulkUpdateCalendar(
  apartmentId: string,
  dates: string[],
  updates: {
    price?: number;
    is_available?: boolean;
    is_high_demand?: boolean;
    notes?: string;
  }
) {
  for (const date of dates) {
    if (updates.price !== undefined) {
      await setDailyRate(apartmentId, date, updates.price, 'bulk');
    }
    if (updates.is_available !== undefined || updates.is_high_demand !== undefined) {
      const currentAvails = getLocal<Availability[]>(LS_AVAIL, []);
      const existing = currentAvails.find(
        (a) => a.apartment_id === apartmentId && a.avail_date === date
      );
      await setAvailability(
        apartmentId,
        date,
        updates.is_available ?? existing?.is_available ?? true,
        updates.is_high_demand ?? existing?.is_high_demand ?? false,
        updates.notes ?? existing?.notes ?? ''
      );
    }
  }
  return true;
}

// ==============================================================================
// MIN STAY RULES API
// ==============================================================================
export async function getMinStayRules(): Promise<MinStayRule[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('min_stay_rules')
      .select('*')
      .order('priority', { ascending: false });
    if (!error && data) return data as MinStayRule[];
  }
  return getLocal<MinStayRule[]>(LS_MIN_STAY, INITIAL_MIN_STAY_RULES);
}

export async function createMinStayRule(rule: Omit<MinStayRule, 'id' | 'created_at' | 'updated_at'>): Promise<MinStayRule> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('min_stay_rules')
      .insert({
        apartment_id: rule.apartment_id,
        min_nights: rule.min_nights,
        start_date: rule.start_date,
        end_date: rule.end_date,
        priority: rule.priority,
        description: rule.description,
      })
      .select()
      .single();
    if (!error && data) return data as MinStayRule;
    if (error) console.error('Supabase createMinStayRule error:', error);
  }

  const newRule: MinStayRule = {
    ...rule,
    id: generateUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = getLocal<MinStayRule[]>(LS_MIN_STAY, INITIAL_MIN_STAY_RULES);
  list.unshift(newRule);
  setLocal(LS_MIN_STAY, list);
  return newRule;
}

export async function deleteMinStayRule(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    await supabase.from('min_stay_rules').delete().eq('id', id);
  }
  const list = getLocal<MinStayRule[]>(LS_MIN_STAY, INITIAL_MIN_STAY_RULES);
  setLocal(LS_MIN_STAY, list.filter((r) => r.id !== id));
  return true;
}

// ==============================================================================
// MONTHLY DATA API (Occupazione & Prezzo Medio)
// ==============================================================================
export async function getMonthlyData(): Promise<MonthlyData[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('monthly_data')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (!error && data) return data as MonthlyData[];
  }
  return getLocal<MonthlyData[]>(LS_MONTHLY, INITIAL_MONTHLY_DATA);
}

export async function upsertMonthlyData(entry: Omit<MonthlyData, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyData> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('monthly_data')
      .upsert(
        {
          apartment_id: entry.apartment_id,
          year: entry.year,
          month: entry.month,
          occupancy_percentage: entry.occupancy_percentage,
          average_price: entry.average_price,
          price_definition: entry.price_definition,
          notes: entry.notes,
          is_manual: entry.is_manual,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'apartment_id, year, month' }
      )
      .select()
      .single();
    if (!error && data) return data as MonthlyData;
    if (error) console.error('Supabase upsertMonthlyData error:', error);
  }

  const list = getLocal<MonthlyData[]>(LS_MONTHLY, INITIAL_MONTHLY_DATA);
  const history = getLocal<MonthlyDataHistory[]>(LS_MONTHLY_HISTORY, []);
  const index = list.findIndex(
    (m) => m.apartment_id === entry.apartment_id && m.year === entry.year && m.month === entry.month
  );

  let result: MonthlyData;
  if (index !== -1) {
    const old = list[index];
    result = {
      ...old,
      ...entry,
      updated_at: new Date().toISOString(),
    };
    list[index] = result;
    if (old.occupancy_percentage !== entry.occupancy_percentage || old.average_price !== entry.average_price) {
      history.unshift({
        id: generateUUID(),
        monthly_data_id: old.id,
        old_occupancy: old.occupancy_percentage,
        new_occupancy: entry.occupancy_percentage,
        old_avg_price: old.average_price,
        new_avg_price: entry.average_price,
        change_reason: 'Rettifica manuale admin',
        changed_at: new Date().toISOString(),
      });
    }
  } else {
    result = {
      ...entry,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(result);
  }

  setLocal(LS_MONTHLY, list);
  setLocal(LS_MONTHLY_HISTORY, history);
  return result;
}

export async function getMonthlyDataHistory(): Promise<MonthlyDataHistory[]> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('monthly_data_history').select('*').order('changed_at', { ascending: false });
    if (data) return data as MonthlyDataHistory[];
  }
  return getLocal<MonthlyDataHistory[]>(LS_MONTHLY_HISTORY, []);
}

// ==============================================================================
// EVENTS & NOTES API
// ==============================================================================
export async function getEvents(): Promise<EventItem[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    if (!error && data) return data as EventItem[];
  }
  return getLocal<EventItem[]>(LS_EVENTS, INITIAL_EVENTS);
}

export async function createEvent(event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        description: event.description,
        is_high_demand: event.is_high_demand,
        extra_info: event.extra_info,
      })
      .select()
      .single();
    if (!error && data) return data as EventItem;
    if (error) {
      console.error('Supabase createEvent error:', error);
      throw error;
    }
  }

  const newEvent: EventItem = {
    ...event,
    id: generateUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = getLocal<EventItem[]>(LS_EVENTS, INITIAL_EVENTS);
  list.push(newEvent);
  setLocal(LS_EVENTS, list);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
    if (!error && data) return data as EventItem;
  }
  const list = getLocal<EventItem[]>(LS_EVENTS, INITIAL_EVENTS);
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    setLocal(LS_EVENTS, list);
    return list[idx];
  }
  throw new Error('Evento non trovato');
}

export async function deleteEvent(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    await supabase.from('events').delete().eq('id', id);
  }
  const list = getLocal<EventItem[]>(LS_EVENTS, INITIAL_EVENTS);
  setLocal(LS_EVENTS, list.filter((e) => e.id !== id));
  return true;
}

export async function getNotes(): Promise<InternalNote[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as InternalNote[];
  }
  return getLocal<InternalNote[]>(LS_NOTES, INITIAL_NOTES);
}

export async function createNote(note: Omit<InternalNote, 'id' | 'created_at' | 'updated_at'>): Promise<InternalNote> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        apartment_id: note.apartment_id,
        event_id: note.event_id,
        note_date: note.note_date,
        content: note.content,
        category: note.category,
        is_private: note.is_private,
      })
      .select()
      .single();
    if (!error && data) return data as InternalNote;
    if (error) {
      console.error('Supabase createNote error:', error);
      throw error;
    }
  }

  const newNote: InternalNote = {
    ...note,
    id: generateUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = getLocal<InternalNote[]>(LS_NOTES, INITIAL_NOTES);
  list.unshift(newNote);
  setLocal(LS_NOTES, list);
  return newNote;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    await supabase.from('notes').delete().eq('id', id);
  }
  const list = getLocal<InternalNote[]>(LS_NOTES, INITIAL_NOTES);
  setLocal(LS_NOTES, list.filter((n) => n.id !== id));
  return true;
}

export async function getRateHistory(apartmentId?: string): Promise<RateHistory[]> {
  if (isSupabaseConfigured()) {
    let query = supabase.from('rate_history').select('*').order('changed_at', { ascending: false });
    if (apartmentId) query = query.eq('apartment_id', apartmentId);
    const { data } = await query;
    if (data) return data as RateHistory[];
  }
  const history = getLocal<RateHistory[]>(LS_RATE_HISTORY, []);
  if (apartmentId) return history.filter((h) => h.apartment_id === apartmentId);
  return history;
}

// ==============================================================================
// EXPORT DATA (CSV & JSON)
// ==============================================================================
export async function exportAllDataJSON(): Promise<string> {
  const [apartments, events, monthly, rules, notes, rates, history] = await Promise.all([
    getApartments(),
    getEvents(),
    getMonthlyData(),
    getMinStayRules(),
    getNotes(),
    getLocal<DailyRate[]>(LS_RATES, []),
    getRateHistory(),
  ]);

  const payload = {
    exportDate: new Date().toISOString(),
    source: 'San Raffaele Stays Admin Backup',
    data: {
      apartments,
      events,
      monthlyData: monthly,
      minStayRules: rules,
      notes,
      dailyRates: rates,
      rateHistory: history,
    },
  };

  return JSON.stringify(payload, null, 2);
}

export async function exportMonthlyDataCSV(): Promise<string> {
  const [apartments, monthly] = await Promise.all([getApartments(), getMonthlyData()]);
  const aptMap = new Map(apartments.map((a) => [a.id, a.name]));

  const headers = ['Anno', 'Mese', 'Alloggio', 'Tasso Occupazione (%)', 'Prezzo Medio (EUR)', 'Tipo Prezzo', 'Note'];
  const rows = monthly.map((m) => [
    m.year,
    m.month,
    `"${aptMap.get(m.apartment_id) || m.apartment_id}"`,
    m.occupancy_percentage,
    m.average_price,
    m.price_definition,
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}
