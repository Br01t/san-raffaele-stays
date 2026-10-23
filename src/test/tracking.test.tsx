import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteTracker from "@/components/SiteTracker";
import { SiteEvent } from "@/types/database";

const read = (): SiteEvent[] => JSON.parse(localStorage.getItem("srs_site_events") || "[]");

const setup = () =>
  render(
    <MemoryRouter initialEntries={["/alloggi"]}>
      <SiteTracker />
      <a href="tel:+393457956159" data-track-label="footer_telefono">+39 345 795 6159</a>
      <a href="https://wa.me/393457956159" data-track-label="alloggi_richiedi_disponibilita" data-track-apartment="AMICI 1">
        <span>Richiedi disponibilità</span>
      </a>
      <a href="https://wa.me/393457956159" aria-label="Contattaci su WhatsApp">Contattaci</a>
      <a href="mailto:info@example.com">Scrivici</a>
      <a href="/contatti">Pagina interna</a>
    </MemoryRouter>
  );

describe("SiteTracker", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
    Object.defineProperty(navigator, "userAgent", { value: "Mozilla/5.0 (iPhone) Safari", configurable: true });
  });

  it("registra page_view, telefono, whatsapp (anche su elemento interno), email", () => {
    const { getByText } = setup();
    fireEvent.click(getByText("+39 345 795 6159"));
    fireEvent.click(getByText("Richiedi disponibilità")); // click su <span> dentro <a>
    fireEvent.click(getByText("Contattaci"));
    fireEvent.click(getByText("Scrivici"));
    fireEvent.click(getByText("Pagina interna")); // NON deve contare

    const types = read().map((e) => e.event_type).sort();
    expect(types).toEqual(["email_click", "page_view", "phone_click", "whatsapp_click", "whatsapp_click"]);

    const apt = read().find((e) => e.metadata.apartment);
    expect(apt?.metadata.label).toBe("alloggi_richiedi_disponibilita");
    expect(apt?.metadata.apartment).toBe("AMICI 1");
  });

  it("non conta due volte lo stesso click ravvicinato", () => {
    const { getByText } = setup();
    fireEvent.click(getByText("+39 345 795 6159"));
    fireEvent.click(getByText("+39 345 795 6159"));
    expect(read().filter((e) => e.event_type === "phone_click")).toHaveLength(1);
  });

  it("ignora i bot", () => {
    Object.defineProperty(navigator, "userAgent", { value: "Googlebot/2.1", configurable: true });
    const { getByText } = setup();
    fireEvent.click(getByText("+39 345 795 6159"));
    expect(read()).toHaveLength(0);
  });
});
