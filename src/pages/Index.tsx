import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Home, Trees, Clock, ArrowRight, ShoppingBag, Coffee, Pill, Bus, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-apartment.jpg";
import milano2Img from "@/assets/foto milano 2 .webp";
import AmenityStrip from "@/components/AmenityStrip";
import amici2_1 from "@/assets/AMICI 2 - 1.webp";
import amici3_1 from "@/assets/IMG_2802.webp";
import amici1_1 from "@/assets/Screenshot 2026-03-12 alle 15.28.04.webp";
import gestoreImg from "@/assets/foto VISO PERSONALE.webp";
import SEO from "@/components/SEO";
import sfondoZyro from "@/assets/sfondo-7-AR0V6pe9anhE5ZLe.webp";
import LazyMap from "@/components/LazyMap";

const vantaggi = [
  { title: "Posizione Ottimale", desc: "100 Metri da via Olgettina, 60. Presenti tutti i servizi nelle vicinanze. Bar, ristoranti, farmacia e banca." },
  { title: "Ambiente Sicuro", desc: "Alloggi provvisti di tutti i servizi (Aria condizionata, Wi-fi, Tv, cucina ecc). Contatto diretto con il gestore Gabriele." },
  { title: "Servizio Transfert", desc: "Servizio diretto di trasporto da/per le stazioni e gli aeroporti. Il cliente verrà portato direttamente nell'alloggio prenotato." },
];

