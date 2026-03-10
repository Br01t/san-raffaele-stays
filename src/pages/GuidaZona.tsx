import { ShoppingBag, Coffee, Trees, Pill, Bus, Building2, MapPin } from "lucide-react";

const sections = [
  {
    icon: ShoppingBag,
    title: "Supermercati",
    items: [
      "Supermercato Esselunga – raggiungibile in auto in pochi minuti",
      "Carrefour Express – all'interno del centro commerciale Milano 2",
      "Conad City – a Segrate, facilmente raggiungibile",
    ],
  },
  {
    icon: Pill,
    title: "Farmacie",
    items: [
      "Farmacia Milano 2 – a pochi passi dagli appartamenti",
      "Farmacia San Raffaele – all'interno dell'ospedale",
      "Farmacia Segrate Centro – nel centro del paese",
    ],
  },
  {
    icon: Coffee,
    title: "Ristoranti e bar",
    items: [
      "Diversi bar e caffetterie all'interno di Milano 2",
      "Ristoranti con cucina italiana e internazionale nella zona",
      "Pizzerie e ristoranti a Segrate centro",
    ],
  },
  {
    icon: Bus,
    title: "Trasporti pubblici",
    items: [
      "Autobus 923 e 925 – collegamento con metro M2 Cascina Gobba",
      "Metropolitana M2 – fermata San Raffaele e Cascina Gobba",
      "Stazione ferroviaria di Segrate – linee S5 e S6",
    ],
  },
  {
    icon: Trees,
    title: "Parchi e aree verdi",
    items: [
      "Parchi e laghetti all'interno del complesso Milano 2",
      "Percorsi pedonali e ciclabili nel verde",
      "Parco Forlanini a breve distanza",
    ],
  },
  {
    icon: Building2,
    title: "Servizi utili vicino al San Raffaele",
    items: [
      "Ospedale San Raffaele – a pochi minuti dagli appartamenti",
      "Laboratori analisi e centri diagnostici",
      "Ufficio postale e banca nella zona",
    ],
  },
];

const GuidaZona = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Guida alla zona</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Una guida utile per chi soggiorna nei nostri appartamenti a Milano 2. Tutto ciò che ti serve a portata di mano.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="bg-card rounded-xl p-6 md:p-8 card-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{s.title}</h2>
              </div>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default GuidaZona;
