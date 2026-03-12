import { Car, Train, Bus, Plane, MapPin, X } from "lucide-react";
import metroMapImg from "@/assets/MAPPA ATM.webp";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
    icon: Bus,
    title: "Con autobus",
    desc: "Le linee 923 e 925 collegano la zona Milano 2 all'Ospedale San Raffaele e alla metropolitana M2 (Cascina Gobba). Le fermate si trovano a breve distanza dagli appartamenti.",
  },
  {
    icon: Car,
    title: "In auto",
    desc: "Dalla Tangenziale Est di Milano, uscita Segrate/Milano 2. Segui le indicazioni per Milano 2. Gli appartamenti dispongono di parcheggio. Nelle immediate vicinanze sono presenti anche colonnine per la ricarica di auto elettriche. L'Ospedale San Raffaele si raggiunge in circa 5 minuti di auto.",
  },
  {
    icon: Train,
    title: "Con la metro",
    desc: "La fermata più vicina è Cascina Gobba (M2, linea verde). Da lì, gli appartamenti di Milano 2 sono raggiungibili in autobus (linee 923, 925) o in taxi in pochi minuti. L'Ospedale San Raffaele ha una fermata dedicata sulla M2.",
  },
];

const ComeRaggiungerci = () => (
  <>
    <section className="hero-gradient py-12 md:py-16">
      <div className="container text-center">
        <h1 className="font-display text-3xl md:text-5xl text-primary-foreground mb-4">Come raggiungerci</h1>
        <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">
          Tutte le indicazioni per raggiungere i nostri appartamenti a Milano 2, Segrate.
        </p>
      </div>
    </section>

    <section className="py-12 md:py-16 bg-background">
      <div className="container max-w-5xl">
        {/* Top Section: Address and Main Map */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16 items-stretch">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-8 border border-border/60 card-shadow border-l-4 border-primary h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-primary text-2xl mb-2">Indirizzo</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Zona Milano 2 – Segrate (MI)<br />
                  <span className="text-primary/70 text-sm font-medium uppercase tracking-wider">Vicino Ospedale San Raffaele</span>
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/40">
                <p className="text-sm text-muted-foreground italic">
                  I nostri appartamenti distano solo pochi passi dall'ingresso principale dell'ospedale.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 min-h-[400px]">
            <div className="rounded-2xl overflow-hidden h-full card-shadow border border-border">
              <iframe
                title="Mappa - Come raggiungerci"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.390195682343!2d9.266786299999998!3d45.5022233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c71d2fe74f4d%3A0x89a6a46181c3d221!2sAmici%20dell'Ospedale%20Appartamenti%20B%26B!5e0!3m2!1sit!2sit!4v1773334327379!5m2!1sit!2sit"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Directions Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="font-display text-primary text-3xl md:text-4xl mb-2">Come arrivare</h2>
            <div className="w-20 h-1 bg-primary/20 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {directions.map((d, index) => (
              <div 
                key={d.title} 
                className={`group flex ${d.title.toLowerCase() === "con la metro" ? "md:col-span-2" : ""}`}
              >
                <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 w-full flex flex-col">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      <d.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <h3 className="font-display text-primary text-2xl">{d.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {d.desc}
                      </p>

                      {/* Integrated Metro Map ONLY for 'Con la metro' directions */}
                      {d.title.toLowerCase() === "con la metro" && (
                        <div className="mt-8 pt-6 border-t border-border/50">
                          <p className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <Train className="w-4 h-4" />
                            Mappa Metro Milano
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="rounded-xl overflow-hidden card-shadow group/map relative cursor-pointer border border-border max-w-2xl h-48 md:h-64">
                                <img 
                                  src={metroMapImg} 
                                  alt="Mappa della Metropolitana di Milano" 
                                  className="w-full h-full object-cover group-hover/map:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/map:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-white text-primary font-medium px-6 py-2 rounded-full shadow-xl flex items-center gap-2">
                                    <X className="w-4 h-4 rotate-45" />
                                    Vedi Mappa Metro
                                  </div>
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 shadow-none flex items-center justify-center [&>button]:hidden">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <DialogPrimitive.Close className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors md:top-8 md:right-8">
                                  <X className="h-8 w-8" />
                                </DialogPrimitive.Close>
                                <img
                                  src={metroMapImg}
                                  alt="Mappa Metro Ingrandita"
                                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Assistance Banner */}
        <div className="mt-16 bg-accent/30 rounded-3xl p-6 md:p-10 border border-primary/10 card-shadow flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-border/50">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#25D366] fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-display text-primary text-xl font-bold uppercase tracking-wide">Difficoltà a trovarci?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Se hai difficoltà a trovarci, tramite <span className="text-foreground font-semibold">WhatsApp</span> ti verrà inviata la <span className="text-primary font-medium">posizione esatta</span> dove arrivare. Sia a piedi che in auto.
            </p>
          </div>
        </div>

      </div>
    </section>
  </>
);

export default ComeRaggiungerci;
