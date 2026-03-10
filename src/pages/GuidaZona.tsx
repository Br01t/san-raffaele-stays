import { ShoppingBag, Coffee, Trees, Building2, Pill, Bus } from "lucide-react";

const pois = [
  { icon: Building2, title: "Ospedale San Raffaele", desc: "A pochi minuti a piedi dai nostri appartamenti. Centro di eccellenza per ricerca e cura." },
  { icon: ShoppingBag, title: "Centro Commerciale", desc: "Il centro commerciale di Milano 2 offre supermercati, negozi e servizi a portata di mano." },
  { icon: Coffee, title: "Bar e ristoranti", desc: "Numerosi locali nella zona per colazioni, pranzi e cene in tranquillità." },
  { icon: Trees, title: "Parchi e verde", desc: "Milano 2 è immersa nel verde con parchi, laghetti e percorsi pedonali ideali per rilassarsi." },
  { icon: Pill, title: "Farmacie", desc: "Farmacie facilmente raggiungibili a piedi nella zona residenziale." },
  { icon: Bus, title: "Trasporti pubblici", desc: "Autobus e navette collegano la zona all'ospedale, alla metropolitana e al centro di Milano." },
];

const GuidaZona = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Guida alla zona</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Milano 2 / Segrate: un quartiere residenziale verde e ben servito, a due passi dal San Raffaele.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pois.map((p) => (
            <div key={p.title} className="bg-card rounded-xl p-6 card-shadow flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <p.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold mb-1">{p.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default GuidaZona;
