import { useState } from "react";
import { Wifi, Car, Users, Bed, Bath, AirVent, WashingMachine, Shirt, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";
import bathroomImg from "@/assets/apartment-bathroom.jpg";
import heroImg from "@/assets/hero-apartment.jpg";

const allImages = [heroImg, bedroomImg, kitchenImg, livingImg, bathroomImg];

interface ApartmentData {
  name: string;
  desc: string;
  price: string;
  guests: number;
  beds: string;
  images: string[];
  services: string[];
}

const apartments: ApartmentData[] = [
  {
    name: "Appartamento Comfort",
    desc: "Bilocale luminoso e accogliente con camera matrimoniale, cucina completamente attrezzata, bagno con doccia e balcone con vista sul verde di Milano 2. Ideale per coppie o soggiorni singoli di breve e medio periodo. Arredato con gusto e dotato di ogni comfort per sentirsi a casa.",
    price: "da €55/notte",
    guests: 2,
    beds: "1 letto matrimoniale",
    images: [bedroomImg, kitchenImg, bathroomImg],
    services: ["Cucina attrezzata", "Wi-Fi", "Aria condizionata", "Lavatrice", "Biancheria inclusa"],
  },
  {
    name: "Appartamento Family",
    desc: "Trilocale spazioso e confortevole con due camere da letto, ampio soggiorno con divano, cucina completa e bagno. Perfetto per famiglie o piccoli gruppi che necessitano di un soggiorno prolungato vicino all'Ospedale San Raffaele. Luminoso e ben organizzato.",
    price: "da €75/notte",
    guests: 4,
    beds: "1 matrimoniale + 2 singoli",
    images: [livingImg, bedroomImg, kitchenImg, bathroomImg],
    services: ["Cucina attrezzata", "Wi-Fi", "Aria condizionata", "Lavatrice", "Biancheria inclusa"],
  },
  {
    name: "Studio Essenziale",
    desc: "Monolocale funzionale e pratico con angolo cottura attrezzato, bagno privato con doccia e zona notte con letto singolo o matrimoniale. La soluzione ideale per soggiorni brevi, economica ma con tutti i servizi essenziali.",
    price: "da €40/notte",
    guests: 1,
    beds: "1 letto singolo / matrimoniale",
    images: [kitchenImg, bathroomImg, heroImg],
    services: ["Angolo cottura", "Wi-Fi", "Aria condizionata", "Biancheria inclusa"],
  },
];

const serviceIcons: Record<string, typeof Wifi> = {
  "Cucina attrezzata": UtensilsCrossed,
  "Angolo cottura": UtensilsCrossed,
  "Wi-Fi": Wifi,
  "Aria condizionata": AirVent,
  "Lavatrice": WashingMachine,
  "Biancheria inclusa": Shirt,
};

const ImageGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative group">
      <img
        src={images[current]}
        alt={`${name} - foto ${current + 1}`}
        className="w-full h-72 md:h-96 object-cover rounded-xl"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Foto precedente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Foto successiva"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary-foreground" : "bg-primary-foreground/40"}`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Alloggi = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">I nostri alloggi</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Appartamenti completamente arredati a pochi minuti dall'Ospedale San Raffaele. Affitto breve a Milano 2, ideali per familiari di pazienti.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-4xl space-y-12">
        {apartments.map((apt) => (
          <article key={apt.name} className="bg-card rounded-2xl overflow-hidden card-shadow">
            <ImageGallery images={apt.images} name={apt.name} />
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold">{apt.name}</h2>
                <span className="text-primary font-bold text-lg">{apt.price}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{apt.desc}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {apt.guests} {apt.guests > 1 ? "ospiti" : "ospite"}</span>
                <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-primary" /> {apt.beds}</span>
                <span className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-primary" /> 1 bagno</span>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Servizi inclusi</h3>
                <div className="flex flex-wrap gap-2">
                  {apt.services.map((s) => {
                    const Icon = serviceIcons[s] || Wifi;
                    return (
                      <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full">
                        <Icon className="w-3.5 h-3.5" /> {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link to="/contatti">Richiedi disponibilità</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a href="https://wa.me/390200000000" target="_blank" rel="noopener noreferrer">Contatta su WhatsApp</a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  </>
);

export default Alloggi;
