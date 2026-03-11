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
        <h1 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">Guida alla zona</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Una guida utile per chi soggiorna nei nostri appartamenti a Milano 2. Tutto ciò che ti serve a portata di mano.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container">
        {/* Intro con immagine */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
          <div className="w-full md:w-1/2">
            <h2 className="font-display text-primary text-2xl md:text-3xl mb-4">Tutto a portata di mano</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Il quartiere di Milano 2 offre una vasta gamma di servizi essenziali e aree verdi curatissime, pensate per garantire il massimo comfort a chi soggiorna vicino al San Raffaele. Dalla spesa quotidiana ai trasporti, ecco i principali punti di interesse.
            </p>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden card-shadow">
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=984,h=984,fit=crop/A0xr56pZqkuyoQl8/img_1885-dWx04wb2nbu1qBDK.jpg" 
              alt="Milano 2 e dintorni" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Griglia servizi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-card rounded-xl p-6 md:p-8 card-shadow flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
              </div>
              <ul className="space-y-3 flex-grow">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
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
