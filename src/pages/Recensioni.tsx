import { Star, Quote, Heart } from "lucide-react";

const reviews = [
  {
    name: "Maria R.",
    date: "Febbraio 2026",
    rating: 5,
    text: "Abbiamo soggiornato per due settimane durante il ricovero di mio padre. L'appartamento era pulito, accogliente e vicinissimo all'ospedale. Gabriele è stato disponibilissimo e ci ha aiutato con tutto. Consigliatissimo!",
  },
  {
    name: "Giuseppe T.",
    date: "Gennaio 2026",
    rating: 5,
    text: "Ottima posizione, a pochi passi dal San Raffaele. L'appartamento ha tutto il necessario: cucina attrezzata, Wi-Fi, aria condizionata. Il servizio di trasferimento dall'aeroporto è stato molto comodo.",
  },
  {
    name: "Lucia M.",
    date: "Dicembre 2025",
    rating: 5,
    text: "Ho trovato questo alloggio durante un periodo difficile e devo dire che ha reso tutto più sopportabile. La zona è tranquilla, l'appartamento confortevole e il gestore sempre reperibile. Grazie di cuore.",
  },
  {
    name: "Franco B.",
    date: "Novembre 2025",
    rating: 4,
    text: "Soggiorno di una settimana per accompagnare mia moglie in day hospital. L'appartamento è esattamente come nelle foto, pulito e ben organizzato. La vicinanza all'ospedale è il punto forte.",
  },
  {
    name: "Anna P.",
    date: "Ottobre 2025",
    rating: 5,
    text: "Struttura eccellente per chi deve stare vicino al San Raffaele. Abbiamo apprezzato la pulizia, la tranquillità della zona e soprattutto la gentilezza di Gabriele. Torneremo sicuramente.",
  },
  {
    name: "Roberto C.",
    date: "Settembre 2025",
    rating: 5,
    text: "Prezzo onesto, posizione perfetta e appartamento con tutti i comfort. Il quartiere di Milano 2 è bellissimo, con parchi e servizi a portata di mano. Lo consiglio a tutti.",
  },
  {
    name: "Silvana D.",
    date: "Agosto 2025",
    rating: 5,
    text: "Abbiamo soggiornato per un mese intero. L'appartamento è diventato la nostra seconda casa. Cucina completa, lavatrice, terrazzo con vista. Il gestore ci ha fatto sentire a casa.",
  },
  {
    name: "Marco L.",
    date: "Luglio 2025",
    rating: 4,
    text: "Soluzione pratica e conveniente rispetto agli hotel della zona. L'appartamento è semplice ma ha tutto ciò che serve. La posizione vicino all'ospedale è imbattibile.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-primary text-primary" : "text-border"}`}
      />
    ))}
  </div>
);

const Recensioni = () => (
  <>
    {/* Hero */}
    <section className="hero-gradient py-12 sm:py-16 md:py-20">
      <div className="container text-center px-4">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-3 md:mb-4">
          Recensioni
        </h1>
        <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm sm:text-base">
          Cosa dicono i nostri ospiti della loro esperienza con Amici dell'Ospedale.
        </p>
      </div>
    </section>

    {/* Stats */}
    <section className="py-10 sm:py-12 md:py-16 bg-background">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto">
          {[
            { value: "4.9", label: "Valutazione media" },
            { value: "200+", label: "Ospiti accolti" },
            { value: "98%", label: "Consiglia" },
            { value: "10+", label: "Anni di esperienza" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow text-center">
              <p className="font-display text-primary text-xl sm:text-2xl md:text-3xl mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Reviews Grid */}
    <section className="py-10 sm:py-12 md:py-16 section-gradient">
      <div className="container px-4">
        <h2 className="font-display text-primary text-xl sm:text-2xl md:text-3xl text-center mb-3 md:mb-4">
          Le esperienze dei nostri ospiti
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base">
          Ogni recensione racconta una storia di vicinanza, comfort e supporto nei momenti che contano.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-card rounded-xl p-5 sm:p-6 card-shadow hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mb-3 sm:mb-4 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow mb-4">
                "{review.text}"
              </p>
              <div className="border-t border-border pt-4 mt-auto">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container px-4 text-center">
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 card-shadow max-w-2xl mx-auto">
          <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-primary text-xl sm:text-2xl mb-3 md:mb-4">
            Anche tu hai soggiornato con noi?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
            La tua opinione è importante! Contattaci per lasciare la tua recensione e aiutare altre famiglie a trovare il comfort di cui hanno bisogno.
          </p>
          <a
            href="https://wa.me/390200000000?text=Vorrei%20lasciare%20una%20recensione"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Lascia una recensione
          </a>
        </div>
      </div>
    </section>
  </>
);

export default Recensioni;
