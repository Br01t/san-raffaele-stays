import { useEffect, useState } from "react";
import { Bed, Car, MapPin, Check, Sparkles, Wind, Gift } from "lucide-react";
import AmenityStrip from "@/components/AmenityStrip";
import Gallery from "@/components/Gallery";
import SEO from "@/components/SEO";
import { PublicApartmentCalendar } from "@/components/PublicApartmentCalendar";
import { INITIAL_APARTMENTS, INITIAL_MIN_STAY_RULES } from "@/lib/mock-data";
import {
  getAllPublicCalendarData,
  getApartments,
  getRateTiers,
  getStayRules,
} from "@/lib/admin-api";
import { Apartment, Availability, DailyRate, MinStayRule, RateTier } from "@/types/database";

// Amici 1 specific images
import amici1_1 from "@/assets/Screenshot 2026-03-12 alle 15.28.04.webp";
import amici1_2 from "@/assets/Screenshot 2026-03-12 alle 15.28.14.webp";
import amici1_3 from "@/assets/Screenshot 2026-03-12 alle 15.28.23.webp";
import amici1_4 from "@/assets/Screenshot 2026-03-12 alle 15.28.33.webp";
import amici1_5 from "@/assets/Screenshot 2026-03-12 alle 15.28.44.webp";
import amici1_6 from "@/assets/Screenshot 2026-03-12 alle 15.28.54.webp";
import amici1_7 from "@/assets/Screenshot 2026-03-12 alle 15.29.02.webp";
import amici1_8 from "@/assets/Screenshot 2026-03-12 alle 15.29.11.webp";

// Amici 2 specific images
import amici2_1 from "@/assets/AMICI 2 - 1.webp";
import amici2_2 from "@/assets/AMICI 2 - 2.webp";
import amici2_3 from "@/assets/AMICI 2- 3.webp";
import amici2_4 from "@/assets/AMICI 2 - 4.webp";
import amici2_5 from "@/assets/AMICI 2 - 5.webp";
import amici2_6 from "@/assets/AMICI 2 - 6.webp";

// Amici 3 specific images
import amici3_1 from "@/assets/IMG_2802.webp";
import amici3_2 from "@/assets/IMG_2804.webp";
import amici3_3 from "@/assets/IMG_2809.webp";
import amici3_4 from "@/assets/IMG_2813.webp";
import amici3_5 from "@/assets/IMG_2815.webp";
import amici3_6 from "@/assets/IMG_2820.webp";
import amici3_7 from "@/assets/IMG_2826.webp";
import amici3_8 from "@/assets/IMG_2828.webp";

interface ApartmentCardMeta {
  slug: string;
  name: string;
  locationPoints: string[];
  bedsSummary: string;
  services: string[];
  extras: string[];
  images: string[];
}

