import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, SiteEventType } from "@/lib/tracking";

const WHATSAPP_RE = /^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|chat\.whatsapp\.com)\/|whatsapp:)/i;

function classify(href: string): SiteEventType | null {
  const h = href.trim();
  if (/^tel:/i.test(h)) return "phone_click";
  if (/^mailto:/i.test(h)) return "email_click";
  if (WHATSAPP_RE.test(h)) return "whatsapp_click";
  return null;
}

/**
 * Tracciamento centralizzato (montato una sola volta nel Layout pubblico):
 *  - page_view a ogni cambio di pagina
 *  - clic su QUALSIASI link tel:, mailto:, wa.me / WhatsApp, presente o futuro
 *
 * Per dare un nome chiaro a un pulsante basta aggiungere
 *   data-track-label="nome_pulsante"
 * (opzionale: data-track-apartment="AMICI 1"). Se manca, usa aria-label o il testo del link.
 */
const SiteTracker = () => {
  const location = useLocation();
  const lastView = useRef<string | null>(null);
  const lastClick = useRef<{ key: string; at: number } | null>(null);

  // Page view
  useEffect(() => {
    const path = location.pathname;
    if (lastView.current === path) return;
    lastView.current = path;
    trackEvent("page_view", { referrer: document.referrer || null }, path);
  }, [location.pathname]);

  // Click su link di contatto (event delegation, fase di capture)
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      // click normale (0) e click con rotellina (1); ignora tasto destro
      if (ev.type === "auxclick" && ev.button !== 1) return;

      const target = ev.target as Element | null;
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const type = classify(href);
      if (!type) return;

      const label =
        link.dataset.trackLabel ||
        link.getAttribute("aria-label") ||
        link.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) ||
        "link";

      // anti doppio conteggio (es. click + auxclick ravvicinati sullo stesso link)
      const key = `${type}|${href}|${label}`;
      const now = Date.now();
      if (lastClick.current && lastClick.current.key === key && now - lastClick.current.at < 800) return;
      lastClick.current = { key, at: now };

      const metadata: Record<string, unknown> = { label, href };
      if (link.dataset.trackApartment) metadata.apartment = link.dataset.trackApartment;
      trackEvent(type, metadata);
    };

    document.addEventListener("click", handler, true);
    document.addEventListener("auxclick", handler, true);
    return () => {
      document.removeEventListener("click", handler, true);
      document.removeEventListener("auxclick", handler, true);
    };
  }, []);

  return null;
};

export default SiteTracker;
