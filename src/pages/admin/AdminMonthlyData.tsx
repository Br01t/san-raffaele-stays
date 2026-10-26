import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  PlusCircle,
  Download,
  Calendar,
  Building2,
  DollarSign,
  Percent,
  FileText,
  Save,
  Clock,
  Euro,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ColumnHeader, TableToolbar } from '@/components/admin/ColumnHeader';
import { ColumnDef, useTableControls } from '@/lib/table-controls';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getApartments,
  getMonthlyData,
  upsertMonthlyData,
  exportMonthlyDataCSV,
  getMonthlyDataHistory,
} from '@/lib/admin-api';
import { Apartment, MonthlyData, MonthlyDataHistory } from '@/types/database';

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const APARTMENT_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

const eur = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** Numero di mesi mostrati nel grafico del fatturato (i più recenti). */
const REVENUE_CHART_MONTHS = 12;

export const AdminMonthlyData: React.FC = () => {
  // Link dalla dashboard (#occupazione / #fatturato): scorre fino al grafico richiesto
  const { hash, key: locationKey } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(t);
  }, [hash, locationKey]);

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [history, setHistory] = useState<MonthlyDataHistory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formAptId, setFormAptId] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1);
  const [formOccupancy, setFormOccupancy] = useState<number>(80);
  const [formAvgPrice, setFormAvgPrice] = useState<number>(92);
  const [formRevenue, setFormRevenue] = useState<string>('');
  const [formPriceDef, setFormPriceDef] = useState<'per_night' | 'per_stay'>('per_night');
  const [formNotes, setFormNotes] = useState('');

  const loadAll = React.useCallback(async () => {
    const [apts, mData, hist] = await Promise.all([
      getApartments(),
      getMonthlyData(),
      getMonthlyDataHistory(),
    ]);
    setApartments(apts);
    setMonthlyData(mData);
    setHistory(hist);
    if (apts.length > 0 && !formAptId) {
      setFormAptId(apts[0].id);
    }
  }, [formAptId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleOpenAdd = (existing?: MonthlyData) => {
    if (existing) {
      setFormAptId(existing.apartment_id);
      setFormYear(existing.year);
      setFormMonth(existing.month);
      setFormOccupancy(existing.occupancy_percentage);
      setFormAvgPrice(existing.average_price);
      setFormRevenue(existing.revenue != null ? String(existing.revenue) : '');
      setFormPriceDef(existing.price_definition);
      setFormNotes(existing.notes || '');
    } else {
      setFormRevenue('');
      setFormNotes('');
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formAptId) return;
    setIsSaving(true);
    try {
      await upsertMonthlyData({
        apartment_id: formAptId,
        year: Number(formYear),
        month: Number(formMonth),
        occupancy_percentage: Number(formOccupancy),
        average_price: Number(formAvgPrice),
        revenue: formRevenue.trim() === '' ? null : Math.max(0, Number(formRevenue)),
        price_definition: formPriceDef,
        notes: formNotes || null,
        is_manual: true,
      });

      toast.success('Dato mensile salvato con successo!');
      setDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await exportMonthlyDataCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `san_raffaele_dati_mensili_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export CSV completato con successo!');
    } catch {
      toast.error('Errore durante l\'export CSV.');
    }
  };

  const aptMap = useMemo(() => new Map(apartments.map((a) => [a.id, a.name])), [apartments]);

  // Ordinamento e filtri per colonna del Registro Storico
  const monthlyColumns = useMemo<ColumnDef<MonthlyData>[]>(
    () => [
      {
        key: 'period',
        type: 'select',
        accessor: (r) => `${monthNames[r.month - 1]} ${r.year}`,
        sortValue: (r) => r.year * 100 + r.month,
      },
      { key: 'apartment', type: 'select', accessor: (r) => aptMap.get(r.apartment_id) || r.apartment_id },
      { key: 'occupancy', type: 'number', accessor: (r) => Number(r.occupancy_percentage) },
      { key: 'price', type: 'number', accessor: (r) => Number(r.average_price) },
      { key: 'revenue', type: 'number', accessor: (r) => (r.revenue != null ? Number(r.revenue) : 0) },
      { key: 'notes', type: 'text', accessor: (r) => r.notes || '' },
    ],
    [aptMap]
  );
  const monthlyTable = useTableControls(monthlyData, monthlyColumns);

  // Build chart dataset grouped by Period (e.g. "08/2026", "09/2026")
  const periods = Array.from(
    new Set(monthlyData.map((m) => `${String(m.month).padStart(2, '0')}/${m.year}`))
  ).sort((a, b) => {
    const [ma, ya] = a.split('/').map(Number);
    const [mb, yb] = b.split('/').map(Number);
    return ya * 100 + ma - (yb * 100 + mb);
  });

  const chartData = periods.map((p) => {
    const [mStr, yStr] = p.split('/');
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);

    const row: Record<string, string | number> = { period: `${monthNames[m - 1].substring(0, 3)} ${y}` };
    apartments.forEach((apt) => {
      const match = monthlyData.find(
        (d) => d.apartment_id === apt.id && d.year === y && d.month === m
      );
      if (match) {
        row[`${apt.name}_occ`] = Number(match.occupancy_percentage);
        row[`${apt.name}_price`] = Number(match.average_price);
        if (match.revenue != null) row[`${apt.name}_rev`] = Number(match.revenue);
      }
    });
    return row;
  });

  // Fatturato: ultimi N mesi, una barra per appartamento
  const revenueChartData = chartData.slice(-REVENUE_CHART_MONTHS);
  const hasRevenueData = revenueChartData.some((row) =>
    apartments.some((apt) => row[`${apt.name}_rev`] !== undefined)
  );
  const revenueTotals = apartments.map((apt, i) => ({
    id: apt.id,
    name: apt.name,
    color: APARTMENT_COLORS[i % APARTMENT_COLORS.length],
    total: revenueChartData.reduce((acc, row) => acc + Number(row[`${apt.name}_rev`] ?? 0), 0),
  }));
  const revenueGrandTotal = revenueTotals.reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dati Mensili & Storico
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inserimento manuale e consultazione storica dei dati di occupazione, prezzo medio e fatturato.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            Audit Rettifiche ({history.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Esporta CSV
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenAdd()}
            className="gap-1.5 text-xs font-semibold bg-primary shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Registra Mese
          </Button>
        </div>
      </div>

      {/* Comparison Chart */}
      <Card id="occupazione" className="scroll-mt-20 lg:scroll-mt-6 border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Andamento Tasso di Occupazione (%)
          </CardTitle>
          <CardDescription className="text-xs">
            Confronto storico percentuale tra AMICI 1, AMICI 2 e AMICI 3
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Nessun dato storico sufficiente per tracciare il grafico. Inserisci i primi mesi per visualizzare il trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="AMICI 1_occ" name="AMICI 1" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="AMICI 2_occ" name="AMICI 2" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="AMICI 3_occ" name="AMICI 3" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card id="fatturato" className="scroll-mt-20 lg:scroll-mt-6 border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Euro className="h-4 w-4 text-primary" />
            Fatturato Mensile per Appartamento (€)
          </CardTitle>
          <CardDescription className="text-xs">
            Ultimi {REVENUE_CHART_MONTHS} mesi registrati, una barra per alloggio
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {hasRevenueData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {revenueTotals.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{eur.format(r.total)}</div>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Totale</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{eur.format(revenueGrandTotal)}</div>
              </div>
            </div>
          )}
          <div className="h-80 w-full">
            {!hasRevenueData ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                Nessun fatturato registrato. Usa "Registra Mese" per inserire il fatturato di ogni appartamento.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v: number) => eur.format(v)}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number) => eur.format(value)}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  {apartments.map((apt, i) => (
                    <Bar
                      key={apt.id}
                      dataKey={`${apt.name}_rev`}
                      name={apt.name}
                      fill={APARTMENT_COLORS[i % APARTMENT_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Registro Storico Dati Mensili
            </CardTitle>
            <CardDescription className="text-xs">
              Tutti i valori registrati, con note operative.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TableToolbar controls={monthlyTable} />
          <div className="overflow-x-auto">
            <table className="stack-table w-full text-xs text-left">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <ColumnHeader label="Periodo" columnKey="period" controls={monthlyTable} />
                  <ColumnHeader label="Alloggio" columnKey="apartment" controls={monthlyTable} />
                  <ColumnHeader label="Occupazione" columnKey="occupancy" controls={monthlyTable} />
                  <ColumnHeader label="Prezzo Medio" columnKey="price" controls={monthlyTable} />
                  <ColumnHeader label="Fatturato" columnKey="revenue" controls={monthlyTable} />
                  <ColumnHeader label="Note" columnKey="notes" controls={monthlyTable} />
                  <th className="stack-hide py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyTable.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td data-label="Periodo" className="py-3 px-4 font-bold text-slate-800">
                      {monthNames[row.month - 1]} {row.year}
                    </td>
                    <td data-label="Alloggio" className="py-3 px-4 font-semibold text-slate-700">
                      {aptMap.get(row.apartment_id) || row.apartment_id}
                    </td>
                    <td data-label="Occupazione" className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${row.occupancy_percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900">{row.occupancy_percentage}%</span>
                      </div>
                    </td>
                    <td data-label="Prezzo Medio" className="py-3 px-4 font-bold text-slate-900">
                      <span>
                        {row.average_price} €{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/notte</span>
                      </span>
                    </td>
                    <td data-label="Fatturato" className="py-3 px-4 font-bold text-slate-900">
                      {row.revenue != null ? eur.format(Number(row.revenue)) : <span className="text-slate-400 font-normal">—</span>}
                    </td>
                    <td data-label="Note" className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {row.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAdd(row)}
                        className="h-7 text-xs text-primary font-semibold hover:bg-primary/10"
                      >
                        Modifica
                      </Button>
                    </td>
                  </tr>
                ))}
                {monthlyTable.rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {monthlyTable.totalRows === 0
                        ? 'Nessun dato mensile registrato.'
                        : 'Nessuna riga corrisponde ai filtri selezionati.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Registra Dati Mensili</DialogTitle>
            <DialogDescription className="text-xs">
              Inserisci occupazione, prezzo medio e fatturato consuntivati per il mese selezionato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Alloggio</Label>
              <Select value={formAptId} onValueChange={setFormAptId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleziona alloggio" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Anno</Label>
                <Input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mese</Label>
                <Select value={String(formMonth)} onValueChange={(v) => setFormMonth(Number(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tasso Occupazione (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formOccupancy}
                    onChange={(e) => setFormOccupancy(Number(e.target.value))}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Prezzo Medio (€)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formAvgPrice}
                    onChange={(e) => setFormAvgPrice(Number(e.target.value))}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fatturato del Mese (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Es. 5400 (lascia vuoto se non ancora disponibile)"
                  value={formRevenue}
                  onChange={(e) => setFormRevenue(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note del Mese (opzionale)</Label>
              <Textarea
                rows={2}
                placeholder="Es. settimana ferragosto calma, congressi OSR dal 15 al 20..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 font-semibold">
              <Save className="h-4 w-4" />
              Salva Dato Mensile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Audit Modifiche Dati Mensili
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tracciamento delle correzioni e rettifiche sui valori storici inseriti.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nessuna rettifica registrata finora. Eventuali modifiche a mesi già registrati compariranno qui.
              </p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.change_reason || 'Rettifica'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(item.changed_at).toLocaleString('it-IT')}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                    <span>
                      Occupazione: <span className="line-through text-slate-400">{item.old_occupancy}%</span> →{' '}
                      <strong className="text-slate-900">{item.new_occupancy}%</strong>
                    </span>
                    <span>
                      Prezzo medio: <span className="line-through text-slate-400">{item.old_avg_price} €</span> →{' '}
                      <strong className="text-slate-900">{item.new_avg_price} €</strong>
                    </span>
                    {(item.old_revenue !== undefined || item.new_revenue !== undefined) &&
                      item.old_revenue !== item.new_revenue && (
                        <span>
                          Fatturato:{' '}
                          <span className="line-through text-slate-400">
                            {item.old_revenue != null ? eur.format(Number(item.old_revenue)) : '—'}
                          </span>{' '}
                          →{' '}
                          <strong className="text-slate-900">
                            {item.new_revenue != null ? eur.format(Number(item.new_revenue)) : '—'}
                          </strong>
                        </span>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
