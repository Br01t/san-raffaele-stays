import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/alloggi", label: "Alloggi" },
  { to: "/come-raggiungerci", label: "Come raggiungerci" },
  { to: "/il-gestore", label: "Il gestore" },
  { to: "/guida-zona", label: "Guida alla zona" },
  { to: "/contatti", label: "Contatti" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
      <nav className="container flex items-center justify-between h-16 md:h-18">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Heart className="w-6 h-6 fill-primary" />
          <span>Amici dell'Ospedale</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === l.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t bg-card">
          <ul className="container py-4 space-y-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                    location.pathname === l.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
