import { Car, Train, Bus, Plane, MapPin } from "lucide-react";

const directions = [
  {
    icon: Train,
    title: "Da Milano centro",
    desc: "Prendi la metropolitana M2 (linea verde) fino a Cascina Gobba, poi autobus 923 o 925 verso Milano 2. In alternativa, treno S5/S6 dalla Stazione Centrale fino a Segrate (circa 20 minuti). Gli appartamenti si trovano a pochi minuti a piedi dalla fermata.",
  },
  {
    icon: Plane,
    title: "Da aeroporto Linate",
    desc: "L'aeroporto di Linate dista circa 10-15 minuti in auto da Milano 2. In taxi o con servizio di trasferimento, il tragitto è rapido e diretto. In alternativa, bus ATM 73 fino a San Babila, poi metro M2 fino a Cascina Gobba e autobus per Milano 2.",
  },
  {
    icon: Train,
    title: "Con la metro",
    desc: "La fermata più vicina è Cascina Gobba (M2, linea verde). Da lì, gli appartamenti di Milano 2 sono raggiungibili in autobus (linee 923, 925) o in taxi in pochi minuti. L'Ospedale San Raffaele ha una fermata dedicata sulla M2.",
  },
  {
    icon: Bus,
    title: "Con autobus",
    desc: "Le linee 923 e 925 collegano la zona Milano 2 all'Ospedale San Raffaele e alla metropolitana M2 (Cascina Gobba). Le fermate si trovano a breve distanza dagli appartamenti.",
  },
  {
    icon: Car,
    title: "In auto",
    desc: "Dalla Tangenziale Est di Milano, uscita Segrate/Milano 2. Segui le indicazioni per Milano 2. Gli appartamenti dispongono di parcheggio. L'Ospedale San Raffaele si raggiunge in circa 5 minuti di auto.",
  },
];

const ComeRaggiungerci = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Come raggiungerci</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          I nostri appartamenti si trovano a Milano 2, Segrate — a pochi minuti dall'Ospedale San Raffaele.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        {/* Indirizzo */}
        <div className="bg-card rounded-xl p-6 card-shadow flex gap-4 items-start mb-8">
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-1">Indirizzo appartamenti</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Zona Milano 2 – Segrate (MI)<br />
              Vicino Ospedale San Raffaele, Milano
            </p>
          </div>
        </div>

        {/* Mappa */}
        <div className="rounded-xl overflow-hidden h-80 card-shadow mb-10">
          <iframe
            title="Mappa - Come raggiungerci"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5594.5!2d9.264!3d45.505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c7b3e0f2a6ad%3A0x2!2sOspedale+San+Raffaele!5e0!3m2!1sit!2sit!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Indicazioni */}
        <h2 className="text-2xl font-bold mb-6">Come arrivare</h2>
        <div className="space-y-5">
          {directions.map((d) => (
            <div key={d.title} className="bg-card rounded-xl p-6 card-shadow flex gap-5">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <d.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default ComeRaggiungerci;
