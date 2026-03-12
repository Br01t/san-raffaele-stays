import { Link } from "react-router-dom";
import { MapPin, Home, Trees, Clock, ArrowRight, ShoppingBag, Coffee, Pill, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-apartment.jpg";
import milano2Img from "@/assets/foto milano 2 .webp";
import AmenityStrip from "@/components/AmenityStrip";
import amici2_1 from "@/assets/AMICI 2 - 1.webp";
import amici3_1 from "@/assets/IMG_2802.webp";
import amici1_1 from "@/assets/Screenshot 2026-03-12 alle 15.28.04.webp";
import gestoreImg from "@/assets/foto VISO PERSONALE.webp";

const vantaggi = [
  { title: "Posizione Ottimale", desc: "100 Metri da via Olgettina, 60. Presenti tutti i servizi nelle vicinanze. Bar, ristoranti, farmacia e banca." },
  { title: "Ambiente Sicuro", desc: "Alloggi provvisti di tutti i servizi (Aria condizionata, Wi-fi, Tv, cucina ecc). Contatto diretto con il gestore Gabriele." },
  { title: "Servizio Transfert", desc: "Servizio diretto di trasporto da/per le stazioni e gli aeroporti. Il cliente verrà portato direttamente nell'alloggio prenotato." },
];

const apartments = [
  {
    name: "Amici 1",
    desc: "Bilocale luminoso con camera matrimoniale e cucina attrezzata. Perfetto per soggiorni singoli o di coppia.",
    price: "da €80/notte",
    img: amici1_1,
    link: "/alloggi",
  },
  {
    name: "Amici 2",
    desc: "Trilocale spazioso con terrazzo vista Ospedale. Ideale per famiglie o soggiorni prolungati.",
    price: "da €90/notte",
    img: amici2_1,
    link: "/alloggi",
  },
  {
    name: "Amici 3",
    desc: "Monolocale moderno e funzionale con tutti i comfort. La soluzione pratica per brevi soggiorni.",
    price: "da €75/notte",
    img: amici3_1,
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
    <section className="bg-background pt-10 sm:pt-16 md:pt-8">
      <div className="container px-4 text-center mb-8 sm:mb-12">
        <h1 className="font-display text-primary text-3xl sm:text-4xl md:text-5xl leading-tight mb-10 max-w-2xl mx-auto">
          Appartamenti nei pressi dell'Ospedale San Raffaele
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
          <b>AMICI DELL'OSPEDALE</b> offre affitti a breve termine di alloggi, nelle vicinanze dell'<strong>Ospedale San Raffaele</strong>, Milano 2. I nostri appartamenti sono pensati per i parenti e i pazienti che hanno bisogno di sistemazioni comode e funzionali.
        </p>
        <Button size="lg" asChild className="rounded-full px-8">
          <Link to="/contatti">Contattaci</Link>
        </Button>
      </div>
      {/* Full-width panoramic image */}
      <div className="w-full h-56 sm:h-72 md:h-[420px] overflow-hidden">
        <img
          src={milano2Img}
          alt="Vista di Milano 2 - Appartamenti vicino Ospedale San Raffaele"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </section>


    {/* Vantaggi */}
    <section className="relative min-h-0 md:min-h-[700px]">
      {/* Background image fills the entire section */}
      <div className="absolute inset-0">
        <img
          src="https://assets.zyrosite.com/cdn-cgi/image/format=auto/A0xr56pZqkuyoQl8/sfondo-7-AR0V6pe9anhE5ZLe.jpg"
          alt="Panorama Milano 2"
          className="w-full h-full object-cover object-center"
        />
      </div>
      {/* Circles at the top; on desktop the section is taller so background shows below */}
      <div className="relative container px-4 py-10 md:pt-14 md:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
    <section className="py-10 sm:py-16 md:py-24 bg-background">
      <div className="container px-4">
        <h2 className="font-display text-primary text-xl sm:text-2xl md:text-3xl text-center mb-3 md:mb-4">I NOSTRI APPARTAMENTI</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base">
          Spazi luminosi, arredati con cura e pronti per accoglierti.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {apartments.map((apt) => (
            <div key={apt.name} className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow group">
              <div className="overflow-hidden h-48 sm:h-56">
                <img
                  src={apt.img}
                  alt={apt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-display text-primary text-base sm:text-lg mb-2">{apt.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{apt.desc}</p>
                <p className="text-primary font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{apt.price}</p>
                <Button variant="outline" size="sm" asChild className="w-full rounded-full">
                  <Link to={apt.link}>Scopri di più <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <AmenityStrip />
      </div>
    </section>

    {/* Sezione Posizione */}
    <section className="section-gradient py-16 md:py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
          <h2 className="font-display text-primary text-2xl md:text-3xl mb-4 text-center">LA NOSTRA POSIZIONE</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Gli appartamenti Amici dell'Ospedale si trovano a Milano 2, una zona residenziale tranquilla a pochi minuti dall'Ospedale San Raffaele, facilmente raggiungibile a piedi o con i mezzi.
          </p>
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/come-raggiungerci">Come raggiungerci <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="rounded-2xl overflow-hidden h-72 sm:h-80 md:h-[400px] card-shadow max-w-4xl mx-auto">
          <iframe
            title="Posizione appartamenti Milano 2"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.390195682343!2d9.266786299999998!3d45.5022233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c71d2fe74f4d%3A0x89a6a46181c3d221!2sAmici%20dell'Ospedale%20Appartamenti%20B%26B!5e0!3m2!1sit!2sit!4v1773334327379!5m2!1sit!2sit"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>

    {/* Guida alla zona preview */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <h2 className="font-display text-primary text-2xl md:text-3xl text-center mb-4">SERVIZI NELLA ZONA</h2>
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
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center">
          <div className="text-center md:text-left max-w-lg">
            <h2 className="font-display text-primary-foreground text-2xl md:text-3xl mb-4">
              Hai bisogno di un alloggio vicino al San Raffaele?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Contattaci per disponibilità e informazioni. Gabriele sarà felice di aiutarvi.
            </p>
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
              <Link to="/contatti">Richiedi informazioni</Link>
            </Button>
          </div>
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0">
            <img 
              src={gestoreImg} 
              alt="Il gestore Gabriele" 
              className="w-full h-full object-cover rounded-full shadow-xl border-4 border-background/20"
            />
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Index;
