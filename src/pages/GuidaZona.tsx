import { ShoppingBag, Coffee, Trees, Pill, Bus, Building2, MapPin, Hospital, Home, ShieldCheck, Footprints, Bike, Camera } from "lucide-react";
import sanRaffaeleMap from "@/assets/san-raffaele-MAPPA.webp";
import laghettoImg from "@/assets/laghetto.webp";

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

const hospitalSectors = [
  "Settore A",
  "Settore B",
  "Settore C",
  "Settore Iceberg (Polo chirurgico e delle urgenze)",
  "Settore D",
  "Settore G (Ambulatori)",
  "Settore Q",
  "Settore R (Accettazione Centrale, Radiologia, Endoscopia)",
  "DiMeR (Dipartimento di Medicina Riabilitativa)",
];

const milano2Features = [
  { icon: Footprints, text: "10 km di percorsi pedonali" },
  { icon: Bike, text: "5 km di piste ciclabili" },
  { icon: Home, text: "28 residenze nel quartiere" },
  { icon: ShieldCheck, text: "Telecamere e vigilanza attiva" },
  { icon: Camera, text: "Servizio di teleallarme" },
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

    {/* Articolo Ospedale */}
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Hospital className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-primary text-2xl md:text-3xl">Come orientarsi all'interno dell'Ospedale</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-1/2 space-y-5">
            <p className="text-muted-foreground text-lg leading-relaxed">
              L'ospedale si estende su un'area di <strong className="text-foreground">300.000 m²</strong> nei pressi di Via Olgettina, sul confine tra Milano e Milano 2 a Segrate.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              L'OSR è diviso in diversi settori:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hospitalSectors.map((sector) => (
                <div key={sector} className="flex items-start gap-2 bg-card rounded-lg px-4 py-3 card-shadow">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-snug">{sector}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-muted-foreground leading-relaxed">
                Il <strong className="text-foreground">settore R</strong>, dove avviene l'accettazione, dista circa 50m dall'entrata principale di Via Olgettina, sorpassando i settori Q sulla sinistra.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vi è una seconda entrata in <strong className="text-foreground">Via Vigorelli</strong> che accede alla piazza all'interno dell'OSR.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All'interno dell'Ospedale ci sono punti ristoro, banche, agenzie viaggi e vari servizi. Le <strong className="text-foreground">linee colorate</strong> all'interno vi agevoleranno nel trovare i settori, divisi per lettera e colori.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="rounded-2xl overflow-hidden card-shadow bg-card p-3">
              <img
                src={sanRaffaeleMap}
                alt="Mappa dell'Ospedale San Raffaele"
                className="w-full h-auto rounded-xl"
              />
              <p className="text-xs text-muted-foreground text-center mt-2 pb-1">Mappa dell'Ospedale San Raffaele</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Articolo Milano 2 */}
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Trees className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-primary text-2xl md:text-3xl">Il quartiere di Milano 2. Conosciamolo!</h2>
        </div>

        <div className="flex flex-col lg:flex-row-reverse gap-10 items-start">
          <div className="w-full lg:w-1/2 space-y-5">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Milano 2 sorge a nord-est di Milano, nel comune di Segrate. Il quartiere è racchiuso tra il plesso Ospedale San Raffaele a nord, il Parco Lambro a ovest, il Golfo Agricolo a est e la strada provinciale Cassanese a sud, che lo separa dal quartiere di Lavanderie.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Il quartiere è composto da <strong className="text-foreground">28 residenze</strong> ed è stato pensato per essere vissuto secondo le esigenze di tutti i suoi residenti in maniera facile e sicura.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {milano2Features.map((f) => (
                <div key={f.text} className="flex flex-col items-center text-center bg-card rounded-xl p-4 card-shadow">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug">{f.text}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Il <strong className="text-foreground">laghetto dei cigni</strong>, da molti definito come un'oasi di bellezza e tranquillità, è il luogo simbolo del quartiere.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Molte telecamere sorvegliano le residenze e gli spazi comuni. Le abitazioni e le attività commerciali hanno a disposizione un servizio di teleallarme collegato con la vigilanza. Sono presenti 3 pulsanti di emergenza/antipanico per un rapido e pronto intervento nell'area giochi Centro Sud.
            </p>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="rounded-2xl overflow-hidden card-shadow">
              <img
                src={laghettoImg}
                alt="Il laghetto dei cigni a Milano 2"
                className="w-full h-80 lg:h-[420px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Intro servizi + griglia */}
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="container">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-card rounded-xl p-6 md:p-8 card-shadow flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-primary text-xl">{s.title}</h3>
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
