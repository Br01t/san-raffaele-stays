import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Contattaci</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Hai domande o vuoi prenotare? Siamo qui per aiutarti.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Info */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-bold">Informazioni di contatto</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Telefono", value: "+39 02 000 00 000", href: "tel:+390200000000" },
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
                        <a href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
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
                <h2 className="text-xl font-bold">Inviaci un messaggio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input placeholder="Nome" required name="name" />
                  <Input placeholder="Cognome" required name="surname" />
                </div>
                <Input type="email" placeholder="Email" required name="email" />
                <Input type="tel" placeholder="Telefono (opzionale)" name="phone" />
                <Textarea placeholder="Il tuo messaggio..." required name="message" rows={5} />
                <Button type="submit" className="w-full" size="lg" disabled={sending}>
                  {sending ? "Invio in corso..." : "Invia messaggio"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contatti;
