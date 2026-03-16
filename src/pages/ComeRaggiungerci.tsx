import { Car, Bus, Plane, MapPin, Train, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

import metroMapImg from "@/assets/MAPPA ATM.webp";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const ComeRaggiungerci = () => (
  <>
    <SEO 
      title="Come Arrivare al San Raffaele: Mezzi, Parcheggio e Navette" 
      description="Guida completa su come arrivare all'Ospedale San Raffaele da aeroporti e stazioni. Informazioni su parcheggio San Raffaele e trasporti a Milano 2." 
    />

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
                title="Mappa - Come raggiungerci - Amici del San Raffaele"
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
        <div className="space-y-12 mb-16">
          <div className="text-center">
            <h2 className="font-display text-primary text-3xl md:text-4xl mb-2">Come raggiungerci</h2>
            <div className="w-20 h-1 bg-primary/20 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* CARD 1: CON METRO E BUS */}
            <div className="bg-card rounded-[2rem] p-6 md:p-10 border border-border/60 card-shadow">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0">
                  <Bus className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className="font-display text-primary text-2xl uppercase">CON METRO E BUS</h3>
                  
                  {/* Mappa Section for Metro */}
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="rounded-xl overflow-hidden card-shadow group relative cursor-pointer border border-border max-w-lg h-40 md:h-56">
                          <img 
                            src={metroMapImg} 
                            alt="Mappa della Metropolitana di Milano" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-primary text-[10px] font-bold px-4 py-2 rounded-full shadow-xl">VEDI MAPPA METRO</span>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 shadow-none flex items-center justify-center [&>button]:hidden">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <DialogPrimitive.Close className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white">
                            <X className="h-8 w-8" aria-hidden="true" />
                          </DialogPrimitive.Close>
                          <img
                            src={metroMapImg}
                            alt="Mappa Metropolitana di Milano Ingrandita"
                            className="max-width-full max-height-[90vh] object-contain rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="text-muted-foreground leading-relaxed space-y-4 text-base md:text-lg">
                    <p>
                      <strong className="text-foreground">AMICI DEL SAN RAFFAELE</strong> è raggiungibile tramite Metropolitana linea verde M2: fermata <strong className="text-foreground">Cascina Gobba</strong> e a seguire 2 opzioni:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>uscire dalla stazione della metro e prendere <strong className="text-foreground">Autobus 925</strong> fino alla fermata <strong className="text-foreground">UFFICIO POSTALE MILANO 2</strong></li>
                      <li>rimanere all’interno della stazione di Cascina Gobba e prendere <strong className="text-foreground">Metro Leggera</strong> che porta direttamente all’interno dell’Ospedale. I biglietti si acquistano alle macchinette alla stazione della metro leggera (costo biglietto €1,30 per 2 corse all’interno delle 24h).</li>
                    </ul>
                    <p>
                      Da li proseguire verso l'Uscita di via Olgettina, 60. Svoltare a destra e sorpassare la rotonda proseguendo verso Milano 2. Le residenze limitrofe sono gli alloggi <strong className="text-foreground">'AMICI DEL SAN RAFFAELE'</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: IN AUTO */}
            <div className="bg-card rounded-[2rem] p-6 md:p-10 border border-border/60 card-shadow">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center shrink-0">
                  <Car className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className="font-display text-primary text-2xl uppercase">IN AUTO</h3>
                  
                  {/* Mappa Section for Navigation */}
                  <div className="pt-2">
                    <div className="rounded-xl overflow-hidden h-40 md:h-56 border border-border max-w-lg">
                      <iframe
                        title="Indicazioni Auto - Amici del San Raffaele"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.390195682343!2d9.266786299999998!3d45.5022233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c71d2fe74f4d%3A0x89a6a46181c3d221!2sAmici%20dell'Ospedale%20Appartamenti%20B%26B!5e0!3m2!1sit!2sit!4v1773334327379!5m2!1sit!2sit"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="text-muted-foreground leading-relaxed space-y-4 text-base md:text-lg">
                    <p>
                      <strong className="text-foreground">AMICI DEL SAN RAFFAELE</strong> è raggiungibile tramite <strong className="text-foreground">Tangenziale Est</strong>, imboccando:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>da nord <strong className="text-foreground">Uscita Cascina Gobba</strong>;</li>
                      <li>da sud <strong className="text-foreground">Uscita Segrate</strong>.</li>
                    </ul>
                    <p>
                      Inserendo <strong className="text-foreground">VIA RESIDENZA SPIGA</strong> arriverete nelle immediate vicinanze sia dell'ospedale che degli alloggi.
                    </p>
                    <p>
                      In base all'alloggio vi verra fornito un  <strong className="text-foreground">posto auto</strong>. È presente anche una stazione di ricarica per auto elettriche nelle vicinanze.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: DAGLI AEROPORTI */}
            <div className="bg-primary rounded-[2rem] p-6 md:p-10 card-shadow text-primary-foreground">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Plane className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className="font-display text-2xl uppercase">DAGLI AEROPORTI</h3>
                  <p className="text-primary-foreground/90 leading-relaxed text-base md:text-lg">
                    Visita il nostro blog per scoprire come raggiungerci da tutti gli aeroporti e dalle principali stazioni della zona. Troverai tutte le informazioni utili per arrivare facilmente agli appartamenti.
                  </p>
                  <div className="pt-4">
                    <Link 
                      to="/blog" 
                      className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-all text-sm group"
                    >
                      SCOPRI DI PIÙ <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
            <h3 className="font-display text-primary text-xl font-bold tracking-wide">Difficoltà a trovarci?</h3>
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
