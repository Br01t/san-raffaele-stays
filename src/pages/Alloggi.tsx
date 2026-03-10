import { Wifi, Car, Users, Bed, Bath, UtensilsCrossed } from "lucide-react";
import bedroomImg from "@/assets/apartment-bedroom.jpg";
import kitchenImg from "@/assets/apartment-kitchen.jpg";
import livingImg from "@/assets/apartment-living.jpg";
import bathroomImg from "@/assets/apartment-bathroom.jpg";

const apartments = [
  {
    name: "Appartamento Comfort",
    desc: "Bilocale luminoso con camera matrimoniale, cucina attrezzata e balcone. Ideale per soggiorni brevi e medi.",
    img: bedroomImg,
    guests: 2,
    beds: 1,
    baths: 1,
  },
  {
    name: "Appartamento Family",
    desc: "Trilocale spazioso con due camere da letto, soggiorno e cucina completa. Perfetto per famiglie.",
    img: livingImg,
    guests: 4,
    beds: 2,
    baths: 1,
  },
  {
    name: "Studio Essenziale",
    desc: "Monolocale funzionale con angolo cottura e bagno privato. La soluzione pratica per soggiorni brevi.",
    img: kitchenImg,
    guests: 1,
    beds: 1,
    baths: 1,
  },
];

const amenities = [
  { icon: Wifi, label: "Wi-Fi gratuito" },
  { icon: Car, label: "Parcheggio" },
  { icon: UtensilsCrossed, label: "Cucina attrezzata" },
  { icon: Bath, label: "Biancheria inclusa" },
];

const Alloggi = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">I nostri alloggi</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Appartamenti completamente arredati, a pochi minuti dall'Ospedale San Raffaele.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid gap-8">
          {apartments.map((apt) => (
            <div key={apt.name} className="bg-card rounded-xl overflow-hidden card-shadow md:grid md:grid-cols-5 md:gap-0">
              <div className="md:col-span-2">
                <img src={apt.img} alt={apt.name} className="w-full h-64 md:h-full object-cover" loading="lazy" />
              </div>
              <div className="p-6 md:p-8 md:col-span-3 flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-2">{apt.name}</h2>
                <p className="text-muted-foreground mb-4">{apt.desc}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {apt.guests} ospiti</span>
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {apt.beds} letto/i</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {apt.baths} bagno</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Servizi inclusi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {amenities.map((a) => (
              <div key={a.label} className="bg-card rounded-xl p-5 card-shadow text-center">
                <a.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <span className="text-sm font-medium">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Galleria</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[bedroomImg, kitchenImg, livingImg, bathroomImg].map((img, i) => (
              <img key={i} src={img} alt={`Foto appartamento ${i + 1}`} className="rounded-lg object-cover w-full h-48" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Alloggi;
