import { useState } from "react";
import { Wifi, Car, Users, Bed, Bath, AirVent, WashingMachine, Shirt, UtensilsCrossed, ChevronLeft, ChevronRight, Tv, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AmenityStrip from "@/components/AmenityStrip";
import Gallery from "@/components/Gallery";

// Amici 1 specific images
import amici1_1 from "@/assets/Screenshot 2026-03-12 alle 15.28.04.webp";
import amici1_2 from "@/assets/Screenshot 2026-03-12 alle 15.28.14.webp";
import amici1_3 from "@/assets/Screenshot 2026-03-12 alle 15.28.23.webp";
import amici1_4 from "@/assets/Screenshot 2026-03-12 alle 15.28.33.webp";
import amici1_5 from "@/assets/Screenshot 2026-03-12 alle 15.28.44.webp";
import amici1_6 from "@/assets/Screenshot 2026-03-12 alle 15.28.54.webp";
import amici1_7 from "@/assets/Screenshot 2026-03-12 alle 15.29.02.webp";
import amici1_8 from "@/assets/Screenshot 2026-03-12 alle 15.29.11.webp";

// Amici 2 specific images
import amici2_1 from "@/assets/AMICI 2 - 1.webp";
import amici2_2 from "@/assets/AMICI 2 - 2.webp";
import amici2_3 from "@/assets/AMICI 2- 3.webp";
import amici2_4 from "@/assets/AMICI 2 - 4.webp";
import amici2_5 from "@/assets/AMICI 2 - 5.webp";
import amici2_6 from "@/assets/AMICI 2 - 6.webp";

// Amici 3 specific images
import amici3_1 from "@/assets/IMG_2802.webp";
import amici3_2 from "@/assets/IMG_2804.webp";
import amici3_3 from "@/assets/IMG_2809.webp";
import amici3_4 from "@/assets/IMG_2813.webp";
import amici3_5 from "@/assets/IMG_2815.webp";
import amici3_6 from "@/assets/IMG_2820.webp";
import amici3_7 from "@/assets/IMG_2826.webp";
import amici3_8 from "@/assets/IMG_2828.webp";

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
    name: "Amici 1",
    location: "Accogliente bilocale situato in posizione tranquilla a Milano 2, a pochissimi passi dall'ingresso dell'Ospedale San Raffaele.",
    services: ["TV", "Aria condizionata", "Wi-Fi", "Phon in camera", "Cucina attrezzata", "Bagno privato", "Doccia", "Lavatrice"],
    beds: "1 letto matrimoniale, 1 divano letto. Totale 3 posti letto.",
    prices: [
      { label: "2 Pers.", price: "80 €" },
      { label: "3 Pers.", price: "90 €" },
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [amici1_1, amici1_2, amici1_3, amici1_4, amici1_5, amici1_6, amici1_7, amici1_8],
  },
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
    images: [amici2_1, amici2_2, amici2_3, amici2_4, amici2_5, amici2_6],
  },
  {
    name: "Amici 3",
    location: "Alloggio moderno e funzionale situato a brevissima distanza dall'Ospedale San Raffaele, ideale per soggiorni brevi in totale relax.",
    services: ["TV", "Aria condizionata", "Wi-Fi", "Phon in camera", "Cucina attrezzata", "Bagno privato", "Doccia", "Lavatrice"],
    beds: "1 letto matrimoniale, 1 divano letto. Per un totale di 3-4 posti letto.",
    prices: [
      { label: "2 Pers.", price: "75 €" },
      { label: "3 Pers.", price: "85 €" },
    ],
    extras: ["Nessun costo pulizie", "Notte regalo per chi si ospedalizza"],
    images: [amici3_1, amici3_2, amici3_3, amici3_4, amici3_5, amici3_6, amici3_7, amici3_8],
  },
];

const Alloggi = () => (
  <>
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container px-4">
        <h1 className="font-display text-primary text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12">I nostri alloggi</h1>

        <div className="space-y-10 sm:space-y-16">
          {apartments.map((apt) => (
            <article key={apt.name} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 card-shadow">
              <h2 className="font-display text-primary text-xl sm:text-2xl mb-4 sm:mb-6 uppercase tracking-wider">{apt.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 border-b border-border pb-8 mb-8 last:border-0 last:pb-0 last:mb-0">
                {/* Left: images (50% width, full height) */}
                <div className="h-full">
                  <Gallery images={apt.images} name={apt.name} />
                </div>

                {/* Right: details (50% width) */}
                <div className="space-y-4 sm:space-y-6 flex flex-col justify-between h-full">
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

                    <div className="">
                      <h3 className="font-display text-primary text-base sm:text-lg mb-3">Prezzi</h3>
                      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center text-center">
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
                  </div>

                  <div className="pt-6 flex justify-center mt-auto border-t border-border/50">
                    <Button asChild className="rounded-full px-6 sm:px-8 w-full sm:w-auto">
                      <Link to="/contatti">Richiedi disponibilità</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <AmenityStrip />
      </div>
    </section>
  </>
);

export default Alloggi;
