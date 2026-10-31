import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CalendarCheck2,
  FileText,
  PlusCircle,
  Euro,
  Receipt,
  Scale,
  User,
  Building2,
  CreditCard,
  CalendarClock,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getNotes } from '@/lib/admin-api';
import { EventItem, InternalNote } from '@/types/database';
import { useFinanceData } from '@/components/admin/finance/useFinanceData';
import { eur, eur2 } from '@/components/admin/finance/finance-ui';
import { MovementDialog, MovementDefaults } from '@/components/admin/finance/MovementDialog';
import {
  addMonths,
  forecastMovements,
  monthEnd,
  monthKey,
  monthLabel,
  monthStart,
  summarizeApartments,
  todayIso,
} from '@/lib/finance-calc';
import { FinanceScope } from '@/types/finance';
import { AgendaEvent, addDays, expandAll, getAgendaEvents, sortInstances } from '@/lib/agenda';

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);

  // Stato per il modal di aggiunta rapida movimento direttamente dalla Dashboard
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [movScope, setMovScope] = useState<FinanceScope>('personal');
  const [movDefaults, setMovDefaults] = useState<MovementDefaults | undefined>();

  useEffect(() => {
    getEvents().then(setEvents).catch(() => undefined);
    getNotes().then(setNotes).catch(() => undefined);
    getAgendaEvents().then(setAgendaEvents).catch(() => undefined);
  }, []);

  // Indicatori economici dalla Contabilità Appartamenti (incassi, spese, utile)
  const { data: finance, error: financeError, reload: reloadFinance, categoryMap } = useFinanceData();
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

  const openQuickMovement = (scope: FinanceScope, defaults?: MovementDefaults) => {
    setMovScope(scope);
    setMovDefaults(defaults);
    setMovDialogOpen(true);
  };

  const revolutCategoryId = useMemo(
    () => (finance?.categories ?? []).find((c) => c.scope === 'personal' && c.cat_group === 'revolut' && c.is_active)?.id,
    [finance?.categories]
  );

  // Impegni dell'Agenda di oggi + prossimi 7 giorni
  const todayAgendaItems = useMemo(() => {
    const expanded = expandAll(agendaEvents, today, addDays(today, 7)).sort(sortInstances);
    return expanded.slice(0, 5);
  }, [agendaEvents, today]);

  // Prossime scadenze ricorrenti nei prossimi 30 giorni
  const upcomingRecurring = useMemo(
    () =>
      forecastMovements(
        finance?.recurring ?? [],
        movements,
        { from: today, to: monthEnd(addMonths(currentKey, 1)) }
      )
        .filter((m) => m.direction === 'expense')
        .slice(0, 4),
    [finance?.recurring, movements, today, currentKey]
  );

  const upcomingEvents = events
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header compatto */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Pannello di Controllo
        </h1>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Oggi · {todayLabel}
        </span>
      </div>

      {financeError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{financeError}</div>
      )}

      {/* PRIMA RIGA: Azioni Rapide Movimenti (Finanze Personali + Amici del San Raffaele) & Preview Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Colonna Sinistra (7 col): Inserimento Rapido Movimenti */}
        <Card className="lg:col-span-7 shadow-sm border-slate-200">
          <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4 text-primary" />
                Aggiungi Movimento Rapido
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Registra al volo una spesa o un'entrata senza cambiare pagina
              </CardDescription>
            </div>
            <Link to="/admin/bilancio" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 shrink-0">
              Bilancio <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1 space-y-3">
            {/* Blocco 1: Finanze Personali */}
            <div className="rounded-xl bg-violet-50/50 border border-violet-200/70 p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-violet-600" />
                  Finanze Personali
                </span>
                <Link to="/admin/finanze-personali" className="text-[11px] font-semibold text-violet-700 hover:underline">
                  Apri sezione →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 px-2 text-[11px] sm:text-xs font-semibold bg-white hover:bg-rose-50 border-rose-200 text-rose-700 gap-1"
                  onClick={() => openQuickMovement('personal', { direction: 'expense' })}
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                  <span className="truncate">Spesa Pers.</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 px-2 text-[11px] sm:text-xs font-semibold bg-white hover:bg-sky-50 border-sky-200 text-sky-700 gap-1"
                  onClick={() => openQuickMovement('personal', { direction: 'expense', categoryId: revolutCategoryId })}
                >
                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  <span className="truncate">Revolut</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 px-2 text-[11px] sm:text-xs font-semibold bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 gap-1"
                  onClick={() => openQuickMovement('personal', { direction: 'income' })}
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">Entrata</span>
                </Button>
              </div>
            </div>

            {/* Blocco 2: Amici del San Raffaele (Appartamenti) */}
            <div className="rounded-xl bg-sky-50/50 border border-sky-200/70 p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-sky-600" />
                  Amici del San Raffaele (Alloggi)
                </span>
                <Link to="/admin/contabilita" className="text-[11px] font-semibold text-sky-700 hover:underline">
                  Apri sezione →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 px-2.5 text-[11px] sm:text-xs font-semibold bg-white hover:bg-rose-50 border-rose-200 text-rose-700 gap-1.5"
                  onClick={() => openQuickMovement('apartment', { direction: 'expense' })}
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                  <span className="truncate">Spesa Appartamenti</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 px-2.5 text-[11px] sm:text-xs font-semibold bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 gap-1.5"
                  onClick={() => openQuickMovement('apartment', { direction: 'income' })}
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">Incasso Appartamenti</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colonna Destra (5 col): Preview Agenda del Giorno (cliccabile verso /admin/agenda) */}
        <Link
          to="/admin/agenda"
          className="lg:col-span-5 block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/50 group-hover:shadow-md flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Agenda · Oggi e Prossimi Giorni
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Tocca per aprire l'Agenda completa
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
                Apri <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 flex-1 flex flex-col justify-between">
              {todayAgendaItems.length === 0 ? (
                <div className="my-auto py-4 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200 px-3">
                  <p className="text-xs font-medium text-slate-600">Nessun impegno fissato per oggi ({todayLabel})</p>
                  <p className="text-[11px] text-primary font-semibold mt-1">Tocca qui per entrare in Agenda e creare un impegno →</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {todayAgendaItems.map((it) => {
                    const isToday = it.date === today;
                    return (
                      <li key={it.key} className="py-1.5 flex items-center gap-2.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate">{it.title}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {isToday ? (
                              <strong className="text-primary">Oggi</strong>
                            ) : (
                              <span>{it.date.split('-').reverse().slice(0, 2).join('/')}</span>
                            )}
                            <span>
                              · {it.allDay ? 'Tutto il giorno' : `${it.startTime}${it.endTime ? `–${it.endTime}` : ''}`}
                            </span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Indicatori economici compatti: 3 colonne affiancate anche su telefono */}
      {[
        { key: 'current', title: `Mese corrente · ${currentLabel}`, note: `al ${todayLabel}`, s: currentSummary },
        { key: 'previous', title: `Mese precedente · ${previousLabel}`, note: 'chiuso', s: previousSummary },
      ].map((block) => (
        <section key={block.key} className="space-y-1.5">
          <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            {block.title} <span className="font-normal normal-case tracking-normal text-slate-400">({block.note})</span>
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Fatturato', fullLabel: 'Fatturato mensile', value: block.s.income, icon: Euro, tone: 'bg-emerald-50 text-emerald-600', color: 'text-slate-900' },
              { label: 'Spese', fullLabel: 'Spese mensili', value: block.s.expenses, icon: Receipt, tone: 'bg-rose-50 text-rose-600', color: 'text-slate-900' },
              {
                label: 'Utile netto',
                fullLabel: 'Utile netto totale',
                value: block.s.net,
                icon: Scale,
                tone: 'bg-primary/10 text-primary',
                color: block.s.net < 0 ? 'text-rose-600' : 'text-emerald-600',
              },
            ].map((k) => (
              <Link
                key={k.label}
                to="/admin/contabilita"
                className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Card className="h-full shadow-sm border-slate-200 transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-2.5 sm:p-3.5">
                    <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                      <span className="sm:hidden">{k.label}</span>
                      <span className="hidden sm:inline">{k.fullLabel}</span>
                    </CardTitle>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 ${k.tone}`}>
                      <k.icon className="h-3.5 w-3.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-2.5 pb-2.5 sm:px-3.5 sm:pb-3.5 pt-0">
                    <div className={`text-sm sm:text-xl font-bold leading-tight ${k.color}`}>{eur.format(k.value)}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">Tutti gli appartamenti</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Riga inferiore compatta: Prossime Scadenze Fisse, Note Interne, Eventi Alta Richiesta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. Prossime Scadenze Fisse / Ricorrenti */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-amber-600" />
              Prossime Scadenze Fisse
            </CardTitle>
            <Link to="/admin/bilancio" className="text-xs font-semibold text-primary hover:underline">
              Vedi tutte
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1">
            {upcomingRecurring.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Nessuna spesa fissa in scadenza a breve.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingRecurring.map((m) => (
                  <li key={m.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 truncate block">
                        {m.category_id ? categoryMap.get(m.category_id)?.name : 'Spesa ricorrente'}
                      </span>
                      <span className="text-[11px] text-slate-400">
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

        {/* 2. Note e Promemoria Interni */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              Note e Promemoria
            </CardTitle>
            <Link to="/admin/eventi" className="text-xs font-semibold text-primary hover:underline">
              + Nota
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1">
            {notes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">Nessuna nota interna presente.</p>
            ) : (
              <div className="space-y-1.5">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{note.content}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="capitalize">{note.category}</span>
                        {note.note_date && <span>• {note.note_date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Eventi & Alta Richiesta */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarCheck2 className="h-4 w-4 text-amber-500" />
              Eventi & Alta Richiesta
            </CardTitle>
            <Link to="/admin/eventi" className="text-xs text-primary font-semibold hover:underline">
              Gestisci
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1 space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Nessun evento in programma.</p>
            ) : (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-2 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate">{evt.name}</span>
                    {evt.is_high_demand && (
                      <Badge className="bg-amber-600 text-[9px] px-1.5 py-0">Alta Richiesta</Badge>
                    )}
                  </div>
                  <div className="text-[10px] font-semibold text-amber-800 mt-1">
                    📅 {evt.start_date} → {evt.end_date}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog di inserimento movimento rapido direttamente dalla Dashboard */}
      {finance && (
        <MovementDialog
          open={movDialogOpen}
          onOpenChange={setMovDialogOpen}
          scope={movScope}
          apartments={finance.apartments}
          categories={finance.categories}
          editing={null}
          defaults={movDefaults}
          allowTransfer={movScope === 'personal'}
          onSaved={reloadFinance}
        />
      )}
    </div>
  );
};
