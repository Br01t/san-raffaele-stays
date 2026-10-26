export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Apartment {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location_description: string | null;
  services: string[];
  beds_description: string | null;
  base_price_2p: number;
  base_price_3p: number;
  base_price_4p: number;
  extra_guest_supplement: number;
  cleaning_fee: number;
  cleaning_fee_threshold_nights: number;
  max_guests: number;
  base_guests_included: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyRate {
  id: string;
  apartment_id: string;
  rate_date: string; // YYYY-MM-DD
  price_per_night: number;
  is_manual_override: boolean;
  source: 'manual' | 'rule' | 'bulk';
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  apartment_id: string;
  avail_date: string; // YYYY-MM-DD
  is_available: boolean;
  is_high_demand: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type StayRuleType = 'min_stay' | 'fee' | 'discount';
export type StayRuleAmountType = 'fixed' | 'percent';
export type StayRuleChargeBasis = 'per_stay' | 'per_night' | 'per_guest';

/**
 * Regola di soggiorno. La tabella si chiama ancora min_stay_rules per compatibilità:
 *  - min_stay: soggiorno minimo (min_nights)
 *  - fee:      costo aggiuntivo (es. pulizie) – amount, charge_basis, gratis da threshold_nights
 *  - discount: sconto fisso (€) o percentuale – amount, amount_type, valido da threshold_nights
 */
export interface MinStayRule {
  id: string;
  apartment_id: string | null;
  min_nights: number | null;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  description: string | null;
  rule_type?: StayRuleType;
  amount?: number | null;
  amount_type?: StayRuleAmountType | null;
  charge_basis?: StayRuleChargeBasis | null;
  threshold_nights?: number | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
export type StayRule = MinStayRule;

export interface MonthlyData {
  id: string;
  apartment_id: string;
  year: number;
  month: number;
  occupancy_percentage: number;
  average_price: number;
  /** Fatturato del mese in euro; null = non ancora inserito */
  revenue: number | null;
  price_definition: 'per_night' | 'per_stay';
  notes: string | null;
  is_manual: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyDataHistory {
  id: string;
  monthly_data_id: string;
  old_occupancy: number | null;
  new_occupancy: number | null;
  old_avg_price: number | null;
  new_avg_price: number | null;
  old_revenue?: number | null;
  new_revenue?: number | null;
  change_reason: string | null;
  changed_at: string;
}

export interface EventItem {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description: string | null;
  is_high_demand: boolean;
  extra_info: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  apartment_ids?: string[];
}

export interface InternalNote {
  id: string;
  apartment_id: string | null;
  event_id: string | null;
  note_date: string | null;
  content: string;
  category: 'tariff' | 'reminder' | 'maintenance' | 'general';
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateHistory {
  id: string;
  apartment_id: string;
  daily_rate_id: string | null;
  rate_date: string;
  old_price: number | null;
  new_price: number;
  change_reason: string | null;
  changed_at: string;
}

export interface SiteEvent {
  id: string;
  event_type: string;
  page_path: string;
  metadata: Record<string, unknown>;
  session_id: string | null;
  created_at: string;
}

export interface AnalyticsCache {
  id: string;
  source: 'gsc' | 'gbp';
  data_date: string;
  data: Record<string, unknown>;
  fetched_at: string;
}

export interface Database {
  public: {
    Tables: {
      apartments: {
        Row: Apartment;
        Insert: Partial<Apartment>;
        Update: Partial<Apartment>;
        Relationships: [];
      };
      daily_rates: {
        Row: DailyRate;
        Insert: Partial<DailyRate>;
        Update: Partial<DailyRate>;
        Relationships: [];
      };
      availability: {
        Row: Availability;
        Insert: Partial<Availability>;
        Update: Partial<Availability>;
        Relationships: [];
      };
      min_stay_rules: {
        Row: MinStayRule;
        Insert: Partial<MinStayRule>;
        Update: Partial<MinStayRule>;
        Relationships: [];
      };
      monthly_data: {
        Row: MonthlyData;
        Insert: Partial<MonthlyData>;
        Update: Partial<MonthlyData>;
        Relationships: [];
      };
      events: {
        Row: EventItem;
        Insert: Partial<EventItem>;
        Update: Partial<EventItem>;
        Relationships: [];
      };
      notes: {
        Row: InternalNote;
        Insert: Partial<InternalNote>;
        Update: Partial<InternalNote>;
        Relationships: [];
      };
      rate_history: {
        Row: RateHistory;
        Insert: Partial<RateHistory>;
        Update: Partial<RateHistory>;
        Relationships: [];
      };
      monthly_data_history: {
        Row: MonthlyDataHistory;
        Insert: Partial<MonthlyDataHistory>;
        Update: Partial<MonthlyDataHistory>;
        Relationships: [];
      };
      site_events: {
        Row: SiteEvent;
        Insert: Partial<SiteEvent>;
        Update: Partial<SiteEvent>;
        Relationships: [];
      };
      analytics_cache: {
        Row: AnalyticsCache;
        Insert: Partial<AnalyticsCache>;
        Update: Partial<AnalyticsCache>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
