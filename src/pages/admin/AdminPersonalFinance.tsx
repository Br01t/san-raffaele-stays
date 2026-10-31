import React, { useMemo, useState } from 'react';
import {
  PlusCircle,
  Tags,
  Wallet,
  Lock,
  Shuffle,
  Receipt,
  PiggyBank,
  CreditCard,
  ArrowRightLeft,
  CalendarClock,
  LineChart as LineChartIcon,
  Pencil,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CHART_TOOLTIP_STYLE,
  CategoryBreakdown,
  FinanceErrorBanner,
  FinanceLoading,
  KpiCard,
  PeriodFilter,
  SectionTitle,
  eur,
  eur2,
  usePeriod,
} from '@/components/admin/finance/finance-ui';
import { MovementDialog, EditTarget, MovementDefaults } from '@/components/admin/finance/MovementDialog';
import { CategoriesDialog, MovementsTable, RecurringList, nextOccurrence } from '@/components/admin/finance/FinanceLists';
import { useFinanceData } from '@/components/admin/finance/useFinanceData';
import {
  addMonths,
  budgetFor,
  inPeriod,
  monthKey,
  monthLabel,
  monthlyAverage,
  monthlyRows,
  monthsBetween,
  summarizePersonal,
  actualOnly,
} from '@/lib/finance-calc';
import { setBudget } from '@/lib/finance-api';
import { REVOLUT_BUDGET_KEY } from '@/types/finance';
import { isSupabaseConfigured } from '@/lib/supabase';

