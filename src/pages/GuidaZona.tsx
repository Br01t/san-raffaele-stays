import { useState } from "react";
import { ShoppingBag, Coffee, Trees, Pill, Bus, Building2, MapPin, Hospital, Home, ShieldCheck, Footprints, Bike, Camera, X, Landmark, ArrowRight, Info, ExternalLink, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import sanRaffaeleMap from "@/assets/san-raffaele-MAPPA.webp";
import researchImg from "@/assets/ospande-san-raffaele-research-department-.webp";
import laghettoImg from "@/assets/laghetto.webp";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { blogArticles } from "@/data/blog-posts";
import { Button } from "@/components/ui/button";

import blog6 from "@/assets/FOTO BLOG 6 .webp";
import blog7 from "@/assets/FOTO BLOG 7.webp";
import blog8a from "@/assets/FOTO BLOG 8  .webp";
import blog8b from "@/assets/FOTO BLOG 8 - ULTIMA FOTO .webp";
import blog9 from "@/assets/FOTO BLOG 9.webp";
import blog10 from "@/assets/FOTO BLOG 10 .webp";
import areaGuideImg from "@/assets/FOTO GUIDA ALLA ZONA - MILANO DUE .webp";

const guideImages = [
  { main: blog6 },
  { main: blog7 },
  { main: blog8a, extra: blog8b },
  { main: blog9 },
  { main: blog10 },
];

const infoSections = [
  {
    icon: ShoppingBag,
    title: "Supermercati",
    items: [
      "Viaggiator Goloso, Unes - a pochi passi di distanza",
      "Supermercato Esselunga – raggiungibile in auto in pochi minuti",
      "Carrefour Express – all'interno del centro commerciale Milano 2",
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
];

const GuidaZona = () => {
  const guideArticles = blogArticles.slice(5, 10).map((article, index) => ({
    ...article,
    image: guideImages[index]?.main || article.image,
    extraImage: guideImages[index]?.extra
  }));
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const scrollToArticle = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      if (!expandedArticles.includes(id)) {
        setExpandedArticles(prev => [...prev, id]);
      }
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Guida Milano 2 e Servizi vicino San Raffaele",
    "description": "Scopri tutti i servizi di Milano 2 vicino all'Ospedale San Raffaele: ristoranti, supermercati, farmacie e aree verdi per il tuo soggiorno.",
    "author": {
      "@type": "Organization",
      "name": "Amici del San Raffaele"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Amici del San Raffaele"
    }
  };

  return (
    <>
      <SEO 
        title="Guida Milano 2 e Servizi vicino San Raffaele" 
        description="Scopri tutti i servizi di Milano 2 vicino all'Ospedale San Raffaele: ristoranti, supermercati, farmacie e aree verdi per il tuo soggiorno." 
        schema={JSON.stringify(articleSchema)}
      />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 text-center">
          <div className="container">
            <h1 className="font-display text-3xl md:text-5xl text-primary-foreground mb-6">Guida alla zona</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
              Soggiornare a Milano 2 significa avere tutto ciò che serve a pochi passi. Scopri i servizi e l'organizzazione dell'Ospedale San Raffaele.
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
        <section id="ospedale" className="py-16 md:py-24 bg-accent/30 scroll-mt-20 border-b border-border">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Hospital className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="font-display text-primary text-2xl md:text-3xl">Come orientarsi all'interno dell'Ospedale</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    L'ospedale si estende su un'area di <strong className="text-foreground">300.000 m²</strong> nei pressi di Via Olgettina, sul confine tra Milano e Milano 2 a Segrate.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    L'OSR è diviso in diversi settori, facilmente identificabili grazie a un sistema di colori e lettere. Segui le linee colorate sul pavimento per orientarti.
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
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="rounded-[2.5rem] overflow-hidden card-shadow bg-card p-2.5 cursor-pointer group relative border border-white/20">
                      <img
                        src={sanRaffaeleMap}
                        alt="Mappa Ospedale"
                        className="w-full h-auto rounded-[2rem] group-hover:scale-[1.02] transition-transform duration-1000 ease-in-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-white/90 text-primary text-xs font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          INGRANDISCI MAPPA
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 border-none bg-black/95 shadow-none flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <DialogPrimitive.Close className="absolute top-6 right-6 z-[60] bg-white text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-all shadow-2xl">
                        <X className="h-6 w-6" />
                      </DialogPrimitive.Close>
                      <img
                        src={sanRaffaeleMap}
                        alt="Mappa Ospedale San Raffaele"
                        className="max-w-full max-h-[92vh] object-contain rounded-lg"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Sezione Quartiere */}
        <section id="quartiere" className="pt-16 md:pt-24 pb-2 md:pb-4 overflow-hidden scroll-mt-20 bg-background">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Trees className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="font-display text-primary text-2xl md:text-3xl font-bold">Vivere a Milano 2: Un'Oasi di Servizi</h2>
                </div>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Soggiornare a Milano 2 significa immergersi in un quartiere pensato per il benessere e la comodità. Racchiuso tra il Parco Lambro e l'Ospedale San Raffaele, offre un'esperienza unica dove la natura incontra l'efficienza urbana.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                  {milano2Features.map((f) => (
                    <div key={f.text} className="flex flex-col items-center text-center bg-card rounded-2xl p-4 card-shadow border border-primary/5 hover:bg-primary/5 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                        <f.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 leading-tight">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-1/2 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl overflow-hidden card-shadow">
                    <img src={laghettoImg} alt="Laghetto Milano 2" className="w-full h-64 md:h-80 object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden card-shadow mt-8">
                    <img src={researchImg} alt="San Raffaele Research" className="w-full h-64 md:h-80 object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Griglia Servizi */}
            <div className="bg-accent/30 rounded-[3rem] p-8 md:p-12 border border-primary/5 mb-12">
              <div className="text-center mb-12">
                <h3 className="font-display text-primary text-xl md:text-2xl font-bold mb-2">I Servizi del Quartiere</h3>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  Ecco i principali punti di interesse e servizi fondamentali situati a pochi passi dal tuo alloggio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infoSections.map((s) => (
                  <div key={s.title} className="bg-card rounded-2xl p-6 context-card border border-border/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {s.icon && <s.icon className="w-5 h-5 text-primary" />}
                      </div>
                      <h3 className="font-display text-primary font-bold">{s.title}</h3>
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
          </div>
        </section>

        {/* Articoli Approfondimento */}
        <section className="pt-0 pb-16 md:pb-24 bg-accent/10" id="consigli-soggiorno">
          <div className="container overflow-hidden">
            <div className="max-w-4xl mx-auto mb-8">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="rounded-3xl overflow-hidden card-shadow mb-8 border border-border/50 relative cursor-pointer group">
                    <img src={areaGuideImg} alt="Guida alla Zona Milano 2" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Camera className="w-4 h-4" /> INGRANDISCI
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center">
                  <DialogPrimitive.Close className="absolute top-4 right-4 z-50 bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl">
                    <X className="h-5 w-5" />
                  </DialogPrimitive.Close>
                  <img src={areaGuideImg} alt="Guida alla Zona Milano 2" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                </DialogContent>
              </Dialog>
              <div className="text-center">
                <h2 className="font-display text-primary text-3xl md:text-4xl mb-4">Consigli per il Soggiorno</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Approfondimenti utili per orientarsi, mangiare e vivere al meglio la zona durante la tua permanenza.
                </p>
              </div>
            </div>

            {/* Index Navigation */}
            <div className="bg-card rounded-2xl md:rounded-[2rem] p-6 md:p-10 border border-border/60 shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <Landmark className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <h2 className="font-display text-primary text-xl md:text-2xl">Indice delle guide</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {guideArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => scrollToArticle(article.id)}
                    className="flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out text-left group"
                  >
                    <span className="text-xs md:text-sm font-bold leading-tight pr-4">{article.title}</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              {guideArticles.map((article) => (
                <article 
                  key={article.id} 
                  id={article.id}
                  className="bg-card rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-border shadow-sm transition-all duration-500 hover:shadow-md h-min"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className={`relative transition-all duration-500 overflow-hidden cursor-pointer group ${expandedArticles.includes(article.id) ? 'h-64 md:h-[450px]' : 'h-48 md:h-64'}`}>
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Camera className="w-4 h-4" /> INGRANDISCI
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-4 md:bottom-6 left-6 md:left-8 right-6 md:right-8 pointer-events-none">
                          <h3 className="font-display text-white text-lg md:text-2xl leading-tight">{article.title}</h3>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center">
                      <DialogPrimitive.Close className="absolute top-4 right-4 z-50 bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl">
                        <X className="h-5 w-5" />
                      </DialogPrimitive.Close>
                      <img src={article.image} alt={article.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                    </DialogContent>
                  </Dialog>
                  
                  <div className="p-6 md:p-10">
                    {!expandedArticles.includes(article.id) ? (
                      <div className="space-y-4 md:space-y-6">
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                          {article.excerpt}
                        </p>
                        <Button 
                          onClick={() => toggleArticle(article.id)}
                          variant="outline"
                          className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all px-6 md:px-8 h-10 md:h-12 text-sm md:text-base font-bold flex items-center gap-2"
                        >
                          Leggi tutto <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="prose prose-sm md:prose-base prose-primary max-w-none text-muted-foreground mb-6 md:mb-8 overflow-x-hidden">
                          {/* Special injection for article with extra image */}
                          {article.extraImage ? (
                            <>
                              <div dangerouslySetInnerHTML={{ __html: article.content.split('</h2>')[0] + '</h2>' }} />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="my-8 rounded-2xl overflow-hidden card-shadow group cursor-pointer relative">
                                    <img src={article.extraImage} alt={`${article.title} gallery`} className="w-full h-64 md:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="bg-white/90 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <Camera className="w-4 h-4" /> INGRANDISCI
                                      </div>
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 flex items-center justify-center">
                                  <DialogPrimitive.Close className="absolute top-4 right-4 z-50 bg-white text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl">
                                    <X className="h-5 w-5" />
                                  </DialogPrimitive.Close>
                                  <img src={article.extraImage} alt={article.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                                </DialogContent>
                              </Dialog>
                              <div dangerouslySetInnerHTML={{ __html: article.content.split('</h2>').slice(1).join('</h2>') }} />
                            </>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                          )}
                        </div>
                        <Button 
                          onClick={() => toggleArticle(article.id)}
                          variant="ghost"
                          className="text-primary hover:bg-primary/5 font-bold flex items-center gap-2 px-0 text-sm md:text-base"
                        >
                          Riduci <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="container max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl mb-6">Hai bisogno di un alloggio vicino?</h2>
            <p className="text-primary-foreground/80 mb-10 text-lg">
              I nostri appartamenti si trovano a meno di 10 minuti a piedi dall'ingresso principale del San Raffaele.
            </p>
            <Link to="/alloggi">
              <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold">
                Vedi gli appartamenti
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default GuidaZona;
