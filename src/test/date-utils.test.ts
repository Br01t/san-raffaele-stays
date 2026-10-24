import { describe, it, expect } from "vitest";

// Fuso italiano: è quello in cui toISOString().split('T')[0] sbagliava il giorno
process.env.TZ = "Europe/Rome";

import { monthRange, toDateStr, groupContiguousDates } from "@/lib/date-utils";

describe("date-utils", () => {
  it("monthRange non perde il primo né l'ultimo giorno del mese (bug fuso orario)", () => {
    expect(monthRange(2026, 9)).toEqual({ start: "2026-10-01", end: "2026-10-31" });
    expect(monthRange(2027, 1)).toEqual({ start: "2027-02-01", end: "2027-02-28" });
    // il vecchio codice dava "2026-09-30" e "2026-10-30" in questo fuso
    const old = new Date(2026, 9, 1).toISOString().split("T")[0];
    expect(old).not.toBe("2026-10-01");
  });
  it("toDateStr usa la data locale", () => {
    expect(toDateStr(new Date(2026, 2, 29, 0, 30))).toBe("2026-03-29");
  });
  it("raggruppa i giorni consecutivi (anche a cavallo di mese)", () => {
    expect(groupContiguousDates(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-05", "2026-11-06"])).toEqual([
      { start: "2026-10-30", end: "2026-11-01" },
      { start: "2026-11-05", end: "2026-11-06" },
    ]);
    expect(groupContiguousDates([])).toEqual([]);
  });
});
