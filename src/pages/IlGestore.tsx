import { Heart, Users, Star, Phone, Mail } from "lucide-react";

const IlGestore = () => (
  <>
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">Il gestore</h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Dietro Amici dell'Ospedale c'è una persona che conosce bene le esigenze di chi vive momenti delicati.
        </p>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="bg-card rounded-xl p-8 md:p-12 card-shadow">
          <h2 className="font-display text-primary text-2xl mb-6">La nostra storia</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Amici dell'Ospedale nasce per offrire un alloggio comodo e accogliente a chi deve soggiornare vicino al San Raffaele per motivi di salute o lavoro.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: Heart, title: "Passione", desc: "Mettiamo il cuore in ogni dettaglio per garantire il massimo comfort ai nostri ospiti." },
            { icon: Users, title: "Esperienza", desc: "Anni di esperienza nell'accoglienza di famiglie, pazienti e professionisti sanitari." },
            { icon: Star, title: "Affidabilità", desc: "Recensioni positive da parte di centinaia di ospiti soddisfatti." },
          ].map((v) => (
            <div key={v.title} className="bg-card rounded-xl p-6 card-shadow text-center">
              <v.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Contatto diretto */}
        <div className="mt-12 bg-accent rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="w-full md:w-auto">
            <h2 className="font-display text-primary text-xl mb-4">Contatto diretto</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+390200000000" className="text-muted-foreground hover:text-primary transition-colors">+39 02 000 00 000</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:info@amicidellospedale.it" className="text-muted-foreground hover:text-primary transition-colors">info@amicidellospedale.it</a>
              </div>
            </div>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=984,h=984,fit=crop/A0xr56pZqkuyoQl8/p1024981-Yg253388a7cGqwEB.jpg" 
              alt="Il gestore" 
              className="w-full h-full object-cover rounded-full shadow-lg border-4 border-background"
            />
          </div>
        </div>
      </div>
    </section>
  </>
);

export default IlGestore;
