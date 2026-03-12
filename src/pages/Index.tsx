import { Link } from "react-router-dom";
import { MapPin, Home, Trees, Clock, ArrowRight, ShoppingBag, Coffee, Pill, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-apartment.jpg";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";
import laghettoImg from "@/assets/laghetto.webp";

const vantaggi = [
  { title: "Posizione Ottimale", desc: "100 Metri da via Olgettina, 60. Presenti tutti i servizi nelle vicinanze. Bar, ristoranti, farmacia e banca." },
  { title: "Ambiente Sicuro", desc: "Alloggi provvisti di tutti i servizi (Aria condizionata, Wi-fi, Tv, cucina ecc). Contatto diretto con il gestore Gabriele." },
  { title: "Servizio Transfert", desc: "Servizio diretto di trasporto da/per le stazioni e gli aeroporti. Il cliente verrà portato direttamente nell'alloggio prenotato." },
];

const apartments = [
  {
    name: "Appartamento Comfort",
    desc: "Bilocale luminoso con camera matrimoniale, cucina attrezzata e balcone. Perfetto per coppie o soggiorni singoli.",
    price: "da €55/notte",
    img: bedroomImg,
    link: "/alloggi",
  },
  {
    name: "Appartamento Family",
    desc: "Trilocale spazioso con due camere, soggiorno e cucina completa. Ideale per famiglie o soggiorni prolungati.",
    price: "da €75/notte",
    img: livingImg,
    link: "/alloggi",
  },
  {
    name: "Studio Essenziale",
    desc: "Monolocale funzionale con angolo cottura e bagno privato. La soluzione pratica ed economica.",
    price: "da €40/notte",
    img: kitchenImg,
    link: "/alloggi",
  },
];

const zonaPois = [
  { icon: Coffee, label: "Ristoranti e bar" },
  { icon: ShoppingBag, label: "Supermercati" },
  { icon: Pill, label: "Farmacie" },
  { icon: Bus, label: "Trasporti pubblici" },
];

const Index = () => (
  <>
    {/* Hero */}
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display text-primary text-3xl md:text-5xl leading-tight mb-2">
              Appartamenti
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-foreground mb-6">
              nei pressi dell'Ospedale San Raffaele!
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              AMICI DELL'OSPEDALE offre affitti a breve termine di alloggi, nelle vicinanze dell'<strong>Ospedale San Raffaele</strong>, Milano 2. I nostri appartamenti sono pensati per i parenti e i pazienti che hanno bisogno di sistemazioni comode e funzionali.
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/contatti">Contattaci</Link>
            </Button>
          </div>
          <div>
            <img
              src={laghettoImg}
              alt="Appartamento luminoso vicino all'Ospedale San Raffaele a Milano"
              className="w-full rounded-2xl shadow-lg object-cover h-72 md:h-96"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Vantaggi - circular cards style */}
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="w-full h-[620px] md:h-[680px]">
        <img
          src="https://assets.zyrosite.com/cdn-cgi/image/format=auto/A0xr56pZqkuyoQl8/sfondo-7-AR0V6pe9anhE5ZLe.jpg"
          alt="Panorama Milano 2"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Circles overlapping the image from above */}
      <div className="container absolute inset-x-0 top-0 left-1/2 -translate-x-1/2 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {vantaggi.map((v) => (
            <div key={v.title} className="flex flex-col items-center text-center">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-muted flex flex-col items-center justify-center p-8 shadow-lg">
                <h3 className="font-display text-primary text-lg md:text-xl mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Anteprima Alloggi */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="font-display text-primary text-2xl md:text-3xl text-center mb-4">I nostri appartamenti</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Spazi luminosi, arredati con cura e pronti per accoglierti.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apartments.map((apt) => (
            <div key={apt.name} className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow group">
              <div className="overflow-hidden h-56">
                <img
                  src={apt.img}
                  alt={apt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-primary text-lg mb-2">{apt.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{apt.desc}</p>
                <p className="text-primary font-semibold mb-4">{apt.price}</p>
                <Button variant="outline" size="sm" asChild className="w-full rounded-full">
                  <Link to={apt.link}>Scopri di più <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Sezione Posizione */}
    <section className="section-gradient py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-primary text-2xl md:text-3xl mb-4">La nostra posizione</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Gli appartamenti Amici dell'Ospedale si trovano a Milano 2, una zona residenziale tranquilla a pochi minuti dall'Ospedale San Raffaele, facilmente raggiungibile a piedi o con i mezzi.
            </p>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/come-raggiungerci">Come raggiungerci <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden h-72 card-shadow">
            <iframe
              title="Posizione appartamenti Milano 2"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5594.5!2d9.264!3d45.505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c7b3e0f2a6ad%3A0x2!2sOspedale+San+Raffaele!5e0!3m2!1sit!2sit!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Guida alla zona preview */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="font-display text-primary text-2xl md:text-3xl text-center mb-4">Servizi nella zona</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Milano 2 offre tutto ciò di cui hai bisogno durante il tuo soggiorno.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {zonaPois.map((p) => (
            <div key={p.label} className="bg-card rounded-2xl p-6 card-shadow text-center">
              <p.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <span className="text-sm font-medium">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/guida-zona">Leggi la guida completa <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* CTA Finale */}
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h2 className="font-display text-primary-foreground text-2xl md:text-3xl mb-4">
          Hai bisogno di un alloggio vicino al San Raffaele?
        </h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
          Contattaci per disponibilità e informazioni.
        </p>
        <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
          <Link to="/contatti">Richiedi informazioni</Link>
        </Button>
      </div>
    </section>
  </>
);

export default Index;