export const AdminPersonalFinance: React.FC = () => {
  const { data, error, loading, reload, categoryMap } = useFinanceData();
  const { state: periodState, setState: setPeriodState, period, label: periodLabel } = usePeriod('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [defaults, setDefaults] = useState<MovementDefaults | undefined>();
  const [catOpen, setCatOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetDefault, setBudgetDefault] = useState('');
  const [budgetMonth, setBudgetMonth] = useState('');

  const movements = useMemo(() => data?.movements ?? [], [data]);
  const categories = useMemo(() => (data?.categories ?? []).filter((c) => c.scope === 'personal'), [data]);
  const budgets = useMemo(() => data?.budgets ?? [], [data]);

  const summary = useMemo(() => summarizePersonal(movements, categoryMap, period), [movements, categoryMap, period]);

  // Entrate: periodo selezionato + anno intero (richiesto: totali mensili e annuali)
  const year = Number(period.to.slice(0, 4));
  const yearSummary = useMemo(
    () => summarizePersonal(movements, categoryMap, { from: `${year}-01-01`, to: `${year}-12-31` }),
    [movements, categoryMap, year]
  );

  const items = (group: 'income' | 'fixed' | 'variable' | 'revolut', source = summary) =>
    categories
      .filter((c) => (group === 'income' ? c.kind === 'income' : c.kind === 'expense' && c.cat_group === group))
      .map((c) => ({ id: c.id, name: c.name, amount: source.byCategory[c.id] ?? 0 }))
      .filter((i) => i.amount > 0)
      .sort((a, b) => b.amount - a.amount);

  // Variabili: le spese Revolut compaiono come un'unica voce "Revolut"
  const variableItems = useMemo(() => {
    const list = items('variable');
    if (summary.revolut > 0) list.push({ id: 'revolut', name: 'Revolut – spese quotidiane', amount: summary.revolut });
    return list.sort((a, b) => b.amount - a.amount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, categories]);

  // Revolut: budget sommato sui mesi del periodo
  const periodMonths = useMemo(() => monthsBetween(period.from, period.to), [period]);
  const revolutBudget = periodMonths.reduce((acc, k) => acc + budgetFor(budgets, REVOLUT_BUDGET_KEY, k), 0);
  const revolutLeft = revolutBudget - summary.revolut;
  const revolutPct = revolutBudget > 0 ? Math.min(100, (summary.revolut / revolutBudget) * 100) : 0;
  const currentMonth = periodState.mode === 'month' ? periodState.month : monthKey(period.to);

  // Spese annuali (ricorrenze annuali personali)
  const yearlyRules = useMemo(
    () => (data?.recurring ?? []).filter((r) => r.scope === 'personal' && r.frequency === 'yearly' && r.direction === 'expense'),
    [data]
  );
  const yearlyMonthlyAvg = yearlyRules.filter((r) => r.is_active).reduce((acc, r) => acc + monthlyAverage(r), 0);

  // Grafico ultimi 12 mesi (fino alla fine del periodo)
  const chartMonths = useMemo(() => {
    const end = monthKey(period.to);
    return periodState.mode === 'month' ? monthsBetween(`${addMonths(end, -11)}-01`, period.to) : periodMonths;
  }, [period, periodState.mode, periodMonths]);
  const chartData = useMemo(
    () =>
      monthlyRows(
        actualOnly(movements).filter((m) => m.scope === 'personal'),
        chartMonths
      ).map((r) => ({ label: r.label, Entrate: r.personalIncome, Spese: r.personalExpenses })),
    [movements, chartMonths]
  );

  const periodMovements = useMemo(
    () => movements.filter((m) => m.scope === 'personal' && inPeriod(m.movement_date, period)),
    [movements, period]
  );
  const recurring = useMemo(() => (data?.recurring ?? []).filter((r) => r.scope === 'personal'), [data]);

  const openNew = (d?: MovementDefaults) => {
    setEditing(null);
    setDefaults(d);
    setDialogOpen(true);
  };

  const openBudget = () => {
    const def = budgets.find((b) => b.budget_key === REVOLUT_BUDGET_KEY && b.month === 'default');
    const mon = budgets.find((b) => b.budget_key === REVOLUT_BUDGET_KEY && b.month === currentMonth);
    setBudgetDefault(def ? String(def.amount) : '');
    setBudgetMonth(mon ? String(mon.amount) : '');
    setBudgetOpen(true);
  };

  const saveBudget = async () => {
    try {
      if (budgetDefault.trim() !== '') await setBudget(REVOLUT_BUDGET_KEY, 'default', Number(budgetDefault.replace(',', '.')));
      if (budgetMonth.trim() !== '') await setBudget(REVOLUT_BUDGET_KEY, currentMonth, Number(budgetMonth.replace(',', '.')));
      toast.success('Budget Revolut salvato');
      setBudgetOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    }
  };

  if (loading) return <FinanceLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Finanze Personali</h1>
          <p className="text-sm text-slate-500 mt-1">
            Entrate e spese personali, separate dalla contabilità degli appartamenti.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setCatOpen(true)}>
            <Tags className="h-3.5 w-3.5 text-slate-500" /> Categorie
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => openNew()}>
            <PlusCircle className="h-3.5 w-3.5" /> Nuovo movimento
          </Button>
        </div>
      </div>

      <FinanceErrorBanner message={error} />
      {!isSupabaseConfigured() && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
          Modalità anteprima locale: i dati inseriti restano solo in questo browser e non toccano il database del sito.
        </div>
      )}

      <div className="lg:sticky lg:top-0 z-30 -mx-1 px-1 py-2 bg-slate-50/95 backdrop-blur flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Periodo: <strong className="text-slate-700">{periodLabel}</strong>
        </p>
        <PeriodFilter value={periodState} onChange={setPeriodState} />
      </div>

      {/* 2.4 Riepilogo */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard title="Entrate personali" value={summary.income} icon={Wallet} tone="emerald" />
        <KpiCard title="Spese fisse" value={summary.fixed} icon={Lock} tone="slate" />
        <KpiCard title="Spese variabili" value={summary.variable} icon={Shuffle} tone="violet" hint="Revolut compreso" />
        <KpiCard title="Spese complessive" value={summary.expenses} icon={Receipt} tone="rose" />
        <div className="col-span-2 lg:col-span-1">
          <KpiCard title="Saldo del periodo" value={summary.balance} icon={PiggyBank} tone="primary" signed highlight />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2.1 Entrate */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <SectionTitle icon={Wallet} title="Entrate personali" description={`${periodLabel} · anno ${year}: ${eur.format(yearSummary.income)}`} />
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => openNew({ direction: 'income' })}>
              <PlusCircle className="h-3.5 w-3.5 text-emerald-600" /> Entrata
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryBreakdown items={items('income')} color="bg-emerald-500" empty="Nessuna entrata nel periodo." />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold">{periodState.mode === 'month' ? 'Questo mese' : 'Periodo'}</div>
                <div className="text-base font-bold text-slate-900">{eur.format(summary.income)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold">Anno {year}</div>
                <div className="text-base font-bold text-slate-900">{eur.format(yearSummary.income)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revolut */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <SectionTitle
              icon={CreditCard}
              title="Revolut – budget spese quotidiane"
              description="Spesa, benzina, svago, acquisti personali, spese ordinarie"
            />
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={openBudget}>
              <Pencil className="h-3 w-3" /> Budget
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold">Budget</div>
                <div className="text-base font-bold text-slate-900">{eur.format(revolutBudget)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold">Speso</div>
                <div className="text-base font-bold text-rose-600">{eur.format(summary.revolut)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold">Residuo</div>
                <div className={`text-base font-bold ${revolutLeft < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {eur.format(revolutLeft)}
                </div>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden" aria-label={`Budget usato al ${Math.round(revolutPct)}%`}>
              <div
                className={`h-full rounded-full ${revolutPct >= 100 ? 'bg-rose-500' : revolutPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${revolutPct}%` }}
              />
            </div>
            <CategoryBreakdown items={items('revolut')} color="bg-sky-500" empty="Nessuna spesa Revolut registrata." />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" /> Trasferiti su Revolut: <strong>{eur2.format(summary.transfers)}</strong> (non
                conteggiati come spesa)
              </span>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openNew({ direction: 'transfer' })}>
                  + Giroconto
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    openNew({ direction: 'expense', categoryId: categories.find((c) => c.cat_group === 'revolut' && c.is_active)?.id })
                  }
                >
                  + Spesa Revolut
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2.2 Fisse */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <SectionTitle icon={Lock} title="Spese fisse" description={`Totale: ${eur.format(summary.fixed)}`} />
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              onClick={() =>
                openNew({ direction: 'expense', recurrence: 'monthly', categoryId: categories.find((c) => c.cat_group === 'fixed')?.id })
              }
            >
              <PlusCircle className="h-3.5 w-3.5" /> Fissa ricorrente
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown items={items('fixed')} color="bg-slate-500" empty="Nessuna spesa fissa nel periodo." />
          </CardContent>
        </Card>

        {/* 2.3 Variabili */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <SectionTitle icon={Shuffle} title="Spese variabili" description={`Totale: ${eur.format(summary.variable)}`} />
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              onClick={() =>
                openNew({ direction: 'expense', categoryId: categories.find((c) => c.cat_group === 'variable')?.id })
              }
            >
              <PlusCircle className="h-3.5 w-3.5" /> Variabile
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown items={variableItems} color="bg-violet-500" empty="Nessuna spesa variabile nel periodo." />
          </CardContent>
        </Card>
      </div>

      {/* Spese annuali */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Spese annuali
            </CardTitle>
            <CardDescription className="text-xs">
              Assicurazioni e altre uscite non mensili. Pesano in media <strong>{eur2.format(yearlyMonthlyAvg)}</strong> al
              mese; il pagamento resta registrato nella sua data reale.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1"
            onClick={() =>
              openNew({ direction: 'expense', recurrence: 'yearly', categoryId: categories.find((c) => c.system_key === 'per_insurance')?.id })
            }
          >
            <PlusCircle className="h-3.5 w-3.5" /> Spesa annuale
          </Button>
        </CardHeader>
        <CardContent>
          {yearlyRules.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Nessuna spesa annuale configurata.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {yearlyRules.map((r) => {
                const next = nextOccurrence(r);
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setEditing({ type: 'recurring', item: r });
                      setDialogOpen(true);
                    }}
                    className={`text-left p-3 rounded-lg border border-slate-200 hover:border-primary/40 transition-colors ${r.is_active ? '' : 'opacity-50'}`}
                  >
                    <div className="text-xs font-bold text-slate-800">{categoryMap.get(r.category_id)?.name}</div>
                    {r.description && <div className="text-[11px] text-slate-500 truncate">{r.description}</div>}
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900">{eur.format(Number(r.amount))}</span>
                      <span className="text-[11px] text-slate-500">{eur2.format(monthlyAverage(r))}/mese</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Prossimo pagamento: {next ? next.split('-').reverse().join('/') : '—'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grafico */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-primary" /> Entrate e spese personali per mese
          </CardTitle>
          <CardDescription className="text-xs">
            {monthLabel(chartMonths[0], true)} – {monthLabel(chartMonths[chartMonths.length - 1], true)} · solo dati effettivi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => eur.format(v)} />
                <Tooltip formatter={(v: number) => eur.format(v)} contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Entrate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Spese" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <MovementsTable
        title="Movimenti del periodo"
        movements={periodMovements}
        categories={categoryMap}
        onEdit={(m) => {
          setEditing({ type: 'movement', item: m });
          setDialogOpen(true);
        }}
        onChanged={reload}
      />

      <RecurringList
        rules={recurring}
        categories={categoryMap}
        onEdit={(r) => {
          setEditing({ type: 'recurring', item: r });
          setDialogOpen(true);
        }}
        onChanged={reload}
        onAdd={() => openNew({ direction: 'expense', recurrence: 'monthly' })}
      />

      {data && (
        <>
          <MovementDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            scope="personal"
            apartments={data.apartments}
            categories={data.categories}
            editing={editing}
            defaults={defaults}
            allowTransfer
            onSaved={reload}
          />
          <CategoriesDialog open={catOpen} onOpenChange={setCatOpen} scope="personal" categories={data.categories} onChanged={reload} />
        </>
      )}

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Budget mensile Revolut</DialogTitle>
            <DialogDescription className="text-xs">
              Il valore predefinito vale per tutti i mesi; puoi cambiarlo per un mese specifico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Budget predefinito (€ al mese)</Label>
              <Input inputMode="decimal" value={budgetDefault} onChange={(e) => setBudgetDefault(e.target.value)} placeholder="Es. 800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Solo per {monthLabel(currentMonth, true)} (opzionale)</Label>
              <Input inputMode="decimal" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} placeholder="Lascia vuoto per usare il predefinito" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBudgetOpen(false)}>
              Annulla
            </Button>
            <Button size="sm" onClick={saveBudget}>
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
