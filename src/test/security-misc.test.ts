import { describe, it, expect } from "vitest";
import { csvCell } from "@/lib/admin-api";
import { summarizeEvents } from "@/lib/tracking";
import { SiteEvent } from "@/types/database";

describe("CSV injection", () => {
  it("neutralizza formule e raddoppia le virgolette", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(csvCell("+39 345")).toBe("\"'+39 345\"");
    expect(csvCell("-1+1")).toBe("\"'-1+1\"");
    expect(csvCell("@SUM(A1)")).toBe("\"'@SUM(A1)\"");
    expect(csvCell("Nota normale")).toBe('"Nota normale"');
    expect(csvCell(null)).toBe('""');
  });
});

describe("riepilogo statistiche (modalità locale)", () => {
  it("raggruppa per tipo, pagina, pulsante e alloggio", () => {
    const ev = (event_type: string, page_path: string, metadata: Record<string, unknown> = {}) =>
      ({ id: Math.random().toString(), event_type, page_path, metadata, session_id: "s", created_at: "2026-01-01" }) as SiteEvent;
    const rows = summarizeEvents([
      ev("page_view", "/"), ev("page_view", "/"), ev("page_view", "/alloggi"),
      ev("whatsapp_click", "/alloggi", { label: "alloggi_richiedi_disponibilita", apartment: "AMICI 1" }),
      ev("whatsapp_click", "/alloggi", { label: "alloggi_richiedi_disponibilita", apartment: "AMICI 1" }),
      ev("whatsapp_click", "/alloggi", { label: "alloggi_richiedi_disponibilita", apartment: "AMICI 2" }),
      ev("form_submit", "/contatti", { form: "contatti" }),
    ]);
    const find = (t: string, p: string, a: string | null = null) => rows.find((r) => r.event_type === t && r.page_path === p && r.apartment === a);
    expect(find("page_view", "/")?.cnt).toBe(2);
    expect(find("whatsapp_click", "/alloggi", "AMICI 1")?.cnt).toBe(2);
    expect(find("whatsapp_click", "/alloggi", "AMICI 2")?.cnt).toBe(1);
    expect(find("form_submit", "/contatti")?.label).toBe("contatti");
  });
});
