import { Heart, Users, Star } from "lucide-react";

const IlGestore = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Il gestore</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Dietro Amici dell'Ospedale c'è una persona che conosce bene le esigenze di chi vive momenti difficili.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="bg-card rounded-xl p-8 md:p-12 card-shadow">
          <h2 className="text-2xl font-bold mb-6">La nostra storia</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Amici dell'Ospedale nasce dall'esperienza diretta di chi ha vissuto la necessità di trovare un alloggio comodo e vicino all'ospedale durante un momento delicato della vita.
            </p>
            <p>
              Sappiamo quanto sia importante avere un punto di appoggio sicuro, pulito e accogliente quando un familiare è ricoverato o quando si devono affrontare cicli di cure che richiedono soggiorni prolungati.
            </p>
            <p>
              Per questo abbiamo creato questo servizio: per offrire a familiari, pazienti e personale sanitario un'alternativa confortevole e accessibile agli hotel, con la flessibilità e il calore di una vera casa.
            </p>
            <p>
              Ogni ospite viene seguito con attenzione e cura, perché crediamo che il comfort dell'alloggio contribuisca al benessere di chi sta vivendo un periodo impegnativo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: Heart, title: "Passione", desc: "Mettiamo il cuore in ogni dettaglio per garantire il massimo comfort." },
            { icon: Users, title: "Esperienza", desc: "Anni di esperienza nell'accoglienza di famiglie e pazienti." },
            { icon: Star, title: "Affidabilità", desc: "Recensioni positive da parte di centinaia di ospiti soddisfatti." },
          ].map((v) => (
            <div key={v.title} className="bg-card rounded-xl p-6 card-shadow text-center">
              <v.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default IlGestore;
