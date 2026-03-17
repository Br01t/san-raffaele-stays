import SEO from "@/components/SEO";

const CookiePolicy = () => (
  <>
    <SEO title="Cookie Policy - Amici del San Raffaele" description="Informativa estesa sui cookie utilizzati dal sito Amici del San Raffaele." />
    <section className="hero-gradient py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Cookie Policy</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto">
          Informazioni trasparenti sull'utilizzo dei cookie in questo sito.
        </p>
      </div>
    </section>
    <section className="py-16 md:py-24 bg-accent/5">
      <div className="container max-w-4xl">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border/60 prose prose-slate max-w-none">
          <h2 className="text-primary font-display">1. Cosa sono i Cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale (solitamente al browser), dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente.
          </p>

          <h2 className="text-primary font-display">2. Tipologie di Cookie utilizzati</h2>
          <p>
            Questo sito web utilizza esclusivamente le seguenti categorie di cookie:
          </p>
          
          <h3 className="text-foreground font-semibold">Cookie Tecnici ed Essenziali</h3>
          <p>
            Sono cookie necessari per il corretto funzionamento del sito. Consentono la navigazione tra le pagine e l'utilizzo delle funzionalità base (come l'invio del form di contatto). Senza questi cookie, il sito non potrebbe funzionare correttamente. 
            <strong> Questi cookie non richiedono il preventivo consenso dell'utente per essere installati.</strong>
          </p>

          <h3 className="text-foreground font-semibold">Cookie di Funzionalità (Terze Parti)</h3>
          <p>
            Il sito integra componenti di terze parti, nello specifico **Google Maps**, per mostrare la posizione degli alloggi. Questi componenti possono installare dei cookie tecnici o di preferenza necessari per visualizzare correttamente la mappa interattiva.
          </p>

          <h2 className="text-primary font-display">3. Cookie di Profilazione</h2>
          <p>
            <strong>Questo sito NON utilizza cookie di profilazione</strong>, né propri né di terze parti, volti a creare profili relativi all'utente al fine di inviare messaggi pubblicitari in linea con le preferenze manifestate dallo stesso nell'ambito della navigazione in rete.
          </p>

          <h2 className="text-primary font-display">4. Gestione dei Cookie tramite Browser</h2>
          <p>
            L'utente può gestire le preferenze relative ai cookie direttamente all'interno del proprio browser ed impedire – ad esempio – che terze parti possano installarne. Tramite le preferenze del browser è inoltre possibile eliminare i cookie installati in passato.
          </p>
          <p>
            È possibile trovare informazioni su come gestire i cookie nei browser più diffusi ai seguenti indirizzi:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647?hl=it" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947792d3" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>

          <h2 className="text-primary font-display">5. Titolare del Trattamento</h2>
          <p>
            Per qualsiasi domanda relativa alla presente Cookie Policy, puoi contattare il titolare tramite i riferimenti presenti nella pagina contatti di questo sito.
          </p>

          <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground italic">
            Ultimo aggiornamento: Marzo 2026
          </div>
        </div>
      </div>
    </section>
  </>
);

export default CookiePolicy;
