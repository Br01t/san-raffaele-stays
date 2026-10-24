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
});
