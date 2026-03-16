import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "./ui/button";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="max-w-4xl mx-auto bg-card border border-border/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl md:rounded-full p-4 md:py-3 md:pl-6 md:pr-3 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <p className="leading-tight">
            Utilizziamo solo <span className="text-foreground font-medium">cookie tecnici</span> necessari per il corretto funzionamento del sito. Proseguendo la navigazione accetti il loro utilizzo. 
            <a href="/san-raffaele-stays/cookie-policy" className="text-primary hover:underline ml-1 font-medium italic">Leggi di più</a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={acceptConsent}
            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            Accetta
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
