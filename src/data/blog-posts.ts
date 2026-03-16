import milano2Img from "@/assets/foto milano 2 .webp";

export interface BlogPostData {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  content: string; // HTML allowed for structure
}

export const blogArticles: BlogPostData[] = [
  {
    id: "come-arrivare-san-raffaele",
    title: "Come arrivare all’Ospedale San Raffaele da stazioni e aeroporti",
    date: "14 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "L’Ospedale San Raffaele si trova nella zona nord-est di Milano, nel quartiere Milano 2. Scopri come raggiungerlo facilmente da tutte le stazioni e aeroporti di Milano.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        Raggiungere l'<strong>Ospedale San Raffaele</strong> non è solo una questione di mappe e coordinate, ma il primo passo di un soggiorno che deve essere il più sereno possibile. 
        Situato nel cuore del quartiere <strong>Milano 2</strong>, a Segrate, il complesso ospedaliero è perfettamente integrato nella rete dei trasporti milanesi, rendendo l'arrivo semplice sia che tu viaggi in treno che in aereo.
      </p>
      
      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Arrivare in Treno: Milano Centrale e Rogoredo</h2>
      <p class="mb-6">
        Se il tuo viaggio inizia da una delle grandi stazioni ferroviarie milanesi, la tua bussola sarà la <strong>Metropolitana Linea Verde (M2)</strong>. 
        È questa la linea che collega il centro della città direttamente con la zona est.
      </p>
      
      <h3 class="text-2xl font-display text-primary mt-12 mb-6">Da Milano Centrale</h3>
      <p class="mb-6">
        Una volta sceso dal treno a <strong>Milano Centrale</strong>, segui le indicazioni per la metropolitana M2 (colore verde). Dovrai prendere il treno in direzione <strong>Cologno Monzese</strong> oppure <strong>Gessate</strong>. 
        Il viaggio dura circa 20 minuti e la tua fermata di riferimento è <strong>Cascina Gobba</strong>.
      </p>
      <ul class="list-disc pl-6 space-y-3 mb-8">
        <li><strong>Tempo stimato:</strong> circa 35-40 minuti totali, inclusi gli scambi.</li>
        <li><strong>Biglietto:</strong> avrai bisogno di un biglietto urban Mi1-Mi3 (costo €2.20).</li>
        <li><strong>In alternativa:</strong> un taxi dalla stazione Centrale impiega circa 10-15 minuti, con una tariffa che solitamente oscilla tra i 20 e i 25 euro.</li>
      </ul>

      <h3 class="text-2xl font-display text-primary mt-12 mb-6">Da Milano Rogoredo</h3>
      <p class="mb-6">
        Se arrivi con l'Alta Velocità a <strong>Rogoredo</strong>, la via più rapida è prendere la metropolitana Gialla (M3) fino a Centrale e poi cambiare con la Verde (M2). 
        Il tragitto complessivo richiede circa 45 minuti, ma ti permette di attraversare la città in modo efficiente.
      </p>

      <h2 class="text-3xl font-display text-primary mt-20 mb-8">In Volo verso Milano: Gli Aeroporti</h2>
      <p class="mb-8">
        Milano è servita da tre aeroporti principali, ognuno con le sue peculiarità e collegamenti dedicati verso l'area del San Raffaele.
      </p>

      <h3 class="text-2xl font-display text-primary mt-12 mb-6">Linate: il più vicino</h3>
      <p class="mb-6">
        Se atterri a <strong>Linate</strong>, sei già molto vicino all'Ospedale. La soluzione più comoda è il <strong>Bus 923</strong>, che ti porta direttamente davanti all'ingresso del San Raffaele in circa 15-20 minuti. 
        In alternativa, con la nuova metropolitana Blu (M4) puoi arrivare a San Babila e poi proseguire con la Linea Verde (M2).
      </p>

      <h3 class="text-2xl font-display text-primary mt-12 mb-6">Malpensa e Orio al Serio</h3>
      <p class="mb-6">
        Per chi atterra a <strong>Malpensa</strong> o <strong>Bergamo Orio al Serio</strong>, il percorso prevede solitamente un passaggio da Milano Centrale.
      </p>
      <ul class="list-disc pl-6 space-y-4 mb-12 text-muted-foreground italic">
        <li>Da <strong>Malpensa</strong>: il treno Malpensa Express ti porta a Centrale in circa un'ora (€13.00).</li>
        <li>Da <strong>Orio al Serio</strong>: i numerosi Shuttle Bus collegano l'aeroporto con la Stazione Centrale in circa 50 minuti (€10-12).</li>
      </ul>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 mt-16 mb-12">
        <h4 class="text-xl font-display text-primary mb-4">L'ultimo miglio: Da Cascina Gobba al San Raffaele</h4>
        <p class="m-0 leading-relaxed">
          Una volta arrivato alla fermata di <strong>Cascina Gobba</strong>, hai due opzioni finali. Puoi prendere il <strong>Bus 925</strong> (fermata proprio fuori dalla metro) oppure utilizzare la <strong>Metro Leggera</strong>, un trenino automatico che entra direttamente all'interno del complesso ospedaliero. 
          Quest'ultima è particolarmente pratica se hai bagagli o preferisci evitare il traffico stradale.
        </p>
      </div>
    `

  },
  {
    id: "come-arrivare-stazione-centrale",
    title: "Come arrivare al San Raffaele dalla Stazione Centrale di Milano",
    date: "15 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "La Stazione di Milano Centrale è il principale punto di arrivo in città. Scopri come raggiungere l'ospedale in modo semplice ed economico.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        La <strong>Stazione di Milano Centrale</strong> non è solo un capolavoro architettonico, ma il principale punto di ingresso per chi raggiunge la città da tutta Italia. Se il tuo viaggio prosegue verso l'Ospedale San Raffaele, sarai felice di sapere che il collegamento è estremamente efficiente.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">La Metro: la soluzione più veloce</h2>
      <p class="mb-6">
        Il modo più rapido e immediato per muoversi è senza dubbio la metropolitana. Una volta sceso dal treno, segui le inconfondibili insegne della <strong>Linea Verde M2</strong>.
      </p>
      <p class="mb-6">
        Dovrai prendere il treno in direzione <strong>Cologno Nord</strong> oppure <strong>Gessate</strong>. Dopo circa 20 minuti di tragitto, la tua fermata sarà <strong>Cascina Gobba</strong>, il vero e proprio "cancello d'ingresso" per l'area ospedaliera.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Dettagli del Viaggio</h3>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Costo:</strong> € 2,20 (Biglietto Urban Mi1-Mi3)</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Tempo totale:</strong> circa 35 minuti</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Dalla Metro all'Ospedale</h2>
      <p class="mb-6">
        Una volta arrivato a Cascina Gobba, hai due comode opzioni per coprire l'ultimo breve tratto:
      </p>
      <ul class="list-disc pl-6 space-y-4 mb-10">
        <li><strong>Bus 925:</strong> la fermata si trova proprio all'esterno della stazione della metropolitana.</li>
        <li><strong>Navetta Interna (Metro Leggera):</strong> un servizio dedicato che entra direttamente nel complesso ospedaliero, ideale per chi preferisce evitare il traffico.</li>
      </ul>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">L'alternativa in Taxi</h2>
      <p class="mb-6">
        Se viaggi con molti bagagli o preferisci la comodità di un tragitto porta-a-porta, troverai i taxi pronti all'uscita della Stazione Centrale.
      </p>
      <p class="mb-8 italic text-muted-foreground">
        In condizioni di traffico normale, il viaggio dura circa 15 minuti con un costo indicativo tra i 20 e i 25 euro.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium">
        Per chi deve recarsi al San Raffaele per visite o ricoveri, la metropolitana resta generalmente la soluzione più semplice, economica e puntuale.
      </p>
    `
  },
  {
    id: "come-arrivare-linate",
    title: "Come arrivare al San Raffaele dall’aeroporto di Linate",
    date: "16 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "L'aeroporto cittadino di Milano è la porta d'ingresso più vicina all'ospedale. Scopri tutte le opzioni per un arrivo veloce.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        L’<strong>Aeroporto di Milano Linate</strong> è il vero city airport di Milano e, per la sua posizione strategica, rappresenta lo scalo più vicino e comodo per chi deve raggiungere l’Ospedale San Raffaele. La breve distanza permette di arrivare a destinazione in tempi molto ridotti, rendendo il viaggio meno faticoso.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Mezzi Pubblici: Economia e Collegamenti</h2>
      <p class="mb-6">
        Anche se Linate non è ancora collegato direttamente via ferrovia al San Raffaele, la rete di autobus urbani ed extraurbani offre soluzioni semplici.
      </p>
      <p class="mb-6">
        La strada più lineare prevede di raggiungere la <strong>Linea Verde M2</strong> della metropolitana. Una volta arrivati a <strong>Cascina Gobba</strong>, avrai a disposizione tutto il sistema di navette e bus diretti all'area medica.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">In Sintesi</h3>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Costo del biglietto:</strong> circa € 2,20</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Tempo medio:</strong> 40-50 minuti</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">La scelta più Rapida: il Taxi</h2>
      <p class="mb-6">
        Data la vicinanza, il taxi è spesso l'opzione preferita da chi arriva in aereo, soprattutto se si viaggia con bagagli o se si ha necessità di arrivare tempestivamente per una visita.
      </p>
      <p class="mb-8">
        Dall’aeroporto di Linate, un taxi impiega mediamente <strong>solo 15 minuti</strong> per raggiungere l'ingresso del San Raffaele. Il costo della corsa è contenuto, aggirandosi solitamente intorno ai <strong>20 €</strong> (variabile in base all'orario e al traffico cittadino).
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Grazie alla breve distanza, Linate si conferma spesso la scelta logistica migliore per chi programma un arrivo in aereo finalizzato a una permanenza vicino al polo ospedaliero.
      </p>
    `
  },
  {
    id: "come-arrivare-orio-al-serio",
    title: "Come arrivare al San Raffaele dall’aeroporto di Bergamo Orio al Serio",
    date: "17 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Lo scalo di Orio al Serio è il punto di riferimento per i voli low cost. Ecco come raggiungere l'ospedale in modo semplice.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        L’<strong>Aeroporto di Bergamo Orio al Serio (BGY)</strong> è diventato negli anni uno dei principali punti d’accesso per chi arriva in Lombardia, grazie alla fitta rete di voli low cost. Sebbene si trovi a circa 50 chilometri da Milano, i collegamenti con la città e con la zona dell'Ospedale San Raffaele sono frequenti e ben organizzati.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Lo Shuttle Bus: la scelta più comune</h2>
      <p class="mb-6">
        Dato che l'aeroporto non dispone di una stazione ferroviaria interna, la soluzione più pratica ed economica è rappresentata dai numerosi <strong>Shuttle Bus</strong> che partono proprio davanti al terminal degli arrivi.
      </p>
      <p class="mb-6">
        Questi autobus partono ogni 20-30 minuti e ti portano direttamente alla <strong>Stazione Centrale di Milano</strong>. Il viaggio dura circa un'ora, a seconda del traffico autostradale, e il costo del biglietto è molto contenuto, solitamente compreso tra i 10 e i 12 euro.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Informazioni Utili</h3>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Tempo bus:</strong> circa 60 minuti fino a Centrale</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Biglietto Metro:</strong> € 2,20 (da Centrale a Cascina Gobba)</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Il Proseguimento verso l'Ospedale</h2>
      <p class="mb-6">
        Una volta arrivato alla Stazione di Milano Centrale, il resto del percorso è identico a chi arriva in treno. Dovrai scendere nella metropolitana e prendere la <strong>Linea Verde M2</strong> in direzione Cologno o Gessate.
      </p>
      <p class="mb-8">
        La tua destinazione finale in metro sarà <strong>Cascina Gobba</strong>. Da lì, potrai scegliere se salire sul bus 925 o utilizzare la Metro Leggera dell'ospedale per completare l'ultimo tratto e arrivare direttamente all'interno del complesso clinico.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">L'opzione Taxi</h2>
      <p class="mb-6">
        Prendere un taxi direttamente da Orio al Serio al San Raffaele è una soluzione molto comoda ma decisamente più costosa. Essendo un tragitto extraurbano di lunga percorrenza, la tariffa può arrivare a circa <strong>90 €</strong>.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Per chi cerca l'equilibrio migliore tra comodità e spesa, la combinazione Shuttle Bus + Metro resta la soluzione imbattibile per raggiungere il polo ospedaliero dallo scalo bergamasco.
      </p>
    `
  },
  {
    id: "come-arrivare-malpensa",
    title: "Come arrivare al San Raffaele dall’aeroporto di Milano Malpensa",
    date: "18 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "L'aeroporto di Malpensa è il principale scalo internazionale. Ecco le soluzioni migliori per raggiungere l'ospedale.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        L’<strong>Aeroporto di Milano Malpensa (MXP)</strong> è la principale porta d’accesso internazionale per chi arriva a Milano. Pur essendo distante dal centro città, offre collegamenti rapidi e frequenti che permettono di raggiungere l’area dell’Ospedale San Raffaele in modo organizzato.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Soluzione 1: Il Malpensa Express</h2>
      <p class="mb-6">
        Il treno <strong>Malpensa Express</strong> è la via più veloce per raggiungere il cuore di Milano evitando il traffico. Puoi scegliere due tragitti principali:
      </p>
      <ul class="list-disc pl-6 space-y-4 mb-8">
        <li><strong>Fino a Milano Cadorna:</strong> il treno impiega circa 37 minuti. Da Cadorna, puoi prendere direttamente la <strong>Metropolitana Linea Verde M2</strong> in direzione Cologno o Gessate fino a Cascina Gobba.</li>
        <li><strong>Fino a Milano Centrale:</strong> il viaggio dura circa 50 minuti. Come per chi arriva in treno, da Centrale proseguirai con la <strong>M2 (Verde)</strong> fino a Cascina Gobba.</li>
      </ul>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Soluzione 2: Lo Shuttle Bus</h2>
      <p class="mb-6">
        Se preferisci un’alternativa su gomma, diversi bus navetta collegano i terminal di Malpensa con la <strong>Stazione Centrale</strong> in circa un'ora. Da lì, il percorso prosegue come di consueto in metropolitana verso la zona del San Raffaele.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Panoramica Costi e Tempi</h3>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Treno Malpensa Express:</strong> circa € 13,00</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span><strong>Tempo totale di viaggio:</strong> tra 1 ora e 1 ora e 20 minuti</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Il Trasferimento in Taxi</h2>
      <p class="mb-6">
        Per chi cerca il massimo della comodità e un trasferimento diretto senza cambi, il taxi è l'opzione ideale, sebbene sia la più onerosa.
      </p>
      <p class="mb-8">
        La tariffa media per un tragitto da Malpensa all'Ospedale San Raffaele si aggira intorno ai <strong>110 €</strong>. È una soluzione consigliata soprattutto se si viaggia in gruppo o con bagagli ingombranti, garantendo un arrivo "porta a porta" in circa 50-60 minuti (variabili in base al traffico).
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Sia che tu scelga la rapidità del treno o la comodità del taxi, Malpensa offre tutte le opzioni necessarie per iniziare il tuo soggiorno con serenità.
      </p>
    `
  },
  {
    id: "dove-dormire-vicino-san-raffaele",
    title: "Dove dormire vicino all’Ospedale San Raffaele: guida agli alloggi",
    date: "19 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Trovare la sistemazione giusta vicino all'ospedale è fondamentale. Scopri i vantaggi di scegliere un appartamento a Milano 2.",
    content: `      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        Il <strong>Ospedale San Raffaele</strong> è un punto di riferimento medico internazionale. Ogni anno accoglie migliaia di persone, rendendo la ricerca di un <strong>alloggio vicino San Raffaele Milano</strong> una priorità per molti. Ma quali sono le differenze tra le varie opzioni disponibili?
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Hotel vicino San Raffaele vs Appartamenti</h2>
      <p class="mb-6">
        Molti visitatori iniziano la loro ricerca cercando un <strong>hotel vicino San Raffaele</strong>. Strutture come l’NH Milano 2 o l'Hotel Rafael offrono i classici servizi alberghieri. Tuttavia, per chi deve soggiornare per più giorni, la mancanza di una cucina e gli spazi ridotti possono diventare un limite.
      </p>
      <p class="mb-6">
        Scegliere un appartamento rispetto a un <strong>hotel vicino San Raffaele</strong> significa avere più autonomia, poter cucinare i propri pasti (risparmiando notevolmente) e vivere in un ambiente che ricorda il calore di casa, fondamentale in momenti di stress legato alla salute.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">B&B San Raffaele: Una Soluzione Flessibile</h2>
      <p class="mb-6">
        Un'altra ricerca frequente è quella per un <strong>B&B San Raffaele</strong>. Queste soluzioni sono spesso apprezzate per il contatto umano e la semplicità. Gli appartamenti <strong>Amici del San Raffaele</strong> uniscono la flessibilità tipica di un <strong>B&B San Raffaele</strong> alla privacy e allo spazio di un'abitazione privata completa.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">I Vantaggi dell'Appartamento</h3>
        <ul class="list-disc pl-6 space-y-3">
          <li><strong>Autonomia:</strong> puoi organizzare i pasti in modo flessibile.</li>
          <li><strong>Risparmio:</strong> la possibilità di cucinare riduce sensibilmente i costi.</li>
          <li><strong>Spazio:</strong> ambienti più grandi e simili a casa propria.</li>
          <li><strong>Vicinanza:</strong> possibilità di raggiungere l'ospedale a piedi in pochi minuti.</li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Una Soluzione Pensata per Te</h2>
      <p class="mb-6">
        Se stai cercando un alloggio a pochi minuti a piedi dal San Raffaele, puoi scoprire gli appartamenti <strong>Amici del San Raffaele</strong>, situati nel quartiere Milano 2 e pensati proprio per offrire una soluzione pratica e confortevole a chi deve soggiornare vicino all’ospedale.
      </p>
      <p class="mb-8">
        Avere un punto di appoggio vicino all’ospedale può rendere il soggiorno molto più semplice e meno stressante, permettendoti di concentrarti su ciò che conta davvero: la salute e la vicinanza ai propri cari.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Scegliere l'alloggio giusto è il primo passo per affrontare con serenità un periodo delicato lontano da casa.
      </p>
    `
  },
  {
    id: "necessita-appartamenti-san-raffaele",
    title: "Appartamenti vicino all’Ospedale San Raffaele: una soluzione nata dalla necessità dei pazienti",
    date: "20 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Milano 2 non è solo un quartiere residenziale, ma un punto di riferimento fondamentale per chi cerca cura e assistenza al San Raffaele.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        L’<strong>Ospedale San Raffaele</strong> è oggi uno dei più importanti centri ospedalieri e di ricerca in Italia. Ogni anno migliaia di pazienti arrivano a Milano per visite specialistiche, esami diagnostici, interventi o periodi di cura. Molti di loro provengono da altre regioni o dall’estero e hanno quindi la necessità di trovare un alloggio vicino all’ospedale.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Milano 2: Un Quartiere a Misura d'Uomo</h2>
      <p class="mb-6">
        Il San Raffaele si trova nel quartiere di <strong>Milano Due</strong>, un’area residenziale progettata negli anni ’70 come quartiere moderno immerso nel verde e pensato per offrire tranquillità e qualità della vita. La presenza dell’ospedale ha reso negli anni questa zona un punto di riferimento non solo per i residenti, ma anche per i pazienti e i familiari che arrivano a Milano per motivi sanitari.
      </p>
      <p class="mb-6">
        Proprio per questa ragione, nel tempo si è sviluppata una crescente necessità di appartamenti situati nelle immediate vicinanze dell’ospedale, capaci di offrire un punto di appoggio comodo e pratico durante il soggiorno.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Perché l'Appartamento fa la Differenza</h2>
      <p class="mb-6">
        Molte persone che arrivano al San Raffaele devono infatti fermarsi diversi giorni o settimane. In questi casi, soggiornare in un appartamento può essere una soluzione particolarmente adatta: permette di avere più spazio, maggiore autonomia e la possibilità di vivere il soggiorno in un ambiente più tranquillo e familiare.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Le Caratteristiche più Apprezzate</h3>
        <ul class="list-none p-0 space-y-4">
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Vicinanza Strategica:</strong> la struttura ospedaliera è spesso raggiungibile a piedi in pochi minuti.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Spazi Domestici:</strong> ambienti molto più ampi e vivibili rispetto a una camera d’hotel.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Gestione dei Pasti:</strong> una cucina attrezzata permette di mantenere le proprie abitudini alimentari.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Contesto Sereno:</strong> un quartiere immerso nel verde, ideale per il riposo e la convalescenza.</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Un Supporto Concreto per le Famiglie</h2>
      <p class="mb-6">
        Questi aspetti sono particolarmente importanti per i familiari dei pazienti o per chi deve affrontare un periodo di visite e controlli medici. Avere un alloggio vicino all’ospedale permette infatti di ridurre gli spostamenti e rendere più semplice la gestione della quotidianità in un momento delicato.
      </p>
      <p class="mb-6">
        Tra queste soluzioni ci sono anche gli appartamenti <strong>Amici del San Raffaele</strong>, nati proprio con l'obiettivo di offrire un punto di appoggio semplice, confortevole e a pochissimi passi dalla struttura ospedaliera.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Avere una casa lontana da casa aiuta ad affrontare il percorso di cura con una preoccupazione logistica in meno.
      </p>
    `
  },
  {
    id: "dove-mangiare-vicino-san-raffaele",
    title: "Dove mangiare vicino all’Ospedale San Raffaele: bar, ristoranti e supermercati a Milano 2",
    date: "21 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Dalla colazione alla cena, una guida completa ai posti migliori dove mangiare e fare la spesa nel quartiere Milano 2.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        Chi arriva all'<strong>Ospedale San Raffaele</strong> spesso si trova a passare molte ore nella zona tra visite, esami o assistenza a un familiare. Una delle domande più frequenti che riceviamo è proprio: <em>"Dove posso mangiare qualcosa di buono senza allontanarmi troppo?"</em>.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Ristoranti: tra Tradizione e Comodità</h2>
      <p class="mb-6">
        Se cerchi un pasto completo, la zona offre diverse soluzioni, a partire dall'interno stesso dell'ospedale fino ai caratteristici locali di Milano 2.
      </p>
      <p class="mb-6">
        All'interno del complesso ospedaliero, il punto di riferimento è <strong>Al Pozzo di Samaria</strong> (via Olgettina 60), ideale per un pranzo veloce con cucina italiana o una pizza. Se invece hai tempo per una breve passeggiata nel verde di Milano 2, le opzioni si aprono:
      </p>
      <ul class="list-disc pl-6 space-y-3 mb-10">
        <li><strong>Mangiafuoco Bracerie:</strong> per gli amanti della carne alla griglia (15 min a piedi).</li>
        <li><strong>Osteria Cascina Ovi:</strong> cucina mediterranea in una suggestiva cascina storica (15 min a piedi).</li>
        <li><strong>China Town:</strong> un locale iconico per chi ama i sapori asiatici (7 min a piedi).</li>
        <li><strong>Al Laghetto:</strong> cucina italiana con una splendida vista sul laghetto di Milano 2 (8 min a piedi).</li>
        <li><strong>La Grande Italia:</strong> situato presso lo Sporting Club, è la nostra scelta consigliata per una pizza gustosa.</li>
      </ul>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Pausa Caffè e Snack Veloci</h2>
      <p class="mb-6">
        Per una colazione energetica o un pranzo leggero, i bar del quartiere sono sempre pronti ad accoglierti con un sorriso.
      </p>
      <p class="mb-6">
        Tra i più amati dai residenti e dai visitatori troviamo il <strong>Maximilian Bistrot</strong> al Palazzo dei Cigni e lo storico <strong>Il Cigno</strong>, quest'ultimo particolarmente apprezzato per la qualità del suo catering. Se cerchi un ambiente più tranquillo tra i portici delle residenze, l'<strong>Art Cafè</strong> e il <strong>Bar Club2</strong> sono ottime alternative per una sosta rigenerante.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Fare la spesa a Milano 2</h3>
        <p class="mb-4">Per chi soggiorna in appartamento e preferisce l'autonomia della propria cucina, ecco i punti vendita principali:</p>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Viaggiator Goloso (Residenza Botteghe):</strong> supermercato di alta qualità con ottimi piatti pronti.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Carrefour Express:</strong> comodissimo, situato proprio all'interno del San Raffaele.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Esselunga di Segrate:</strong> la soluzione più grande e fornita, a pochi minuti di auto o bus.</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Perché molti scelgono di cucinare "a casa"</h2>
      <p class="mb-6">
        Soggiornare per periodi medi o lunghi vicino all'ospedale può essere impegnativo. Molti dei nostri ospiti scelgono gli appartamenti <strong>Amici del San Raffaele</strong> proprio per la libertà di poter fare la spesa e cucinare i propri pasti in totale autonomia. 
      </p>
      <p class="mb-8">
        Questo non solo permette un notevole risparmio economico, ma offre anche quel calore domestico che un hotel non può dare, rendendo la permanenza a Milano 2 molto più simile alla vita di tutti i giorni.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Che sia un caffè veloce al Cigno o una cena tranquilla in appartamento, il quartiere offre tutto ciò di cui hai bisogno per sentirti a casa.
      </p>
    `
  },
  {
    id: "farmacie-vicino-san-raffaele",
    title: "Farmacie vicino all’Ospedale San Raffaele: orari e farmacie aperte",
    date: "22 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Trovare rapidamente farmaci o articoli sanitari è fondamentale durante un ricovero o una visita. Ecco i punti di riferimento in zona.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        Chi arriva all'<strong>Ospedale San Raffaele</strong> per visite, esami o per assistere un familiare può avere la necessità di trovare rapidamente una farmacia nelle vicinanze. Fortunatamente nella zona di via Olgettina e Milano 2 sono presenti diverse opzioni facilmente raggiungibili.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">All'Interno dell'HSR: La Soluzione più Rapida</h2>
      <p class="mb-6">
        All’interno del complesso ospedaliero stesso è presente una farmacia aperta al pubblico. È la soluzione ideale se ti trovi già nell'area medica e hai bisogno di acquistare farmaci, prodotti per l'igiene o articoli parafarmaceutici senza dover uscire dalla struttura.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Punti di Riferimento a Milano 2</h2>
      <p class="mb-6">
        Se invece soggiorni negli appartamenti o preferisci muoverti nel quartiere, la <strong>Farmacia di Milano Due</strong> è il principale punto di riferimento per i residenti e i visitatori. Qui potrai trovare un servizio completo che include farmaci da banco, gestione di prescrizioni e consulenze specializzate in un ambiente sereno e professionale.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Urgenze e Orari Notturni</h3>
        <p class="mb-4">In caso di necessità fuori dai normali orari di apertura:</p>
        <ul class="list-none p-0 space-y-3">
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Farmacie di Turno:</strong> Nel comune di Segrate e nella vicina Milano sono sempre garantiti presidi aperti di notte e nei festivi.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2"></span>
            <span><strong>Come verificare:</strong> Ti consigliamo di consultare sempre siti ufficiali o app aggiornate per conoscere la farmacia di turno più vicina in tempo reale.</span>
          </li>
        </ul>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Un Supporto per la tua Permanenza</h2>
      <p class="mb-6">
        Avere presidi farmaceutici così vicini è un grande vantaggio logistico per chi deve affrontare periodi di cura. Negli appartamenti <strong>Amici del San Raffaele</strong>, forniamo spesso ai nostri ospiti indicazioni dettagliate su questi servizi essenziali per rendere la loro permanenza il più semplice possibile.
      </p>
      <p class="mb-8">
        La tranquillità di sapere che ogni necessità sanitaria può essere risolta a pochi passi di distanza permette di concentrarsi totalmente sul proprio percorso di salute o su quello dei propri cari.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        La salute passa anche dalla corretta gestione delle terapie: conoscere i punti di riferimento locali è il primo passo per un soggiorno sereno.
      </p>
    `
  },
  {
    id: "parcheggi-vicino-san-raffaele",
    title: "Parcheggi vicino all’Ospedale San Raffaele: dove lasciare l’auto",
    date: "23 Marzo 2026",
    author: "Amici del San Raffaele",
    image: milano2Img,
    excerpt: "Parcheggiare vicino all'ospedale può essere una sfida. Ecco una guida ai parcheggi gratuiti e a pagamento nella zona.",
    content: `
      <p class="text-xl leading-relaxed text-muted-foreground mb-12">
        Chi arriva all'<strong>Ospedale San Raffaele</strong> in auto deve sapere che parcheggiare nella zona non è sempre semplice, soprattutto durante le ore di maggiore affluenza. La grande affluenza quotidiana rende i posti nelle strade limitrofe molto richiesti.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">ZTL e Disco Orario: Attenzione alle Regole</h2>
      <p class="mb-6">
        Il quartiere <strong>Milano 2</strong> e l’area attorno all’ospedale sono in gran parte zone residenziali. Molte strade prevedono il disco orario o sono riservate esclusivamente ai residenti muniti di apposito contrassegno.
      </p>
      <p class="mb-6">
        Ti consigliamo di prestare molta attenzione alla segnaletica: i controlli sono frequenti e lasciare l'auto per molte ore nelle zone a tempo limitato può portare a sanzioni. Per questo motivo, i parcheggi strutturati restano la scelta più sicura.
      </p>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Parcheggi a Pagamento Consigliati</h2>
      <p class="mb-6">
        Se cerchi la comodità e la certezza del posto, ecco le opzioni principali:
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <div class="bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <h3 class="text-lg font-bold text-primary mb-2">Multipiano San Raffaele</h3>
          <p class="text-sm mb-4">Situato all'interno del complesso ospedaliero, è il più capiente (1900 posti).</p>
          <p class="text-sm font-medium">Tariffa: ~€ 2,50/ora - Max € 15/giorno</p>
        </div>
        <div class="bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <h3 class="text-lg font-bold text-primary mb-2">Parcheggio DIMeR (P3)</h3>
          <p class="text-sm mb-4">Situato in via Olgettina 44, comodo per l'area di riabilitazione.</p>
          <p class="text-sm font-medium">Aperto 24h su 24h</p>
        </div>
      </div>

      <p class="mb-6">
        Altre soluzioni includono l'<strong>Area Pronto Soccorso (P5)</strong> per emergenze rapide e i parcheggi comunali di Segrate (P1 e P3B), che offrono tariffe leggermente più contenute (circa € 1/ora) pur essendo a brevissima distanza a piedi.
      </p>

      <div class="bg-primary/5 p-8 rounded-3xl border border-primary/10 my-12">
        <h3 class="text-xl font-display text-primary mb-4">Posto Auto per i nostri Ospiti</h3>
        <p class="mb-4">
          Per chi sceglie di soggiornare negli appartamenti <strong>Amici del San Raffaele</strong>, mettiamo a disposizione un <strong>posto auto gratuito</strong>.
        </p>
        <p class="mb-0 italic text-sm text-muted-foreground">
          Nota bene: consigliamo di utilizzare questo posto come base fissa durante il soggiorno, poiché spostare l'auto quotidianamente per avvicinarsi all'ospedale durante le ore di punta potrebbe farvi perdere molto tempo nella ricerca di un nuovo stallo.
        </p>
      </div>

      <h2 class="text-3xl font-display text-primary mt-16 mb-8">Esistono Parcheggi Gratuiti?</h2>
      <p class="mb-6">
        In prossimità dell’ospedale i posti gratuiti (strisce bianche) sono estremamente limitati e si riempiono già alle prime luci dell’alba. Se cerchi soluzioni a costo zero, potresti dover cercare verso l’area di <strong>Cascina Gobba</strong>, ma questo comporta poi un tratto di strada a piedi o l'utilizzo della metro leggera.
      </p>

      <p class="text-lg leading-relaxed mt-12 mb-4 font-medium italic">
        Pianificare il parcheggio è fondamentale per arrivare puntuali e senza stress a un appuntamento medico importante.
      </p>
    `
  }
];
