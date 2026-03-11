import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contatti = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Messaggio inviato!", description: "Ti risponderemo il prima possibile." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container text-center">
          <h1 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">Contattaci</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Richiedi disponibilità per il tuo soggiorno.
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
                  { icon: Phone, label: "Telefono", value: "+39 02 000 00 000", href: "tel:+390200000000" },
                  { icon: MessageCircle, label: "WhatsApp", value: "Scrivici su WhatsApp", href: "https://wa.me/390200000000" },
                  { icon: Mail, label: "Email", value: "info@amicidellospedale.it", href: "mailto:info@amicidellospedale.it" },
                  { icon: MapPin, label: "Indirizzo", value: "Zona Milano 2, Segrate (MI)" },
                  { icon: Clock, label: "Orari", value: "Lun - Sab: 9:00 - 19:00" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("https") ? "_blank" : undefined}
                          rel={c.href.startsWith("https") ? "noopener noreferrer" : undefined}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 card-shadow space-y-5">
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

          {/* Mappa */}
          <div className="mt-12">
            <h2 className="font-display text-primary text-xl mb-4">Dove siamo</h2>
            <div className="rounded-xl overflow-hidden h-72 card-shadow">
              <iframe
                title="Posizione Amici dell'Ospedale"
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
        </div>
      </section>
    </>
  );
};

export default Contatti;
