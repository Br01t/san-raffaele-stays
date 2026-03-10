import { Link } from "react-router-dom";
import { MapPin, Home, Trees, Clock, ArrowRight, ShoppingBag, Coffee, Pill, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-apartment.jpg";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";

const vantaggi = [
  { icon: MapPin, title: "A pochi minuti dall'ospedale San Raffaele", desc: "Raggiungi l'ospedale a piedi o con i mezzi in pochissimi minuti." },
  { icon: Home, title: "Appartamenti completamente arredati", desc: "Cucina attrezzata, Wi-Fi, biancheria e tutto il necessario per il tuo soggiorno." },
  { icon: Trees, title: "Zona tranquilla e verde", desc: "Milano 2 è un quartiere residenziale immerso nel verde, ideale per rilassarsi." },
  { icon: Clock, title: "Ideale per soggiorni temporanei", desc: "Affitti flessibili da pochi giorni a diversi mesi, senza vincoli." },
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Appartamento luminoso vicino all'Ospedale San Raffaele a Milano" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <div className="relative container py-24 md:py-36 lg:py-44 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in">
          Alloggi vicino all'Ospedale<br />San Raffaele
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          Appartamenti confortevoli a Milano 2 ideali per pazienti, familiari e medici.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" asChild>
            <Link to="/alloggi">Scopri gli alloggi <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20" asChild>
            <Link to="/contatti">Contattaci</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Vantaggi */}
    <section className="section-gradient py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Perché scegliere Amici dell'Ospedale</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Un punto di appoggio sicuro e confortevole durante i momenti più importanti.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vantaggi.map((v) => (
            <div key={v.title} className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Anteprima Alloggi */}
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">I nostri appartamenti</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Spazi luminosi, arredati con cura e pronti per accoglierti.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apartments.map((apt) => (
            <div key={apt.name} className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow group">
              <div className="overflow-hidden h-56">
                <img
                  src={apt.img}
                  alt={apt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{apt.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{apt.desc}</p>
                <p className="text-primary font-semibold mb-4">{apt.price}</p>
                <Button variant="outline" size="sm" asChild className="w-full">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">La nostra posizione</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Gli appartamenti Amici dell'Ospedale si trovano a Milano 2, una zona residenziale tranquilla a pochi minuti dall'Ospedale San Raffaele, facilmente raggiungibile a piedi o con i mezzi.
            </p>
            <Button variant="outline" asChild>
              <Link to="/come-raggiungerci">Come raggiungerci <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden h-72 card-shadow">
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
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Servizi nella zona</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Milano 2 offre tutto ciò di cui hai bisogno durante il tuo soggiorno.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {zonaPois.map((p) => (
            <div key={p.label} className="bg-card rounded-xl p-6 card-shadow text-center">
              <p.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <span className="text-sm font-medium">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/guida-zona">Leggi la guida completa <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* CTA Finale */}
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
          Hai bisogno di un alloggio vicino al San Raffaele?
        </h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
          Contattaci per disponibilità e informazioni.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link to="/contatti">Richiedi informazioni</Link>
        </Button>
      </div>
    </section>
  </>
);

export default Index;
