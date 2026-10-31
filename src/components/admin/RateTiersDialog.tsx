import React, { useEffect, useState } from 'react';
import { Layers, Plus, Save, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Apartment, RateTier } from '@/types/database';
import { createRateTier, deleteRateTier, getRateTiers, updateRateTier } from '@/lib/admin-api';

export const TIER_COLORS = ['#33b679', '#039be5', '#f6bf26', '#f4511e', '#d50000', '#8e24aa', '#616161'];

interface Row {
  id: string | null; // null = nuovo
  name: string;
  p2: string;
  p3: string;
  p4: string;
  color: string;
}

const toRow = (t: RateTier): Row => ({
  id: t.id,
  name: t.name,
  p2: String(t.price_2p),
  p3: String(t.price_3p),
  p4: String(t.price_4p),
  color: t.color,
});

const num = (v: string) => Number(String(v).replace(',', '.'));

/**
 * Gestione degli scaglioni tariffari di un appartamento.
 * Modificando i prezzi, tutti i giorni del calendario che usano lo scaglione si aggiornano.
 */
export const RateTiersDialog: React.FC<{
  open: boolean;
  onOpenChange: (o: boolean) => void;
  apartment: Apartment | undefined;
  apartments: Apartment[];
  onChanged?: () => void;
}> = ({ open, onOpenChange, apartment, apartments, onChanged }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [original, setOriginal] = useState<RateTier[]>([]);
  const [busy, setBusy] = useState(false);

  const load = React.useCallback(async () => {
    if (!apartment) return;
    try {
      const tiers = await getRateTiers(apartment.id);
      setOriginal(tiers);
      setRows(tiers.map(toRow));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore nel caricamento degli scaglioni.');
    }
  }, [apartment]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!apartment) return null;
  const has4 = apartment.max_guests >= 4;

  const setRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const isDirty = (r: Row) => {
    if (!r.id) return true;
    const o = original.find((t) => t.id === r.id);
    return (
      !o ||
      o.name !== r.name ||
      Number(o.price_2p) !== num(r.p2) ||
      Number(o.price_3p) !== num(r.p3) ||
      Number(o.price_4p) !== num(r.p4) ||
      o.color !== r.color
    );
  };

  const saveRow = async (r: Row, i: number) => {
    const payload = {
      name: r.name.trim(),
      price_2p: num(r.p2),
      price_3p: num(r.p3),
      price_4p: has4 ? num(r.p4) : num(r.p3),
      color: r.color,
    };
    if ([payload.price_2p, payload.price_3p, payload.price_4p].some((n) => !Number.isFinite(n) || n < 0)) {
      toast.error('Inserisci prezzi validi.');
      return;
    }
    setBusy(true);
    try {
      let saved: RateTier;
      if (r.id) {
        saved = await updateRateTier(r.id, payload);
        toast.success(`Scaglione “${payload.name}” aggiornato: i giorni che lo usano sono stati ricalcolati.`);
      } else {
        saved = await createRateTier({ ...payload, apartment_id: apartment.id, sort_order: (i + 1) * 10 });
        toast.success(`Scaglione “${payload.name}” creato`);
      }
      setOriginal((prev) => (r.id ? prev.map((t) => (t.id === r.id ? saved : t)) : [...prev, saved]));
      setRows((prev) => prev.map((item, idx) => (idx === i ? toRow(saved) : item)));
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  };

  const createDefaults = async () => {
    setBusy(true);
    try {
      const b2 = Number(apartment.base_price_2p);
      const b3 = Number(apartment.base_price_3p);
      const b4 = Number(apartment.base_price_4p);
      const presets = [
        { name: 'Bassa', price_2p: Math.max(0, b2 - 10), price_3p: Math.max(0, b3 - 10), price_4p: Math.max(0, b4 - 10), color: TIER_COLORS[0], sort_order: 10 },
        { name: 'Media', price_2p: b2, price_3p: b3, price_4p: b4, color: TIER_COLORS[1], sort_order: 20 },
        { name: 'Alta', price_2p: b2 + 30, price_3p: b3 + 30, price_4p: b4 + 30, color: TIER_COLORS[3], sort_order: 30 },
      ];
      for (const p of presets) {
        await createRateTier({ ...p, apartment_id: apartment.id });
      }
      await load();
      onChanged?.();
      toast.success('Scaglioni Bassa, Media e Alta creati');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  };

  const removeRow = async (r: Row, i: number) => {
    if (!r.id) {
      setRows(rows.filter((_, idx) => idx !== i));
      return;
    }
    if (!window.confirm(`Eliminare lo scaglione “${r.name}”? I giorni che lo usano mantengono il prezzo attuale.`)) return;
    try {
      await deleteRateTier(r.id);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    }
  };

  const addRow = (preset?: Partial<Row>) =>
    setRows([
      ...rows,
      {
        id: null,
        name: '',
        p2: String(apartment.base_price_2p),
        p3: String(apartment.base_price_3p),
        p4: String(apartment.base_price_4p),
        color: TIER_COLORS[rows.length % TIER_COLORS.length],
        ...preset,
      },
    ]);

  /** Copia gli scaglioni sugli altri appartamenti (stesso nome = aggiorna i prezzi). */
  const copyToOthers = async () => {
    const others = apartments.filter((a) => a.id !== apartment.id);
    if (original.length === 0 || others.length === 0) return;
    if (!window.confirm(`Copiare i ${original.length} scaglioni su ${others.map((a) => a.name).join(', ')}? Quelli con lo stesso nome verranno aggiornati.`)) return;
    setBusy(true);
    try {
      for (const other of others) {
        const existing = await getRateTiers(other.id);
        for (const t of original) {
          const payload = {
            name: t.name,
            price_2p: Number(t.price_2p),
            price_3p: Number(t.price_3p),
            price_4p: Number(t.price_4p),
            color: t.color,
          };
          const same = existing.find((e) => e.name.toLowerCase() === t.name.toLowerCase());
          if (same) await updateRateTier(same.id, payload);
          else await createRateTier({ ...payload, apartment_id: other.id, sort_order: t.sort_order });
        }
      }
      toast.success('Scaglioni copiati sugli altri appartamenti');
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Scaglioni tariffari · {apartment.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ogni scaglione è un gruppo di prezzi per 2, 3{has4 ? ' e 4' : ''} persone. Nel calendario scegli lo scaglione invece
            di scrivere il prezzo; se poi modifichi qui i prezzi, tutti i giorni con quello scaglione si aggiornano da soli.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="text-left font-semibold py-2 pr-2">Nome scaglione</th>
                <th className="text-left font-semibold py-2 px-1">2 persone</th>
                <th className="text-left font-semibold py-2 px-1">3 persone</th>
                {has4 && <th className="text-left font-semibold py-2 px-1">4 persone</th>}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? `new-${i}`} className="border-t border-slate-100">
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-5 w-5 rounded-full shrink-0 ring-2 ring-white shadow"
                        style={{ backgroundColor: r.color }}
                        title="Cambia colore"
                        aria-label="Cambia colore"
                        onClick={() => setRow(i, { color: TIER_COLORS[(TIER_COLORS.indexOf(r.color) + 1) % TIER_COLORS.length] })}
                      />
                      <Input
                        value={r.name}
                        onChange={(e) => setRow(i, { name: e.target.value })}
                        placeholder="Es. Bassa, Media, Alta, Fiera"
                        className="h-8 text-xs min-w-[120px]"
                      />
                    </div>
                  </td>
                  {(['p2', 'p3', ...(has4 ? ['p4'] : [])] as ('p2' | 'p3' | 'p4')[]).map((k) => (
                    <td key={k} className="py-2 px-1">
                      <div className="relative">
                        <Input
                          inputMode="decimal"
                          value={r[k]}
                          onChange={(e) => setRow(i, { [k]: e.target.value })}
                          className="h-8 text-xs w-20 pr-5"
                          aria-label={`Prezzo ${k[1]} persone`}
                        />
                        <span className="absolute right-2 top-2 text-slate-400">€</span>
                      </div>
                    </td>
                  ))}
                  <td className="py-2 pl-1 whitespace-nowrap text-right">
                    {isDirty(r) && (
                      <Button size="sm" className="h-8 gap-1 text-xs" disabled={busy || !r.name.trim()} onClick={() => saveRow(r, i)}>
                        <Save className="h-3.5 w-3.5" /> Salva
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeRow(r, i)} aria-label="Elimina scaglione">
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={has4 ? 5 : 4} className="py-6 text-center text-slate-400">
                    Nessuno scaglione. Creane uno per iniziare (es. Bassa, Media, Alta).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => addRow()}>
              <Plus className="h-3.5 w-3.5" /> Nuovo scaglione
            </Button>
            {rows.length === 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                disabled={busy}
                onClick={createDefaults}
              >
                Proponi Bassa / Media / Alta
              </Button>
            )}
          </div>
          {original.length > 0 && apartments.length > 1 && (
            <Button size="sm" variant="ghost" className="gap-1 text-xs" disabled={busy} onClick={copyToOthers}>
              <Copy className="h-3.5 w-3.5" /> Copia sugli altri appartamenti
            </Button>
          )}
        </div>
        {rows.some((r) => !r.id) && (
          <p className="text-[11px] text-amber-700">Ricordati di premere “Salva” su ogni nuovo scaglione.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
