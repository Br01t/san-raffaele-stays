import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CalendarCheck2,
  Sparkles,
  FileText,
  PlusCircle,
  Euro,
  Receipt,
  Scale,
  Users,
  Calculator,
  User,
  PiggyBank,
  CreditCard,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getNotes } from '@/lib/admin-api';
import { EventItem, InternalNote } from '@/types/database';
import { useFinanceData } from '@/components/admin/finance/useFinanceData';
import { eur, eur2 } from '@/components/admin/finance/finance-ui';
import {
  addMonths,
  budgetFor,
  forecastMovements,
  monthEnd,
  monthKey,
  monthLabel,
  monthStart,
  summarizeApartments,
  summarizePersonal,
  todayIso,
} from '@/lib/finance-calc';
import { REVOLUT_BUDGET_KEY } from '@/types/finance';
import amici1Cover from '@/assets/Screenshot 2026-03-12 alle 15.28.04.webp';
import amici2Cover from '@/assets/AMICI 2 - 1.webp';
import amici3Cover from '@/assets/IMG_2802.webp';

const APARTMENT_COVERS: Record<string, string> = {
  'amici-1': amici1Cover,
  'amici-2': amici2Cover,
  'amici-3': amici3Cover,
};

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evts, nts] = await Promise.all([getEvents(), getNotes()]);
        setEvents(evts);
        setNotes(nts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Indicatori economici dalla Contabilità Appartamenti (incassi, spese, utile)
  const { data: finance, error: financeError, categoryMap } = useFinanceData();
  const today = todayIso();
  const currentKey = monthKey(today);
  const previousKey = addMonths(currentKey, -1);
  const aptCount = finance?.apartments.length ?? 0;
  const movements = finance?.movements ?? [];
  const summaryFor = (key: string, aptId: string | 'all') =>
    summarizeApartments(movements, categoryMap, aptId, aptCount, { from: monthStart(key), to: monthEnd(key) });
  const currentSummary = summaryFor(currentKey, 'all');
  const previousSummary = summaryFor(previousKey, 'all');
  const currentLabel = monthLabel(currentKey, true);
  const previousLabel = monthLabel(previousKey, true);
  const todayLabel = today.split('-').reverse().join('/');
  const apartmentCards = (finance?.apartments ?? []).map((apt) => ({ apt, s: summaryFor(currentKey, apt.id) }));

  // Finanze Personali & Bilancio Complessivo del mese corrente
  const currentPeriod = { from: monthStart(currentKey), to: monthEnd(currentKey) };
  const personalSummary = summarizePersonal(movements, categoryMap, currentPeriod);
  const totalRealSavings = currentSummary.net + personalSummary.balance;
  const revolutBudget = budgetFor(finance?.budgets ?? [], REVOLUT_BUDGET_KEY, currentKey);
  const revolutLeft = revolutBudget - personalSummary.revolut;
  const revolutPct = revolutBudget > 0 ? Math.min(100, (personalSummary.revolut / revolutBudget) * 100) : 0;

  // Prossime scadenze ricorrenti nei prossimi 35 giorni
  const upcomingRecurring = forecastMovements(
    finance?.recurring ?? [],
    movements,
    { from: today, to: monthEnd(addMonths(currentKey, 1)) }
  )
    .filter((m) => m.direction === 'expense')
    .slice(0, 4);

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
      </div>

      {/* Indicatori economici: mese corrente e mese precedente */}
      {financeError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{financeError}</div>
      )}

      {/* Situazione Finanziaria Completa del Mese (Attività + Vita Personale) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <PiggyBank className="h-4 w-4 text-primary" />
            Situazione Completa del Mese · {currentLabel}{' '}
            <span className="font-normal normal-case tracking-normal text-slate-400">
              (Attività Immobiliare + Vita Personale)
            </span>
          </h2>
          <Link to="/admin/bilancio" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Apri Bilancio Completo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* 1. Utile Netto Appartamenti */}
          <Link
            to="/admin/contabilita"
            className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Utile Appartamenti
                </CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-50 text-sky-600">
                  <Euro className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                <div className={`text-2xl font-bold ${currentSummary.net < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {eur.format(currentSummary.net)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Incassi: <strong className="text-emerald-700">{eur.format(currentSummary.income)}</strong></span>
                  <span>Spese: <strong className="text-rose-600">{eur.format(currentSummary.expenses)}</strong></span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 2. Finanze Personali & Revolut */}
          <Link
            to="/admin/finanze-personali"
            className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  2. Spese Personali & Revolut
                </CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-50 text-violet-600">
                  <User className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-rose-600">{eur.format(personalSummary.expenses)}</span>
                  {personalSummary.income > 0 && (
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      +{eur.format(personalSummary.income)} entrate
                    </span>
                  )}
                </div>
                {revolutBudget > 0 ? (
                  <div className="pt-1 border-t border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-sky-600" /> Revolut residuo:
                      </span>
                      <strong className={revolutLeft < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {eur.format(revolutLeft)} / {eur.format(revolutBudget)}
                      </strong>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${revolutPct >= 100 ? 'bg-rose-500' : revolutPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${revolutPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Fisse: {eur.format(personalSummary.fixed)} · Variabili: {eur.format(personalSummary.variable)}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* 3. Risparmio Netto Reale del Mese */}
          <Link
            to="/admin/bilancio"
            className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card className="h-full shadow-sm border-primary/30 bg-primary/[0.03] transition-all group-hover:border-primary/60 group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                  3. Risparmio Netto Reale
                </CardTitle>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/15 text-primary">
                  <PiggyBank className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
                <div className={`text-2xl font-black ${totalRealSavings < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {eur.format(totalRealSavings)}
                </div>
                <p className="text-[11px] text-slate-600 pt-1 border-t border-primary/10">
                  Ciò che resta pagate spese alloggi e personali
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 4. Prossime Scadenze Fisse / Ricorrenti */}
          <Card className="h-full shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 p-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-amber-600" /> Prossime Scadenze
              </CardTitle>
              <Link to="/admin/bilancio" className="text-[11px] font-semibold text-primary hover:underline">
                Tutte
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              {upcomingRecurring.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2">Nessuna spesa fissa in scadenza a breve.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {upcomingRecurring.map((m) => (
                    <li key={m.id} className="py-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 truncate block">
                          {m.category_id ? categoryMap.get(m.category_id)?.name : 'Spesa ricorrente'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m.movement_date.split('-').reverse().join('/')} · {m.scope === 'apartment' ? 'Alloggi' : 'Personale'}
                        </span>
                      </div>
                      <span className="font-bold text-rose-600 shrink-0">{eur2.format(Number(m.amount))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      {[
        { key: 'current', title: `Mese corrente · ${currentLabel}`, note: `aggiornato al ${todayLabel}`, s: currentSummary },
        { key: 'previous', title: `Mese precedente · ${previousLabel}`, note: 'chiuso', s: previousSummary },
      ].map((block) => (
        <section key={block.key} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {block.title} <span className="font-normal normal-case tracking-normal text-slate-400">({block.note})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Fatturato mensile totale', value: block.s.income, icon: Euro, tone: 'bg-emerald-50 text-emerald-600', color: 'text-slate-900' },
              { label: 'Spese mensili totali', value: block.s.expenses, icon: Receipt, tone: 'bg-rose-50 text-rose-600', color: 'text-slate-900' },
              {
                label: 'Utile netto totale',
                value: block.s.net,
                icon: Scale,
                tone: 'bg-primary/10 text-primary',
                color: block.s.net < 0 ? 'text-rose-600' : 'text-emerald-600',
              },
            ].map((k) => (
              <Link
                key={k.label}
                to="/admin/contabilita"
                className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k.label}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.tone}`}>
                      <k.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className={`text-2xl font-bold ${k.color}`}>{eur.format(k.value)}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tutti gli appartamenti</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Anteprima appartamenti */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">I tuoi appartamenti · {currentLabel}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {apartmentCards.map(({ apt, s }) => (
            <Card key={apt.id} className="overflow-hidden shadow-sm border-slate-200 flex flex-col">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                {APARTMENT_COVERS[apt.slug] && (
                  <img src={APARTMENT_COVERS[apt.slug]} alt={apt.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 flex items-end justify-between">
                  <span className="text-white font-bold text-lg">{apt.name}</span>
                  <Badge className={apt.is_active ? 'bg-emerald-600' : 'bg-slate-500'}>{apt.is_active ? 'Attivo' : 'Non attivo'}</Badge>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> fino a {apt.max_guests} ospiti
                  </span>
                  <span className="flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5" /> da {apt.base_price_2p} €/notte
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Fatturato</div>
                    <div className="text-sm font-bold text-slate-900">{eur.format(s.income)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Spese</div>
                    <div className="text-sm font-bold text-rose-600">{eur.format(s.expenses)}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Utile</div>
                    <div className={`text-sm font-bold ${s.net < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{eur.format(s.net)}</div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link to="/admin/calendario" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Calendario
                    </Button>
                  </Link>
                  <Link to="/admin/contabilita" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Calculator className="h-3.5 w-3.5" /> Contabilità
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

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