const APARTMENT_META: ApartmentCardMeta[] = [
  {
    slug: "amici-1",
    name: "AMICI 1",
    locationPoints: [
      "150 metri dall'ingresso di Via Olgettina",
      "Ospedale San Raffaele (OSR) visibile dal terrazzo",
      "Raggiungibile in 3 minuti a piedi da reparti e accettazione",
    ],
    bedsSummary: "4 Posti letto (+ 1 bambino/a) · 1 Matrimoniale, 1 Singolo, 1 Divano letto",
    services: [
      "TV",
      "ARIA CONDIZIONATA",
      "WI-FI",
      "PHON IN CAMERA",
      "CUCINA ATTREZZATA",
      "BAGNO PRIVATO",
      "DOCCIA",
      "LAVATRICE",
      "TERRAZZO",
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [amici1_1, amici1_2, amici1_3, amici1_4, amici1_5, amici1_6, amici1_7, amici1_8],
  },
  {
    slug: "amici-2",
    name: "AMICI 2",
    locationPoints: [
      "100 metri dall'ingresso di Via Olgettina",
      "Ospedale San Raffaele (OSR) visibile dal terrazzo",
      "Raggiungibile in 2 minuti a piedi da reparti e accettazione",
    ],
    bedsSummary: "4 Posti letto (+ 1 bambino/a) · 2 Matrimoniali, 1 Singolo, 1 Divano letto",
    services: [
      "TV",
      "ARIA CONDIZIONATA",
      "WI-FI",
      "PHON IN CAMERA",
      "CUCINA ATTREZZATA",
      "BAGNO PRIVATO",
      "DOCCIA",
      "LAVATRICE",
      "TERRAZZO",
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [amici2_1, amici2_2, amici2_3, amici2_4, amici2_5, amici2_6],
  },
  {
    slug: "amici-3",
    name: "AMICI 3",
    locationPoints: [
      "150 metri dall'ingresso di Via Olgettina",
      "Accanto al Supermercato Il Viaggiator Goloso",
      "Raggiungibile in 3 minuti a piedi dall'Ospedale San Raffaele",
    ],
    bedsSummary: "3 Posti letto · 1 Letto matrimoniale, 1 Letto singolo",
    services: [
      "TV",
      "ARIA CONDIZIONATA",
      "WI-FI",
      "PHON IN CAMERA",
      "CUCINA ATTREZZATA",
      "BAGNO PRIVATO",
      "DOCCIA",
      "LAVATRICE",
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [amici3_1, amici3_2, amici3_3, amici3_4, amici3_5, amici3_6, amici3_7, amici3_8],
  },
];

const Alloggi = () => {
  const [dbApartments, setDbApartments] = useState<Apartment[]>(INITIAL_APARTMENTS);
  const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [stayRules, setStayRules] = useState<MinStayRule[]>(INITIAL_MIN_STAY_RULES);
  const [rateTiers, setRateTiers] = useState<RateTier[]>([]);

  useEffect(() => {
    let active = true;
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endYear = now.getFullYear() + 1;
    const endDate = `${endYear}-12-31`;

    Promise.all([
      getApartments().catch(() => INITIAL_APARTMENTS),
      getAllPublicCalendarData(startDate, endDate).catch(() => ({
        rates: [] as DailyRate[],
        availability: [] as Availability[],
      })),
      getStayRules().catch(() => INITIAL_MIN_STAY_RULES),
      getRateTiers().catch(() => [] as RateTier[]),
    ]).then(([apts, cal, rules, tiers]) => {
      if (!active) return;
      if (apts.length > 0) setDbApartments(apts);
      setDailyRates(cal.rates);
      setAvailability(cal.availability);
      setStayRules(rules);
      setRateTiers(tiers);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Alloggio vicino San Raffaele Milano: I Nostri Appartamenti"
        description="Scopri il miglior alloggio vicino San Raffaele Milano. Appartamenti confortevoli e funzionali, l'alternativa perfetta al classico B&B San Raffaele per soggiorni di cura."
      />
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container px-4">
          <h1 className="font-display text-primary text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12">
            Alloggio vicino San Raffaele Milano: I Nostri Appartamenti
          </h1>

          <div className="space-y-10 sm:space-y-16">
            {APARTMENT_META.map((meta) => {
              const aptObj =
                dbApartments.find(
                  (a) => a.slug === meta.slug || a.name.toUpperCase() === meta.name.toUpperCase()
                ) ?? INITIAL_APARTMENTS[0];
              const servicesList =
                aptObj.services && aptObj.services.length > 0 ? aptObj.services : meta.services;

              return (
                <article
                  key={meta.name}
                  className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-teal-500/35 ring-1 ring-cyan-500/20 shadow-[0_0_32px_-4px_rgba(20,184,166,0.22)] transition-shadow"
                >
                  {/* Riga Superiore: Sinistra (Titolo + Foto + 2 Mini-card) | Destra (Calendario leggermente più in basso + 2 tasti) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* Colonna Sinistra: Titolo + Galleria + 2 Mini Card sotto le foto */}
                    <div className="flex flex-col gap-3">
                      <h2 className="font-display text-primary text-xl sm:text-2xl leading-tight">
                        {aptObj.name || meta.name}
                      </h2>

                      <div>
                        <Gallery images={meta.images} name={meta.name} />
                      </div>

                      {/* 2 Mini Card visibili sotto le immagini */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="flex items-center gap-2.5 bg-accent/60 border border-primary/15 rounded-xl px-3.5 py-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-display text-primary text-xs sm:text-sm font-semibold leading-snug">
                            Nessun costo pulizie
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 bg-accent/60 border border-primary/15 rounded-xl px-3.5 py-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-display text-primary text-xs sm:text-sm font-semibold leading-snug">
                            Notte regalo per chi si ospedalizza
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Colonna Destra: Calendario portato leggermente più in basso per allinearsi con foto e mini-card */}
                    <div className="w-full lg:mt-10">
                      <PublicApartmentCalendar
                        apartment={aptObj}
                        dailyRates={dailyRates}
                        availability={availability}
                        stayRules={stayRules}
                        rateTiers={rateTiers}
                      />
                    </div>
                  </div>

                  {/* Riga Inferiore (sotto le immagini): 2 Card Orizzontali affiancate (Ubicazione | Servizi) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/70">
                    {/* Card 1: Ubicazione schematica */}
                    <div className="bg-muted/35 rounded-xl p-4 sm:p-5 border border-border/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-display text-primary text-base sm:text-lg">
                            Ubicazione
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {meta.locationPoints.map((pt) => (
                            <li
                              key={pt}
                              className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90 leading-snug"
                            >
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card 2: Servizi e Configurazione Letti */}
                    <div className="bg-muted/35 rounded-xl p-4 sm:p-5 border border-border/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-display text-primary text-base sm:text-lg">
                            Servizi & Posti Letto
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary bg-background/80 rounded-lg px-3 py-2 border border-border/60 mb-3">
                          <Bed className="w-4 h-4 shrink-0" />
                          <span>{meta.bedsSummary}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {servicesList.map((srv) => (
                            <span
                              key={srv}
                              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium bg-background text-foreground/90 px-2.5 py-1 rounded-md border border-border/60"
                            >
                              <Check className="w-3 h-3 text-primary shrink-0" />
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <h3 className="font-display text-primary text-xl text-center mt-12 mb-6">
            Comfort degli appartamenti
          </h3>
          <AmenityStrip />

          {/* Informazioni Utili */}
          <div className="mt-20 border-t border-border pt-16">
            <div className="text-center mb-12">
              <h2 className="font-display text-primary text-2xl md:text-3xl mb-4">
                Dormire vicino San Raffaele: Informazioni Utili
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Organizzare il soggiorno per motivi medici richiede praticità. Ecco tutto quello che c'è da sapere per il tuo{" "}
                <strong>alloggio vicino San Raffaele Milano</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Pulizie */}
              <div className="bg-card rounded-2xl p-8 border border-border/60 card-shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <Wind className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-primary text-xl mb-4">Pulizie & Privacy</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ogni appartamento viene consegnato perfettamente pulito. All'interno troverai{" "}
                  <span className="text-foreground font-medium">
                    lenzuola di ricambio e accessori per la pulizia
                  </span>
                  .
                </p>
                <p className="text-muted-foreground text-xs mt-4 italic border-l-2 border-primary/20 pl-4">
                  AMICI DEL SAN RAFFAELE non esegue pulizie giornaliere per consentire il massimo rispetto della privacy e dei propri spazi.
                </p>
              </div>

              {/* Card 2: Prenotazioni */}
              <div className="bg-card rounded-2xl p-8 border border-border/60 card-shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <Bed className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-primary text-xl mb-4">Soggiorno</h3>
                <ul className="space-y-3">
                  <li className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      <span className="text-foreground font-medium">
                        Non accettiamo prenotazioni inferiori a 5 giorni.
                      </span>{" "}
                      Se hai bisogno di un soggiorno più breve, chiamaci comunque: saremo felici di consigliarti colleghi che dispongono di soluzioni più adatte alle tue esigenze.
                    </span>
                  </li>
                  <li className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>
                      Il <span className="text-foreground font-medium">check-out</span> è fissato alle ore{" "}
                      <span className="text-foreground font-medium">10:00</span>.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Pagamenti */}
              <div className="bg-card rounded-2xl p-8 border border-border/60 card-shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-primary text-xl mb-4">Conferma & Pagamento</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  È richiesto l'invio proforma di{" "}
                  <span className="text-foreground font-medium">euro 50,00</span> per confermare la prenotazione.
                </p>
                <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900">
                  <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">
                    AMICI DEL SAN RAFFAELE non richiede la carta di credito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Alloggi;
