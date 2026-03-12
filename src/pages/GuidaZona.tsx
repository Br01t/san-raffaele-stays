import { ShoppingBag, Coffee, Trees, Pill, Bus, Building2, MapPin, Hospital, Home, ShieldCheck, Footprints, Bike, Camera, X } from "lucide-react";
import sanRaffaeleMap from "@/assets/san-raffaele-MAPPA.webp";
import researchImg from "@/assets/ospande-san-raffaele-research-department-.webp";
import laghettoImg from "@/assets/laghetto.webp";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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

    {/* Quick Navigation Menu */}
    <nav className="bg-background py-8 border-b border-border">
      <div className="container max-w-2xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="#ospedale" 
            className="flex items-center gap-4 p-4 rounded-2xl bg-accent/50 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider font-bold text-primary/70">Scopri L'</p>
              <p className="font-display text-primary font-bold">Ospedale S. Raffaele</p>
            </div>
          </a>
          
          <a 
            href="#quartiere" 
            className="flex items-center gap-4 p-4 rounded-2xl bg-accent/50 border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Trees className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider font-bold text-primary/70">Il Quartiere &</p>
              <p className="font-display text-primary font-bold">I Servizi di Milano 2</p>
            </div>
          </a>
        </div>
      </div>
    </nav>

    {/* Articolo Ospedale */}
    <section id="ospedale" className="py-16 md:py-24 bg-accent/30 scroll-mt-20">
      <div className="container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Hospital className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-primary text-2xl md:text-3xl">Come orientarsi all'interno dell'Ospedale</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Colonna Informata */}
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-muted-foreground text-lg leading-relaxed">
                L'ospedale si estende su un'area di <strong className="text-foreground">300.000 m²</strong> nei pressi di Via Olgettina, sul confine tra Milano e Milano 2 a Segrate.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                L'OSR è diviso in diversi settori, facilmente identificabili grazie a un sistema di colori e lettere.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {hospitalSectors.map((sector) => (
                <div key={sector} className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border border-primary/10 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-[11px] font-medium text-muted-foreground truncate">{sector}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-primary/5 rounded-2xl p-5 border border-primary/10 flex flex-col justify-center">
                <h4 className="font-display text-primary font-semibold text-sm mb-2">Consigli Utili</h4>
                <div className="space-y-2">
                  <p className="text-[13px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                    "Il settore R dista circa 50m dall'entrata di Via Olgettina."
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed pl-3">
                    Segui le linee colorate sul pavimento per orientarti.
                  </p>
                </div>
              </div>
              
                <div className="md:col-span-1 rounded-2xl overflow-hidden card-shadow bg-card p-1 border border-primary/5 flex items-center justify-center aspect-square md:aspect-auto">
                <img
                  src={researchImg}
                  alt="Dipartimento Ricerca Ospedale San Raffaele"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Colonna Mappa */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-[2.5rem] overflow-hidden card-shadow bg-card p-2.5 cursor-pointer group relative border border-white/20" aria-label="Ingrandisci mappa ospedale">
                  <img
                    src={sanRaffaeleMap}
                    alt="Mappa settori e reparti dell'Ospedale San Raffaele - Visualizzazione orientativa"
                    className="w-full h-auto rounded-[2rem] group-hover:scale-[1.02] transition-transform duration-1000 ease-in-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white/90 text-primary text-xs font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <Hospital className="w-4 h-4" aria-hidden="true" /> INGRANDISCI MAPPA
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-none bg-black/95 shadow-none flex items-center justify-center [&>button]:hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <DialogPrimitive.Close className="absolute top-6 right-6 z-[60] bg-white text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-all shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Chiudi mappa ospedale">
                    <X className="h-6 w-6" aria-hidden="true" />
                  </DialogPrimitive.Close>
                  <img
                    src={sanRaffaeleMap}
                    alt="Mappa Ospedale San Raffaele Ingrandita"
                    className="max-w-full max-h-[92vh] object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex justify-center mt-6">
              <span className="px-4 py-1.5 rounded-full bg-accent/50 text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold border border-primary/5">
                Planimetria Generale OSR
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
          {/* Sezione Unificata: Il Quartiere e i suoi Servizi */}
    <section id="quartiere" className="py-16 md:py-24 overflow-hidden scroll-mt-20">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Trees className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="font-display text-primary text-2xl md:text-3xl font-bold">Vivere a Milano 2: Un'Oasi di Servizi</h2>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Soggiornare a Milano 2 significa immergersi in un quartiere pensato per il benessere e la comodità. Racchiuso tra il Parco Lambro e l'Ospedale San Raffaele, offre un'esperienza unica dove la natura incontra l'efficienza urbana.
            </p>
            
            <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
              "Il <strong className="text-foreground">laghetto dei cigni</strong> è il cuore pulsante del quartiere, perfetto per momenti di relax tra una visita e l'altra."
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {milano2Features.map((f) => (
                <div key={f.text} className="flex flex-col items-center text-center bg-card rounded-2xl p-4 card-shadow border border-primary/5 hover:bg-primary/5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 leading-tight">{f.text}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Dalla spesa quotidiana ai trasporti, tutto è a portata di mano. Il quartiere è sicuro e monitorato, ideale per chi cerca tranquillità senza rinunciare ai servizi essenziali.
            </p>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden card-shadow transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                <img
                  src={laghettoImg}
                  alt="Il laghetto dei cigni a Milano 2 - Oasi di pace a Segrate"
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-3xl overflow-hidden card-shadow transform rotate-2 hover:rotate-0 transition-transform duration-700 mt-8">
                <img
                  src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=984,h=984,fit=crop/A0xr56pZqkuyoQl8/img_1885-dWx04wb2nbu1qBDK.jpg"
                  alt="Architettura caratteristica di Milano 2"
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Badge Decorativo */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-2xl hidden md:block border border-primary/5 max-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary italic">Tutto quello che ti serve</p>
                  <p className="text-[10px] text-muted-foreground uppercase">A portata di mano</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Griglia Servizi Integrata */}
        <div className="bg-accent/30 rounded-[3rem] p-8 md:p-12 border border-primary/5">
          <div className="text-center mb-12">
            <h3 className="font-display text-primary text-xl md:text-2xl font-bold mb-2">I Servizi del Quartiere</h3>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Ecco i principali punti di interesse e servizi fondamentali situati a pochi passi dal tuo alloggio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((s) => (
              <div key={s.title} className="bg-card rounded-2xl p-6 md:p-8 card-shadow flex flex-col h-full hover:-translate-y-2 transition-transform duration-500 border border-primary/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-primary text-lg font-bold">{s.title}</h3>
                </div>
                <ul className="space-y-3 flex-grow">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground group">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default GuidaZona;
