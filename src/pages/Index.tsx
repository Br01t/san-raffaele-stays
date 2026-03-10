import { Link } from "react-router-dom";
import { MapPin, Clock, Shield, Wifi, Car, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-apartment.jpg";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";

const features = [
  { icon: MapPin, title: "Vicino al San Raffaele", desc: "A pochi minuti a piedi dall'ospedale" },
  { icon: Clock, title: "Affitti flessibili", desc: "Da pochi giorni a diversi mesi" },
  { icon: Shield, title: "Sicuro e affidabile", desc: "Ambienti controllati e curati" },
  { icon: Wifi, title: "Tutto incluso", desc: "Wi-Fi, utenze e biancheria" },
  { icon: Car, title: "Parcheggio", desc: "Posto auto disponibile" },
  { icon: Heart, title: "Supporto dedicato", desc: "Assistenza personalizzata" },
];

const Index = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Appartamento luminoso vicino all'Ospedale San Raffaele" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>
      <div className="relative container py-24 md:py-36 lg:py-44 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in">
          Il tuo alloggio vicino al<br />San Raffaele di Milano
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          Appartamenti confortevoli per familiari di pazienti, medici e chi ha bisogno di soggiornare vicino all'ospedale.
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

    {/* Features */}
    <section className="section-gradient py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Perché sceglierci</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Offriamo alloggi pensati per chi vive momenti delicati, con tutto il comfort e la vicinanza all'ospedale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Gallery preview */}
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">I nostri appartamenti</h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Spazi luminosi, arredati con cura e pronti per accoglierti.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <img src={livingImg} alt="Soggiorno appartamento" className="rounded-xl object-cover w-full h-64 md:h-80" loading="lazy" />
          <img src={bedroomImg} alt="Camera da letto" className="rounded-xl object-cover w-full h-64 md:h-80" loading="lazy" />
          <img src={kitchenImg} alt="Cucina attrezzata" className="rounded-xl object-cover w-full h-64 md:h-80" loading="lazy" />
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/alloggi">Vedi tutti gli alloggi <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Hai bisogno di un alloggio?</h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
          Contattaci per verificare la disponibilità. Saremo felici di aiutarti.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link to="/contatti">Richiedi informazioni</Link>
        </Button>
      </div>
    </section>
  </>
);

export default Index;
