import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- finto client Supabase che registra le chiamate ----
type Call = { table: string; op: string; rows?: unknown; opts?: { onConflict?: string } };
const calls: Call[] = [];
let respond: (c: Call) => { data: unknown; error: unknown };

function builder(table: string) {
  const state: Call = { table, op: "select" };
  const b: Record<string, unknown> = {};
  const result = () => Promise.resolve(respond({ ...state }));
  Object.assign(b, {
    upsert: (rows: unknown, opts: Call["opts"]) => { state.op = "upsert"; state.rows = rows; state.opts = opts; calls.push({ ...state }); return b; },
    insert: (rows: unknown) => { state.op = "insert"; state.rows = rows; calls.push({ ...state }); return b; },
    update: (rows: unknown) => { state.op = "update"; state.rows = rows; calls.push({ ...state }); return b; },
    delete: () => { state.op = "delete"; calls.push({ ...state }); return b; },
    select: () => b, eq: () => b, in: () => b, gte: () => b, lte: () => b, order: () => b, single: () => b,
    then: (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => result().then(res, rej),
  });
  return b;
}

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  supabase: { from: (t: string) => builder(t) },
  supabaseUrl: "https://x.supabase.co",
  supabaseAnonKey: "k",
}));

import { bulkUpdateCalendar, updateStayRule, deleteStayRule } from "@/lib/admin-api";

const APT = "a1111111-1111-1111-1111-111111111111";

beforeEach(() => {
  calls.length = 0;
  localStorage.clear();
});

describe("bulkUpdateCalendar con Supabase", () => {
  it("usa onConflict SENZA spazi e conferma le righe restituite", async () => {
    respond = (c) =>
      c.op === "upsert" && c.table === "daily_rates"
        ? { data: (c.rows as { rate_date: string; price_per_night: number }[]).map((r) => ({ ...r, id: r.rate_date })), error: null }
        : { data: [], error: null };
    const res = await bulkUpdateCalendar(APT, ["2026-10-30", "2026-10-31"], { price: 150 });
    const up = calls.find((c) => c.op === "upsert")!;
    expect(up.opts?.onConflict).toBe("apartment_id,rate_date");
    expect(res.rates).toHaveLength(2);
  });

  it("se il database dà errore, LANCIA e non salva nulla in localStorage (prima mostrava 'successo')", async () => {
    respond = () => ({ data: null, error: { message: "new row violates row-level security policy", code: "42501" } });
    await expect(bulkUpdateCalendar(APT, ["2026-10-30"], { price: 150 })).rejects.toThrow(/permesso negato/i);
    expect(localStorage.getItem("srs_daily_rates")).toBeNull();
    expect(Object.keys(localStorage).filter((k) => k.startsWith("srs_"))).toHaveLength(0);
  });

  it("se il database conferma meno righe del richiesto, segnala l'errore", async () => {
    respond = () => ({ data: [{ rate_date: "2026-10-30", price_per_night: 150 }], error: null });
    await expect(bulkUpdateCalendar(APT, ["2026-10-30", "2026-10-31"], { price: 150 })).rejects.toThrow(/1 giorni su 2/);
  });

  it("se il prezzo restituito è diverso da quello richiesto, segnala l'errore", async () => {
    respond = (c) => ({ data: (c.rows as { rate_date: string }[]).map((r) => ({ ...r, price_per_night: 90 })), error: null });
    await expect(bulkUpdateCalendar(APT, ["2026-10-30"], { price: 150 })).rejects.toThrow(/NON applicata/);
  });

  it("aggiorna la disponibilità senza perdere le note esistenti", async () => {
    respond = (c) => {
      if (c.op === "select") return { data: [{ avail_date: "2026-10-30", is_available: true, is_high_demand: true, notes: "Fiera" }], error: null };
      return { data: (c.rows as { avail_date: string }[]).map((r) => ({ ...r })), error: null };
    };
    await bulkUpdateCalendar(APT, ["2026-10-30"], { is_available: false });
    const up = calls.find((c) => c.table === "availability" && c.op === "upsert")!;
    expect(up.rows).toMatchObject([{ is_available: false, is_high_demand: true, notes: "Fiera" }]);
    expect(up.opts?.onConflict).toBe("apartment_id,avail_date");
  });
});

describe("regole di soggiorno con Supabase", () => {
  it("un update che non tocca righe (RLS) non è un successo", async () => {
    respond = () => ({ data: [], error: null });
    await expect(updateStayRule("x", { priority: 3 })).rejects.toThrow(/nessuna riga aggiornata/);
    await expect(deleteStayRule("x")).rejects.toThrow(/nessuna riga eliminata/);
  });
  it("colonna mancante: messaggio che indica la migrazione da eseguire", async () => {
    respond = () => ({ data: null, error: { message: "column min_stay_rules.rule_type does not exist", code: "42703" } });
    await expect(updateStayRule("x", { rule_type: "fee", amount: 40 })).rejects.toThrow(/20261023_stay_rules\.sql/);
  });
});
