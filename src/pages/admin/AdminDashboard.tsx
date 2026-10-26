import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CalendarCheck2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FileText,
  PlusCircle,
  Euro,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getMonthlyData, getNotes } from '@/lib/admin-api';
import { EventItem, MonthlyData, InternalNote } from '@/types/database';

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evts, mData, nts] = await Promise.all([
          getEvents(),
          getMonthlyData(),
          getNotes(),
        ]);
        setEvents(evts);
        setMonthlyData(mData);
        setNotes(nts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calcola metriche aggregate
  const latestMonthData = monthlyData.slice(0, 3);
  const avgOccupancy =
    latestMonthData.length > 0
      ? (
          latestMonthData.reduce((acc, curr) => acc + Number(curr.occupancy_percentage), 0) /
          latestMonthData.length
        ).toFixed(1)
      : '78.5';

  // Fatturato: totale di tutti gli appartamenti nell'ultimo mese con fatturato registrato
  const monthLabels = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
  ];
  const withRevenue = monthlyData.filter((m) => m.revenue != null);
  const latestRevenuePeriod = withRevenue.reduce<number>(
    (max, m) => Math.max(max, m.year * 100 + m.month),
    0
  );
  const latestRevenueRows = withRevenue.filter((m) => m.year * 100 + m.month === latestRevenuePeriod);
  const totalRevenue = latestRevenueRows.reduce((acc, m) => acc + Number(m.revenue), 0);
  const revenueLabel =
    latestRevenuePeriod > 0
      ? `${monthLabels[(latestRevenuePeriod % 100) - 1]} ${Math.floor(latestRevenuePeriod / 100)}`
      : null;

  const upcomingEvents = events
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pannello di Controllo
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/calendario">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <CalendarDays className="h-4 w-4" />
              Gestisci Calendari
            </Button>
          </Link>
          <Link to="/admin/dati-mensili">
            <Button size="sm" variant="outline" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Inserisci Dati
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Occupazione media: porta al grafico dell'occupazione */}
        <Link to="/admin/dati-mensili#occupazione" className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Occupazione registrata: vai al grafico dell'occupazione">
        <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Occupazione Registrata
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Media mensile ultimi dati registrati
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Vai al grafico <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
        </Link>

        {/* Fatturato mensile: porta al grafico del fatturato */}
        <Link to="/admin/dati-mensili#fatturato" className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Fatturato mensile: vai al grafico del fatturato">
        <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fatturato Mensile
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Euro className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {revenueLabel
                ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalRevenue)
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueLabel
                ? `Totale ${revenueLabel}, tutti gli alloggi`
                : 'Nessun fatturato ancora registrato'}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Vai al grafico <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Main Grid: Apartamenti + Prossimi Eventi */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: I 3 Appartamenti (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Quick Notes section */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Note e Promemoria Interni
                </CardTitle>
                <CardDescription className="text-xs">
                  Visibili unicamente a te nell'area riservata
                </CardDescription>
              </div>
              <Link to="/admin/eventi">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" /> Nuova Nota
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Nessuna nota interna presente.</p>
              ) : (
                <div className="space-y-2">
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{note.content}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="capitalize">{note.category}</span>
                          {note.note_date && <span>• Data: {note.note_date}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Eventi & Azioni Rapide */}
        <div className="space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4 text-amber-500" />
                  Eventi & Alta Richiesta
                </CardTitle>
                <CardDescription className="text-xs">
                  Date con potenziale variazione tariffe
                </CardDescription>
              </div>
              <Link to="/admin/eventi" className="text-xs text-primary font-semibold hover:underline">
                Gestisci
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{evt.name}</span>
                    {evt.is_high_demand && (
                      <Badge className="bg-amber-600 text-[10px]">Alta Richiesta</Badge>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2">{evt.description}</p>
                  <div className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-1 rounded inline-block">
                    📅 {evt.start_date} → {evt.end_date}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Guida Rapida */}
          <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-primary/5 via-white to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Flusso Operativo Consigliato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-slate-600">
              <p>
                1. <strong>Calendario:</strong> Seleziona un alloggio, clicca sulle date o su un intervallo e imposta prezzo e disponibilità.
              </p>
              <p>
                2. <strong>Dati Mensili:</strong> A inizio mese registra occupazione e tariffa media per aggiornare i grafici storici.
              </p>
              <p>
                3. <strong>Backup:</strong> Dalla sezione Impostazioni puoi esportare in qualunque momento tutti i dati in formato JSON o CSV.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
