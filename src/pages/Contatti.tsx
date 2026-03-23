import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle2, ShieldCheck, User, Heart, Users, Star } from "lucide-react";
import gestoreImg from "@/assets/foto VISO PERSONALE.webp";

import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contatti = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const formData = new FormData(e.currentTarget);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        // @ts-ignore
        body: new URLSearchParams(formData).toString(),
      });
      
      toast({ title: "Messaggio inviato!", description: "Ti risponderemo il prima possibile." });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({ 
        title: "Errore", 
        description: "Si è verificato un problema nell'invio del messaggio. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contatti: Richiedi Disponibilità Alloggio San Raffaele" 
        description="Contattaci per informazioni e prenotazioni di appartamenti e alloggi vicino al San Raffaele Milano. Risposta rapida e assistenza diretta." 
      />
      <section className="hero-gradient py-12 md:py-16">
        <div className="container text-center">
          <h1 className="font-display text-3xl md:text-5xl text-primary-foreground mb-4">Contattaci</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
            Siamo a tua disposizione per ogni informazione o richiesta di prenotazione.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Info */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="font-display text-primary text-xl">Informazioni di contatto</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Telefono", value: "+39 345 795 6159", href: "tel:+393457956159", aria: "Chiama il numero" },
                  { icon: MessageCircle, label: "WhatsApp", value: "Scrivici su WhatsApp", href: "https://wa.me/393457956159", aria: "Inizia una chat su WhatsApp" },
                  { icon: MapPin, label: "Indirizzo", value: "Zona Milano 2, Segrate (MI)" },
                  { icon: Clock, label: "Orari", value: "Lun - Sab: 9:00 - 19:00" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("https") ? "_blank" : undefined}
                          rel={c.href.startsWith("https") ? "noopener noreferrer" : undefined}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          aria-label={c.aria}
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              <form 
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit} 
                className="bg-card rounded-xl p-6 md:p-8 card-shadow space-y-5"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>Don't fill this out if you're human: <input name="bot-field" /></label>
                </p>
                <h2 className="font-display text-primary text-xl">Inviaci un messaggio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="Nome" required name="name" />
                  <Input placeholder="Cognome" required name="surname" />
                </div>
                <Input type="email" placeholder="Email" required name="email" />
                <Input type="tel" placeholder="Telefono (opzionale)" name="phone" />
                <Textarea placeholder="Il tuo messaggio..." required name="message" rows={5} />
                <Button type="submit" className="w-full rounded-full" size="lg" disabled={sending}>
                  {sending ? "Invio in corso..." : "Invia messaggio"}
                </Button>
              </form>
            </div>
          </div>

          {/* Il Gestore - Merged Content */}
          <div className="border-t border-border pt-20">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-8 md:p-12 card-shadow mb-12">
                <h2 className="font-display text-primary text-2xl mb-6 text-center">La nostra storia</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Amici del San Raffaele nasce per offrire un alloggio comodo e accogliente a chi deve soggiornare vicino al San Raffaele per motivi di salute o lavoro.
                  </p>
                  <p>
                    L'idea è nata dall'esperienza diretta di chi ha vissuto la necessità di trovare un posto sicuro e vicino all'ospedale durante un momento delicato della vita. Sappiamo quanto sia importante avere un punto di appoggio pulito, accogliente e a portata di mano quando un familiare è ricoverato o quando si devono affrontare cicli di cure che richiedono soggiorni prolungati.
                  </p>
                  <p>
                    Per questo abbiamo creato questo servizio: per offrire a familiari, pazienti e personale sanitario un'alternativa confortevole e accessibile agli hotel, con la flessibilità e il calore di una vera casa.
                  </p>
                  <p>
                    Ogni ospite viene seguito con attenzione e cura, perché crediamo che il comfort dell'alloggio contribuisca al benessere di chi sta vivendo un periodo impegnativo.
                  </p>
                </div>
              </div>

              {/* Valori */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: Heart, title: "Passione", desc: "Mettiamo il cuore in ogni dettaglio per garantire il massimo comfort ai nostri ospiti." },
                  { icon: Users, title: "Esperienza", desc: "Anni di esperienza nell'accoglienza di famiglie, pazienti e professionisti sanitari." },
                  { icon: Star, title: "Affidabilità", desc: "Recensioni positive da parte di centinaia di ospiti soddisfatti." },
                ].map((v) => (
                  <div key={v.title} className="bg-card rounded-xl p-6 card-shadow text-center hover:bg-accent/50 transition-colors">
                    <v.icon className="w-10 h-10 text-primary mx-auto mb-4" aria-hidden="true" />
                    <h3 className="font-semibold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                ))}
              </div>

              {/* Contatto diretto */}
              <div className="bg-accent/30 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 justify-between border border-primary/10">
                <div className="w-full md:w-auto text-center md:text-left">
                  <h2 className="font-display text-primary text-2xl mb-4">Parla con Gabriele</h2>
                  <p className="text-muted-foreground mb-6 max-w-sm">Per assistenza diretta o domande specifiche sugli alloggi, puoi contattarmi personalmente.</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
                      <a href="tel:+393457956159" className="text-foreground font-medium hover:text-primary transition-colors">+39 345 795 6159</a>
                    </div>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                      <a href="https://wa.me/393457956159" className="text-foreground font-medium hover:text-primary transition-colors">Chat su WhatsApp</a>
                    </div>
                  </div>
                </div>
                <div className="w-40 h-40 md:w-48 md:h-48 shrink-0">
                  <img 
                    src={gestoreImg} 
                    alt="Gabriele, il gestore di Amici del San Raffaele" 
                    className="w-full h-full object-cover object-top rounded-full shadow-2xl border-4 border-background pointer-events-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contatti;
