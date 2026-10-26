import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminCalendar } from "@/pages/admin/AdminCalendar";
import { toDateStr } from "@/lib/date-utils";

// Senza chiavi Supabase la pagina lavora in modalità locale (localStorage)
const now = new Date();
const day = (d: number) => toDateStr(new Date(now.getFullYear(), now.getMonth(), d));
const APT = "a1111111-1111-1111-1111-111111111111";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    "srs_events",
    JSON.stringify([
      { id: "e1", name: "Fiera Test", start_date: day(10), end_date: day(12), description: "Stand in zona Rho", is_high_demand: true, extra_info: {}, created_at: "", updated_at: "" },
    ])
  );
  localStorage.setItem(
    "srs_notes",
    JSON.stringify([
      { id: "n1", apartment_id: APT, event_id: null, note_date: day(5), content: "Alzare il prezzo nel weekend", category: "tariff", is_private: true, created_at: "", updated_at: "" },
      { id: "n2", apartment_id: null, event_id: "e1", note_date: null, content: "Minimo 4 notti per la fiera", category: "reminder", is_private: true, created_at: "", updated_at: "" },
      { id: "n3", apartment_id: "altro-alloggio", event_id: null, note_date: day(6), content: "Nota di un altro alloggio", category: "general", is_private: true, created_at: "", updated_at: "" },
    ])
  );
});

describe("AdminCalendar", () => {
  it("mostra eventi e note come testo accanto al calendario e nella cella", async () => {
    render(
      <MemoryRouter>
        <AdminCalendar />
      </MemoryRouter>
    );
    const panel = await waitFor(() => {
      const el = screen.getByText("Eventi e note").closest("aside");
      expect(el).toBeTruthy();
      return el as HTMLElement;
    });

    await waitFor(() => expect(within(panel).getByText("Fiera Test")).toBeTruthy());
    expect(within(panel).getByText("Stand in zona Rho")).toBeTruthy();
    expect(within(panel).getByText("Alzare il prezzo nel weekend")).toBeTruthy();
    expect(within(panel).getByText("Minimo 4 notti per la fiera")).toBeTruthy(); // nota collegata all'evento
    expect(within(panel).queryByText("Nota di un altro alloggio")).toBeNull(); // altro alloggio: esclusa

    // la nota con data compare anche dentro la cella del giorno 5
    expect(screen.getAllByText("Alzare il prezzo nel weekend").length).toBeGreaterThanOrEqual(2);
    // l'avviso modalità locale è visibile
    expect(screen.getByText(/Database non collegato/)).toBeTruthy();
  });

  it("modifica prezzo in modalità locale: il nuovo prezzo si vede nel calendario, compreso l'ultimo giorno del mese", async () => {
    render(
      <MemoryRouter>
        <AdminCalendar />
      </MemoryRouter>
    );
    await screen.findAllByText("Fiera Test");
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    fireEvent.click(screen.getByText("Seleziona tutto il mese"));
    fireEvent.click(screen.getByText(/Modifica Selezionati/));
    const input = await screen.findByLabelText(/Tariffa Giornaliera/);
    fireEvent.change(input, { target: { value: "177" } });
    fireEvent.click(screen.getByText(/Applica a/));

    await waitFor(() => expect(screen.getAllByText("177 €").length).toBe(lastDay));
  });

  it("mostra le notti minime come testo accanto al calendario (non su ogni giorno) e si modificano da lì", async () => {
    render(
      <MemoryRouter>
        <AdminCalendar />
      </MemoryRouter>
    );
    const notice = await screen.findByTestId("min-stay-notice");
    expect(notice.textContent).toMatch(/prenotazione minima di 2 notti/);
    // niente più "min 2n" dentro le celle del calendario
    expect(screen.queryAllByText(/^min \d+n$/).length).toBe(0);

    fireEvent.click(within(notice).getByText("Modifica"));
    fireEvent.change(screen.getByLabelText(/prenotazione minima di/), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Salva"));

    await waitFor(() => expect(screen.getByTestId("min-stay-notice").textContent).toMatch(/prenotazione minima di 3 notti/));
    // è solo una regola per questo alloggio: la generale resta a 2
    const rules = JSON.parse(localStorage.getItem("srs_min_stay_rules") || "[]");
    expect(rules.some((r: { apartment_id: string | null; min_nights: number }) => r.apartment_id === APT && r.min_nights === 3)).toBe(true);
    expect(rules.some((r: { apartment_id: string | null; min_nights: number }) => r.apartment_id === null && r.min_nights === 2)).toBe(true);
  });

  it("i giorni disponibili sono verdi e quelli occupati sono etichettati 'Occupato'", async () => {
    render(
      <MemoryRouter>
        <AdminCalendar />
      </MemoryRouter>
    );
    await screen.findByTestId("min-stay-notice");
    expect(screen.getAllByText("Occupato").length).toBe(1); // solo la legenda: nessun giorno occupato
    expect(screen.queryByText(/Chiuso/)).toBeNull();
    const firstDay = screen.getAllByText("1").find((el) => el.className.includes("rounded-full"));
    expect(firstDay?.className).toMatch(/emerald/);
    expect(firstDay?.closest("div[class*='bg-emerald-100']")).toBeTruthy();
  });
});
