import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import miniLogo from "@/assets/MINI_LOGO_-removebg-preview.webp";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-display text-lg text-primary-foreground">
            <img src={miniLogo} alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
            Amici dell'Ospedale
          </div>
          <p className="text-sm opacity-75 leading-relaxed">
            Appartamenti confortevoli vicino all'Ospedale San Raffaele di Milano. Il tuo punto di appoggio durante i momenti più importanti.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="font-display text-sm uppercase tracking-wider opacity-60">Navigazione</h3>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
            <li><Link to="/alloggi" className="hover:opacity-100 transition-opacity">Alloggi</Link></li>
            <li><Link to="/come-raggiungerci" className="hover:opacity-100 transition-opacity">Come raggiungerci</Link></li>
            <li><Link to="/il-gestore" className="hover:opacity-100 transition-opacity">Il gestore</Link></li>
            <li><Link to="/guida-zona" className="hover:opacity-100 transition-opacity">Guida alla zona</Link></li>
            <li><Link to="/recensioni" className="hover:opacity-100 transition-opacity">Recensioni</Link></li>
            <li><Link to="/contatti" className="hover:opacity-100 transition-opacity">Contatti</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-display text-sm uppercase tracking-wider opacity-60">Contatti</h3>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <a href="tel:+390200000000" className="hover:opacity-100">+39 02 000 00 000</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              <a href="mailto:info@amicidellospedale.it" className="hover:opacity-100">info@amicidellospedale.it</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Zona Milano 2, Segrate (MI)</span>
            </li>
          </ul>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <h3 className="font-display text-sm uppercase tracking-wider opacity-60">Dove siamo</h3>
          <div className="rounded-xl overflow-hidden h-40">
            <iframe
              title="Posizione Amici dell'Ospedale"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.390195682343!2d9.266786299999998!3d45.5022233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c71d2fe74f4d%3A0x89a6a46181c3d221!2sAmici%20dell'Ospedale%20Appartamenti%20B%26B!5e0!3m2!1sit!2sit!4v1773334327379!5m2!1sit!2sit"
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

      <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-50">
        <span>© {new Date().getFullYear()} Amici dell'Ospedale. Tutti i diritti riservati.</span>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:opacity-100 transition-opacity">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