const apartments = [
  {
    name: "AMICI 1",
    desc: "Bilocale luminoso con terrazzo, camera matrimoniale, letto singolo, divano letto e cucina completamente attrezzata. Perfetto per soggiorni familiari, di coppia o per chi viaggia da solo.",
    price: "da €90/notte",
    distance: "150m da via Olgettina",
    img: amici1_1,
    link: "/alloggi",
  },
  {
    name: "AMICI 2",
    desc: "Bilocale molto spazioso con terrazzo e vista sull’Ospedale. Dispone di una camera padronale con letto matrimoniale e di un secondo letto matrimoniale separato nel soggiorno. Ideale per famiglie e per soggiorni prolungati.",
    price: "da €90/notte",
    distance: "100m da via Olgettina",
    img: amici2_1,
    link: "/alloggi",
  },
  {
    name: "AMICI 3",
    desc: "Bilocale moderno e funzionale con tutti i comfort. Una soluzione pratica e accogliente per brevi soggiorni, a soli 150 metri da via Olgettina e dall’Ospedale San Raffaele.",
    price: "da €90/notte",
    distance: "150m da via Olgettina",
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

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quanto distano gli appartamenti dall'Ospedale San Raffaele?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tutti i nostri appartamenti distano circa 150 metri dall'ingresso dell'Ospedale San Raffaele, raggiungibile in 3 minuti a piedi."
        }
      },
      {
        "@type": "Question",
        "name": "I vostri alloggi offrono il servizio navetta per la stazione e l'aeroporto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sì, offriamo un servizio diretto di trasporto da/per le stazioni ferroviarie e gli aeroporti. Il cliente verrà accompagnato direttamente nell'alloggio."
        }
      },
      {
        "@type": "Question",
        "name": "Quali servizi sono inclusi nell'affitto dell'appartamento?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gli appartamenti includono aria condizionata, Wi-Fi, televisione, cucina completamente attrezzata, lavatrice e contatto diretto con il gestore."
        }
      }
    ]
  };

  return (
    <>
      {/* Hero */}
      <SEO 
        title="Appartamenti e Alloggi vicino San Raffaele Milano" 
        description="Cerchi un alloggio vicino al San Raffaele Milano? Amici del San Raffaele offre appartamenti vicino al San Raffaele, ideali per dormire vicino all'ospedale. B&B San Raffaele con tutti i comfort." 
        schema={JSON.stringify(faqSchema)}
      />
      <section className="bg-background pt-10 sm:pt-16 md:pt-8">
        <div className="container px-4 text-center mb-8 sm:mb-12">
          <h1 className="font-display text-primary text-3xl sm:text-4xl md:text-5xl leading-tight mb-10 max-w-2xl mx-auto">
            Appartamenti e Alloggi vicino San Raffaele Milano
          </h1>
          <p className="text-lg sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
            Appartamenti a <b>150 metri dall Ospedale San Raffaele</b> ideali per pazienti e familiari.
          </p>

          <Button size="lg" asChild className="rounded-full px-8">
            <a href="https://wa.me/393486065567" target="_blank" rel="noopener noreferrer" aria-label="Contattaci su WhatsApp">Contattaci</a>
          </Button>
        </div>
        {/* Full-width panoramic image */}
        <div className="w-full h-56 sm:h-72 md:h-[420px] overflow-hidden">
          <img
            src={milano2Img}
            alt="Panorama di Milano 2 - Zona Residenziale Ospedale San Raffaele"
            className="w-full h-full object-cover object-center"
            fetchPriority="high"
          />
        </div>
      </section>


      {/* Vantaggi */}
      <section className="relative min-h-0 md:min-h-[700px]">
        {/* Background image fills the entire section */}
        <div className="absolute inset-0">
          <img
            src={sfondoZyro}
            alt="Sfondo panoramico Milano 2"
            className="w-full h-full object-cover object-center"
            loading="lazy"
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
          <h2 className="font-display text-primary text-xl sm:text-2xl md:text-3xl text-center mb-3 md:mb-4">Dormire vicino San Raffaele: Le Nostre Soluzioni</h2>

          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base">
            Spazi luminosi, arredati con cura e pronti per accoglierti. Tutti i nostri appartamenti si trovano a circa <span className="text-primary font-bold">150 metri a piedi</span> dall'ingresso dell'Ospedale San Raffaele.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {apartments.map((apt) => (
              <article key={apt.name} className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow group">
                <div className="overflow-hidden h-48 sm:h-56">
                  <img
                    src={apt.img}
                    alt={`Appartamento ${apt.name} - Anteprima`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-display text-primary text-base sm:text-lg mb-2">{apt.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{apt.desc}</p>
                  <p className="text-primary font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                    {apt.price} <span className="text-xs sm:text-sm text-muted-foreground font-normal ml-2">— {apt.distance}</span>
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full rounded-full">
                    <Link to={apt.link} aria-label={`Scopri di più su ${apt.name}`}>Scopri di più <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" /></Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <h3 className="font-display text-primary text-xl text-center mt-12 mb-6">
            Comfort degli appartamenti
          </h3>
          <AmenityStrip />
        </div>
      </section>

      {/* Sezione Posizione */}
      <section className="section-gradient py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="font-display text-primary text-2xl md:text-3xl mb-8 text-center">La nostra posizione</h2>
            <p className="text-muted-foreground font-medium mb-6 flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <span>✅ 3 minuti a piedi dall'ospedale</span>
              <span>✅ zona tranquilla</span>
              <span>✅ assistenza per arrivare in ospedale + mappa</span>
            </p>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/come-raggiungerci" aria-label="Visualizza indicazioni stradali">Come raggiungerci <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden h-72 sm:h-80 md:h-[400px] card-shadow max-w-4xl mx-auto">
            <LazyMap
              title="Mappa posizione appartamenti Milano 2"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.390195682343!2d9.266786299999998!3d45.5022233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c71d2fe74f4d%3A0x89a6a46181c3d221!2sAmici%20dell'Ospedale%20Appartamenti%20B%26B!5e0!3m2!1sit!2sit!4v1773334327379!5m2!1sit!2sit"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Guida alla zona preview */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <h2 className="font-display text-primary text-2xl md:text-3xl text-center mb-4">Guida alla zona</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Milano 2 offre tutto ciò di cui hai bisogno durante il tuo soggiorno.
          </p>
          <div className="flex flex-wrap justify-center gap-10 mb-8">
            {zonaPois.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-muted-foreground">
                <p.icon className="w-5 h-5 text-primary" />
                <span className="text-sm">{p.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center pb-12 sm:pb-16 md:pb-24">
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/guida-zona" aria-label="Leggi la guida completa alla zona">Leggi la guida completa <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" /></Link>
            </Button>
          </div>

          {/* Nuova Sezione Recensioni */}
          <div className="border-t border-border pt-16 md:pt-24 lg:pt-32">
            <div className="text-center mb-16">
              <h2 className="font-display text-primary text-2xl md:text-3xl text-center mb-4">Recensioni</h2>
              <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" aria-hidden="true" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-16 md:mb-24 px-4">
              {[
                { value: "4.9", label: "Valutazione media" },
                { value: "200+", label: "Ospiti accolti" },
                { value: "98%", label: "Consiglia" },
                { value: "10+", label: "Anni di esperienza" },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <p className="font-display text-primary text-3xl md:text-5xl mb-2 group-hover:scale-110 transition-transform duration-500">{stat.value}</p>
                  <div className="w-8 h-0.5 bg-primary/20 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Reviews Slider */}
            <div className="relative group/slider -mx-6 sm:mx-0 px-0 sm:px-12">
              <div className="text-center mb-12 px-6 sm:px-0">
                <h3 className="font-display text-primary text-xl md:text-2xl mb-4 italic">"Cosa dicono i nostri ospiti"</h3>
              </div>
              
              <div className="relative max-w-6xl mx-auto">
                {/* Navigation Arrows */}
                <button 
                  onClick={() => scroll("left")}
                  className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-xl border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex"
                  aria-label="Recensioni precedenti"
                >
                  <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                </button>
                
                <button 
                  onClick={() => scroll("right")}
                  className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-xl border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden sm:flex"
                  aria-label="Recensioni successive"
                >
                  <ChevronRight className="w-6 h-6" aria-hidden="true" />
                </button>

                <div 
                  ref={scrollRef}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-12 px-6 sm:px-0 scrollbar-hide no-scrollbar scroll-smooth"
                >
                  {[
                    {
                      name: "Maria R.",
                      date: "Febbraio 2026",
                      text: "Abbiamo soggiornato per due settimane durante il ricovero di mio padre. L'appartamento era pulito, accogliente e vicinissimo all'ospedale. Gabriele è stato disponibilissimo e ci ha aiutato con tutto. Consigliatissimo!",
                    },
                    {
                      name: "Giuseppe T.",
                      date: "Gennaio 2026",
                      text: "Ottima posizione, a pochi passi dal San Raffaele. L'appartamento ha tutto il necessario: cucina attrezzata, Wi-Fi, aria condizionata. Il servizio di trasferimento dall'aeroporto è stato molto comodo.",
                    },
                    {
                      name: "Lucia M.",
                      date: "Dicembre 2025",
                      text: "Ho trovato questo alloggio durante un periodo difficile e devo dire che ha reso tutto più sopportabile. La zona è tranquilla, l'appartamento confortevole e il gestore sempre reperibile. Grazie di cuore.",
                    },
                    {
                      name: "Franco B.",
                      date: "Novembre 2025",
                      text: "Soggiorno di una settimana per accompagnare mia moglie in day hospital. L'appartamento è esattamente come nelle foto, pulito e ben organizzato. La vicinanza all'ospedale è il punto forte.",
                    },
                    {
                      name: "Anna P.",
                      date: "Ottobre 2025",
                      text: "Struttura eccellente per chi deve stare vicino al San Raffaele. Abbiamo apprezzato la pulizia, la tranquillità della zona e soprattutto la gentilezza di Gabriele. Torneremo sicuramente.",
                    },
                    {
                        name: "Elena G.",
                        date: "Settembre 2025",
                        text: "Appartamento moderno e molto funzionale. Il signor Gabriele ci ha accolto con estrema cortesia nonostante l'ora tarda. Essere a 5 minuti dal San Raffaele ci ha tolto un grande stress.",
                    },
                    {
                      name: "Roberto C.",
                      date: "Settembre 2025",
                      text: "Prezzo onesto, posizione perfetta e appartamento con tutti i comfort. Il quartiere di Milano 2 è bellissimo, con parchi e servizi a portata di mano. Lo consiglio a tutti.",
                    },
                    {
                        name: "Salvatore I.",
                        date: "Settembre 2025",
                        text: "Alloggio perfetto per chi deve frequentare l'ospedale. Zona silenziosa, letti comodi e cucina ben fornita. Abbiamo apprezzato molto la posizione strategica e la disponibilità dello staff.",
                    },
                    {
                      name: "Silvana D.",
                      date: "Agosto 2025",
                      text: "Abbiamo soggiornato per un mese intero. L'appartamento è diventato la nostra seconda casa. Cucina completa, lavatrice, terrazzo con vista. Il gestore ci ha fatto sentire a casa.",
                    },
                    {
                        name: "Carla S.",
                        date: "Luglio 2025",
                        text: "L'alloggio era impeccabile. La biancheria profumata e la dotazione della cucina davvero completa. Gabriele ci ha dato ottimi consigli sulla zona e sui trasporti. Un riferimento prezioso.",
                    },
                    {
                      name: "Marco L.",
                      date: "Luglio 2025",
                      text: "Soluzione pratica e conveniente rispetto agli hotel della zona. L'appartamento è semplice ma ha tutto ciò che serve. La posizione vicino all'ospedale è imbattibile.",
                    },
                    {
                        name: "Paola V.",
                        date: "Giugno 2025",
                        text: "Cercavamo tranquillità e praticità, e qui abbiamo trovato entrambe. L'appartamento è molto luminoso e arieggiato. Poter andare a piedi in ospedale è stato un vantaggio enorme.",
                    }
                  ].map((review, i) => (
                    <article 
                      key={i}
                      className="min-w-[85vw] sm:min-w-[400px] md:min-w-[450px] snap-center bg-card rounded-[2rem] p-6 sm:p-8 md:p-10 card-shadow border border-primary/5 flex flex-col h-full hover:border-primary/20 transition-all duration-500"
                    >
                      <Quote className="w-8 h-8 sm:w-12 sm:h-12 text-primary/10 mb-4 sm:mb-6 shrink-0" aria-hidden="true" />
                      <blockquote className="text-muted-foreground leading-relaxed italic mb-8 sm:mb-10 flex-grow text-base sm:text-lg">
                        "{review.text}"
                      </blockquote>
                      <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-auto">
                        <cite className="flex items-center gap-4 not-italic">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-primary">{review.name}</p>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">{review.date}</p>
                          </div>
                        </cite>
                        <div className="flex gap-0.5" aria-label={`Valutazione 5 stelle`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-primary text-primary" aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="hero-gradient py-16 md:py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center">
            <div className="text-center md:text-left max-w-lg">
              <h2 className="font-display text-primary-foreground text-2xl md:text-3xl mb-4 uppercase">
                Hai bisogno di un alloggio vicino al San Raffaele?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Contattaci per disponibilità e informazioni. Gabriele sarà felice di aiutarvi.
              </p>
              <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
                <a href="https://wa.me/393486065567" target="_blank" rel="noopener noreferrer" aria-label="Richiedi informazioni su WhatsApp">Richiedi informazioni</a>
              </Button>
            </div>
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0">
              <img 
                src={gestoreImg} 
                alt="Gabriele, il gestore di Amici del San Raffaele" 
                className="w-full h-full object-cover object-top rounded-full shadow-xl border-4 border-background/20"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-900 py-16 md:py-24 shadow-inner">
        <div className="relative container px-4 text-center">
          <p className="font-display text-2xl md:text-4xl text-white leading-tight max-w-3xl mx-auto italic">
            "Il tuo punto di appoggio durante il tuo soggiorno."
          </p>
          <div className="w-24 h-1 bg-primary/30 mx-auto mt-10 rounded-full" />
        </div>
      </section>
    </>
  );
};

export default Index;
