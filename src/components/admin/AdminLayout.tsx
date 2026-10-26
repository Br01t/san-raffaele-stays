import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  TrendingUp,
  CalendarCheck2,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Database,
  CloudOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase';

const navItems = [
  { to: '/admin', label: 'Panoramica', icon: LayoutDashboard, end: true },
  { to: '/admin/appartamenti', label: 'Appartamenti', icon: Building2 },
  { to: '/admin/calendario', label: 'Calendario & Tariffe', icon: CalendarDays },
  { to: '/admin/dati-mensili', label: 'Dati Mensili & Storico', icon: TrendingUp },
  { to: '/admin/eventi', label: 'Eventi & Note', icon: CalendarCheck2 },
  { to: '/admin/analytics', label: 'Analytics & Ricerche', icon: BarChart3 },
  { to: '/admin/impostazioni', label: 'Impostazioni & Export', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const connectedToSupabase = isSupabaseConfigured();

  // Esc chiude il menu; con il menu aperto la pagina sotto non scorre
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
            ASR
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Amici del San Raffaele</h1>
            <p className="text-[11px] text-muted-foreground">Area Amministrativa</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sfondo scuro dietro al menu (solo sotto 1024px): un tocco fuori lo chiude */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[45] bg-slate-900/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fissa da 1024px in su, menu a scomparsa sotto */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen h-dvh w-72 max-w-[85vw] lg:w-64 lg:max-w-none shrink-0 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-base shadow-md">
              ASR
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">Amici del San Raffaele</h2>
              <p className="text-xs text-slate-400">Pannello Proprietario</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Amministratore
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
              title="Apri sito pubblico in una nuova scheda"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Sito</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 hover:text-rose-200 transition-colors border border-rose-900/30"
              title="Disconnetti"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
