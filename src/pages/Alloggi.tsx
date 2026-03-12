import { useState } from "react";
import { Wifi, Car, Users, Bed, Bath, AirVent, WashingMachine, Shirt, UtensilsCrossed, ChevronLeft, ChevronRight, Tv, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";
import bathroomImg from "@/assets/apartment-bathroom.jpg";
import heroImg from "@/assets/hero-apartment.jpg";

interface ApartmentData {
  name: string;
  location: string;
  services: string[];
  beds: string;
  prices: { label: string; price: string }[];
  extras: string[];
  images: string[];
}

const apartments: ApartmentData[] = [
  {
    name: "Amici 2",
    location: "L'Alloggio AMICI 2 si posiziona tra le primi residenze nelle vicinanze del San Raffaele. Dal terrazzo è possibile vedere l'OSR. L'entra di Via Olgettina dista circa 150 metri.",
    services: ["TV", "Aria condizionata", "Wi-Fi", "Phon in camera", "Cucina attrezzata", "Bagno privato", "Doccia", "Lavatrice", "Terrazzo"],
    beds: "1 letto matrimoniale, 1 letto singolo, 1 divano letto. Per un totale di 4 posti letto. O anche 4 posti letto + 1 bambino/a.",
    prices: [
      { label: "2 Pers.", price: "90 €" },
      { label: "3 Pers.", price: "95 €" },
      { label: "4 Pers.", price: "110 €" },
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [bedroomImg, kitchenImg, livingImg, bathroomImg, heroImg],
  },
  {
    name: "Amici 3",
    location: "Alloggio situato a brevissima distanza dall'Ospedale San Raffaele, in una zona tranquilla e residenziale di Milano 2.",
    services: ["TV", "Aria condizionata", "Wi-Fi", "Phon in camera", "Cucina attrezzata", "Bagno privato", "Doccia", "Lavatrice"],
    beds: "1 letto matrimoniale, 1 divano letto. Per un totale di 3 posti letto.",
    prices: [
      { label: "2 Pers.", price: "75 €" },
      { label: "3 Pers.", price: "85 €" },
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [livingImg, bedroomImg, kitchenImg, bathroomImg],
  },
];

const ImageGrid = ({ images, name }: { images: string[]; name: string }) => {
  const displayImages = images.slice(0, 9);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 rounded-xl overflow-hidden">
      {displayImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${name} - foto ${i + 1}`}
          className="w-full h-24 sm:h-28 md:h-36 object-cover hover:opacity-90 transition-opacity"
        />
      ))}
    </div>
  );
};

const Alloggi = () => (
  <>
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container px-4">
        <h1 className="font-display text-primary text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12">I nostri alloggi</h1>

        <div className="space-y-10 sm:space-y-16">
          {apartments.map((apt) => (
            <article key={apt.name} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 card-shadow">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Left: name + images */}
                <div>
                  <h2 className="font-display text-primary text-xl sm:text-2xl mb-4 sm:mb-6">{apt.name}</h2>
                  <ImageGrid images={apt.images} name={apt.name} />
                </div>

                {/* Right: details */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="font-display text-primary text-base sm:text-lg mb-2">Ubicazione</h3>
                    <ul className="list-disc list-inside text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      <li>{apt.location}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-display text-primary text-base sm:text-lg mb-2">Servizi</h3>
                    <ul className="list-disc list-inside text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      <li>{apt.services.join(", ")}.</li>
                      <li>{apt.beds}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-display text-primary text-base sm:text-lg mb-3">Prezzi</h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {apt.extras.map((e) => (
                        <div key={e} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted flex items-center justify-center p-2 sm:p-3">
                          <span className="font-display text-primary text-[10px] sm:text-xs text-center leading-tight">{e}</span>
                        </div>
                      ))}
                      <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-full bg-muted flex flex-col items-center justify-center p-2 sm:p-3">
                        {apt.prices.map((p) => (
                          <span key={p.label} className="text-xs sm:text-sm font-semibold text-foreground">{p.label} : {p.price}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button asChild className="rounded-full px-6 sm:px-8 w-full sm:w-auto">
                      <Link to="/contatti">Richiedi disponibilità</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Alloggi;
