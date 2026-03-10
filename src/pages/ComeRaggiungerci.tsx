import { Car, Train, Bus, Plane } from "lucide-react";

const directions = [
  {
    icon: Car,
    title: "In auto",
    desc: "Dalla Tangenziale Est di Milano, uscita Segrate/Milano 2. L'appartamento si trova a circa 5 minuti dall'Ospedale San Raffaele. Parcheggio disponibile.",
  },
  {
    icon: Train,
    title: "In treno",
    desc: "Stazione di Segrate o Pioltello sulla linea S5/S6. Da Milano Centrale, circa 20 minuti. Dall'ospedale si raggiungono gli alloggi in pochi minuti.",
  },
  {
    icon: Bus,
    title: "Con i mezzi pubblici",
    desc: "Linea autobus 923 e 925 collegano la zona Milano 2 all'Ospedale San Raffaele e alla metropolitana M2 (Cascina Gobba).",
  },
  {
    icon: Plane,
    title: "Dall'aeroporto",
    desc: "Da Linate: 15 minuti in auto. Da Malpensa: circa 1 ora via tangenziale o con bus navetta + metropolitana.",
  },
];

const ComeRaggiungerci = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Come raggiungerci</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          I nostri appartamenti si trovano in zona Milano 2, Segrate — a pochi minuti dall'Ospedale San Raffaele.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="space-y-6">
          {directions.map((d) => (
            <div key={d.title} className="bg-card rounded-xl p-6 card-shadow flex gap-5">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <d.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">{d.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl overflow-hidden h-80">
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
      </div>
    </section>
  </>
);

export default ComeRaggiungerci;
