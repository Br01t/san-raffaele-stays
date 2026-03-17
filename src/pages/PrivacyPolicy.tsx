import SEO from "@/components/SEO";

const PrivacyPolicy = () => (
  <>
    <SEO title="Privacy Policy - Amici del San Raffaele" description="Informativa sulla privacy di Amici del San Raffaele, in conformità con il GDPR." />
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Privacy Policy</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto">
          Informativa resa ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR)
        </p>
      </div>
    </section>
    <section className="py-16 md:py-24 bg-accent/5">
      <div className="container max-w-4xl">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border/60 prose prose-slate max-w-none">
          <h2 className="text-primary font-display">1. Titolare del Trattamento</h2>
          <p>
            Il Titolare del trattamento dei dati personali è <strong>Amici del San Raffaele</strong>, con sede in Zona Milano 2, Segrate (MI). 
            Per qualsiasi chiarimento o esercizio dei diritti, è possibile contattare il Titolare tramite i riferimenti presenti nella pagina contatti di questo sito web.
          </p>

          <h2 className="text-primary font-display">2. Tipologia di Dati Trattati</h2>
          <p>
            Attraverso questo sito web, il Titolare raccoglie i seguenti dati personali forniti volontariamente dall'utente tramite il form di contatto:
          </p>
          <ul>
            <li>Dati identificativi (Nome e Cognome);</li>
            <li>Dati di contatto (Indirizzo Email, Numero di Telefono).</li>
          </ul>

          <h2 className="text-primary font-display">3. Finalità del Trattamento</h2>
          <p>
            I dati forniti verranno utilizzati esclusivamente per le seguenti finalità:
          </p>
          <ul>
            <li>Fornire risposte alle richieste di informazioni relative agli alloggi;</li>
            <li>Gestire le richieste di disponibilità e prenotazione;</li>
            <li>Fornire assistenza tecnica o logistica agli ospiti.</li>
          </ul>

          <h2 className="text-primary font-display">4. Base Giuridica del Trattamento</h2>
          <p>
            Il trattamento dei dati personali si fonda sul <strong>consenso</strong> espresso dall'utente mediante l'invio volontario del modulo di contatto o tramite comunicazione diretta (WhatsApp/Telefono).
          </p>

          <h2 className="text-primary font-display">5. Modalità di Trattamento e Conservazione</h2>
          <p>
            Il trattamento è effettuato con strumenti elettronici e cartacei, adottando misure di sicurezza idonee a garantire la riservatezza e l'integrità dei dati. I dati saranno conservati solo per il tempo strettamente necessario a gestire la specifica richiesta dell'utente o per adempiere a obblighi di legge.
          </p>

          <h2 className="text-primary font-display">6. Comunicazione dei Dati</h2>
          <p>
            I dati personali non saranno in alcun modo diffusi o ceduti a terzi per scopi commerciali. Potranno essere comunicati a soggetti terzi solo qualora sia strettamente necessario per l'erogazione dei servizi richiesti (es. personale addetto all'accoglienza) o per obblighi legali.
          </p>

          <h2 className="text-primary font-display">7. Diritti dell'Interessato</h2>
          <p>
            Ai sensi del GDPR, l'utente ha il diritto di:
          </p>
          <ul>
            <li>Accedere ai propri dati personali;</li>
            <li>Chiederne la rettifica o la cancellazione ("diritto all'oblio");</li>
            <li>Chiedere la limitazione del trattamento;</li>
            <li>Opporsi al trattamento in qualsiasi momento;</li>
            <li>Revocare il consenso espresso.</li>
          </ul>
          <p>
            Per esercitare tali diritti, l'utente può inviare una comunicazione ai recapiti indicati al punto 1.
          </p>

          <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground italic">
            Ultimo aggiornamento: Marzo 2026
          </div>
        </div>
      </div>
    </section>
  </>
);

export default PrivacyPolicy;
