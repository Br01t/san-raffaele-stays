import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Sliders, Trash2, ArrowLeft, Moon, Euro, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createStayRule, deleteStayRule, updateStayRule, StayRuleInput } from '@/lib/admin-api';
import {
  CHARGE_BASIS_LABELS,
  describeRule,
  getRuleType,
  isRuleActive,
  RULE_TYPE_LABELS,
} from '@/lib/stay-rules';
import {
  Apartment,
  MinStayRule,
  StayRuleAmountType,
  StayRuleChargeBasis,
  StayRuleType,
} from '@/types/database';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: MinStayRule[];
  apartments: Apartment[];
  /** Chiamata dopo ogni creazione / modifica / eliminazione, per ricaricare l'elenco. */
  onChanged: () => Promise<void> | void;
}

interface FormState {
  id: string | null;
  type: StayRuleType;
  name: string;
  apartmentId: string; // 'all' = tutti gli alloggi
  startDate: string;
  endDate: string;
  minNights: string;
  priority: string;
  amount: string;
  amountType: StayRuleAmountType;
  chargeBasis: StayRuleChargeBasis;
  thresholdNights: string;
  isActive: boolean;
  initialActive: boolean;
}

const emptyForm = (type: StayRuleType, apartmentId = 'all'): FormState => ({
  id: null,
  type,
  name: '',
  apartmentId,
  startDate: '',
  endDate: '',
  minNights: '2',
  priority: type === 'min_stay' ? '5' : '1',
  amount: '',
  amountType: 'percent',
  chargeBasis: 'per_stay',
  thresholdNights: '',
  isActive: true,
  initialActive: true,
});

const formFromRule = (r: MinStayRule): FormState => ({
  id: r.id,
  type: getRuleType(r),
  name: r.description ?? '',
  apartmentId: r.apartment_id ?? 'all',
  startDate: r.start_date ?? '',
  endDate: r.end_date ?? '',
  minNights: String(r.min_nights ?? 2),
  priority: String(r.priority ?? 1),
  amount: r.amount != null ? String(r.amount) : '',
  amountType: r.amount_type ?? 'percent',
  chargeBasis: r.charge_basis ?? 'per_stay',
  thresholdNights: r.threshold_nights != null ? String(r.threshold_nights) : '',
  isActive: isRuleActive(r),
  initialActive: isRuleActive(r),
});

const TYPE_ICONS = { min_stay: Moon, fee: Euro, discount: Percent } as const;

const EXAMPLES: Record<StayRuleType, string> = {
  min_stay: 'Es. "Minimo 4 notti durante il Salone del Mobile" (con periodo) oppure regola generale senza periodo.',
  fee: 'Es. "Pulizie finali: 40 €", con omaggio da 7 notti. Si aggiunge al totale del preventivo.',
  discount: 'Es. "Sconto settimana: 10% da 7 notti" oppure "-30 € da 5 notti". Si applica lo sconto più vantaggioso.',
};

export const StayRulesDialog: React.FC<Props> = ({ open, onOpenChange, rules, apartments, onChanged }) => {
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const aptName = useMemo(() => new Map(apartments.map((a) => [a.id, a.name])), [apartments]);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const grouped = (['min_stay', 'fee', 'discount'] as StayRuleType[]).map((type) => ({
    type,
    items: rules.filter((r) => getRuleType(r) === type),
  }));

  const handleSave = async () => {
    if (!form) return;
    const num = (v: string) => (v.trim() === '' ? null : Number(v));

    // Validazione
    if (form.type !== 'min_stay' && !form.name.trim()) return toast.error('Inserisci un nome per la regola.');
    if ((form.startDate && !form.endDate) || (!form.startDate && form.endDate)) {
      return toast.error('Indica sia la data di inizio sia quella di fine, oppure nessuna delle due.');
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return toast.error('La data di fine non può essere precedente a quella di inizio.');
    }
    const minNights = num(form.minNights);
    const amount = num(form.amount);
    const threshold = num(form.thresholdNights);
    if (form.type === 'min_stay' && (!minNights || minNights < 1 || !Number.isInteger(minNights))) {
      return toast.error('Il soggiorno minimo deve essere un numero intero di notti (almeno 1).');
    }
    if (form.type !== 'min_stay') {
      if (amount === null || Number.isNaN(amount) || amount < 0) return toast.error('Inserisci un importo valido.');
      if (form.type === 'discount' && amount <= 0) return toast.error('Lo sconto deve essere maggiore di zero.');
      if (form.type === 'discount' && form.amountType === 'percent' && amount > 100) {
        return toast.error('Lo sconto percentuale non può superare il 100%.');
      }
      if (threshold !== null && (Number.isNaN(threshold) || threshold < 1 || !Number.isInteger(threshold))) {
        return toast.error('Le notti soglia devono essere un numero intero (almeno 1) oppure vuote.');
      }
    }

    const payload: StayRuleInput = {
      rule_type: form.type,
      apartment_id: form.apartmentId === 'all' ? null : form.apartmentId,
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      description: form.name.trim() || (form.type === 'min_stay' ? `Minimo ${minNights} notti` : null),
      priority: Number(form.priority) || 1,
      min_nights: form.type === 'min_stay' ? minNights : null,
      amount: form.type === 'min_stay' ? null : amount,
      amount_type: form.type === 'discount' ? form.amountType : form.type === 'fee' ? 'fixed' : null,
      charge_basis: form.type === 'fee' ? form.chargeBasis : null,
      threshold_nights: form.type === 'min_stay' ? null : threshold,
    };
    // is_active si invia solo se è cambiato (così i soggiorni minimi funzionano anche prima della migrazione)
    if (form.id === null ? !form.isActive : form.isActive !== form.initialActive) {
      payload.is_active = form.isActive;
    }

    setSaving(true);
    try {
      if (form.id) await updateStayRule(form.id, payload);
      else await createStayRule(payload);
      await onChanged();
      toast.success(form.id ? 'Regola aggiornata' : 'Regola creata');
      setForm(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvataggio regola non riuscito.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule: MinStayRule) => {
    if (!window.confirm(`Eliminare la regola "${rule.description || describeRule(rule)}"?`)) return;
    try {
      await deleteStayRule(rule.id);
      await onChanged();
      toast.success('Regola eliminata');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eliminazione non riuscita.');
    }
  };

  const handleToggle = async (rule: MinStayRule, active: boolean) => {
    try {
      await updateStayRule(rule.id, { is_active: active, rule_type: getRuleType(rule), ...keepFields(rule) });
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Aggiornamento non riuscito.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setForm(null);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Regole di soggiorno
          </DialogTitle>
          <DialogDescription className="text-xs">
            Soggiorno minimo, costi aggiuntivi (es. pulizie) e sconti. Ogni regola può valere per tutti gli alloggi o
            per uno solo, sempre o in un periodo.
          </DialogDescription>
        </DialogHeader>

        {form ? (
          /* ------------------------------ Form ------------------------------ */
          <div className="space-y-4 py-1">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Torna all'elenco
            </button>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo di regola</Label>
              <Select
                value={form.type}
                disabled={form.id !== null}
                onValueChange={(v) => setForm({ ...emptyForm(v as StayRuleType, form.apartmentId), name: form.name })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RULE_TYPE_LABELS) as StayRuleType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {RULE_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{EXAMPLES[form.type]}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ruleName" className="text-xs font-semibold">
                Nome / descrizione{form.type === 'min_stay' ? ' (facoltativo)' : ''}
              </Label>
              <Input
                id="ruleName"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={form.type === 'fee' ? 'Pulizie finali' : form.type === 'discount' ? 'Sconto settimana' : 'Minimo 4 notti Salone del Mobile'}
                className="h-9"
              />
            </div>

            {form.type === 'min_stay' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ruleMin" className="text-xs font-semibold">Notti minime</Label>
                  <Input id="ruleMin" type="number" min={1} value={form.minNights} onChange={(e) => set('minNights', e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rulePrio" className="text-xs font-semibold">Priorità</Label>
                  <Input id="rulePrio" type="number" value={form.priority} onChange={(e) => set('priority', e.target.value)} className="h-9" />
                  <p className="text-[11px] text-muted-foreground">Se più regole coincidono vince la priorità più alta.</p>
                </div>
              </div>
            )}

            {form.type === 'fee' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="feeAmount" className="text-xs font-semibold">Importo (€)</Label>
                  <Input id="feeAmount" type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Si applica</Label>
                  <Select value={form.chargeBasis} onValueChange={(v) => set('chargeBasis', v as StayRuleChargeBasis)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CHARGE_BASIS_LABELS) as StayRuleChargeBasis[]).map((b) => (
                        <SelectItem key={b} value={b}>{CHARGE_BASIS_LABELS[b]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="feeFree" className="text-xs font-semibold">Omaggio da (notti) – facoltativo</Label>
                  <Input id="feeFree" type="number" min={1} value={form.thresholdNights} onChange={(e) => set('thresholdNights', e.target.value)} placeholder="Es. 7 = gratis con soggiorni di almeno 7 notti" className="h-9" />
                </div>
              </div>
            )}

            {form.type === 'discount' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tipo di sconto</Label>
                  <Select value={form.amountType} onValueChange={(v) => set('amountType', v as StayRuleAmountType)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentuale (%)</SelectItem>
                      <SelectItem value="fixed">Importo fisso (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="discAmount" className="text-xs font-semibold">
                    Valore ({form.amountType === 'percent' ? '%' : '€'})
                  </Label>
                  <Input id="discAmount" type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="discFrom" className="text-xs font-semibold">Valido da (notti) – facoltativo</Label>
                  <Input id="discFrom" type="number" min={1} value={form.thresholdNights} onChange={(e) => set('thresholdNights', e.target.value)} placeholder="Es. 7 = per soggiorni di almeno 7 notti" className="h-9" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alloggio</Label>
                <Select value={form.apartmentId} onValueChange={(v) => set('apartmentId', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli alloggi</SelectItem>
                    {apartments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ruleFrom" className="text-xs font-semibold">Dal (facoltativo)</Label>
                <Input id="ruleFrom" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ruleTo" className="text-xs font-semibold">Al (facoltativo)</Label>
                <Input id="ruleTo" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className="h-9" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              Senza periodo la regola vale sempre. Con un periodo vale se almeno una notte del soggiorno cade al suo interno.
            </p>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
              <div className="text-xs font-semibold text-slate-800">Regola attiva</div>
              <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setForm(null)} disabled={saving}>Annulla</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="font-semibold">
                {form.id ? 'Salva modifiche' : 'Crea regola'}
              </Button>
            </div>
          </div>
        ) : (
          /* ------------------------------ Elenco ------------------------------ */
          <div className="space-y-5 py-1">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RULE_TYPE_LABELS) as StayRuleType[]).map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => setForm(emptyForm(t))}
                >
                  <Plus className="h-3.5 w-3.5" /> {RULE_TYPE_LABELS[t]}
                </Button>
              ))}
            </div>

            {grouped.map(({ type, items }) => {
              const Icon = TYPE_ICONS[type];
              return (
                <div key={type} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" /> {RULE_TYPE_LABELS[type]} ({items.length})
                  </h3>
                  {items.length === 0 ? (
                    <p className="text-[11px] text-slate-400 pl-5">Nessuna regola. {EXAMPLES[type]}</p>
                  ) : (
                    items.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                          isRuleActive(rule) ? 'bg-slate-50 border-slate-100' : 'bg-white border-dashed border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800">{rule.description || describeRule(rule)}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span className="font-semibold text-slate-700">{describeRule(rule)}</span>
                            <span>{rule.apartment_id ? aptName.get(rule.apartment_id) ?? 'Alloggio' : 'Tutti gli alloggi'}</span>
                            <span>
                              {rule.start_date && rule.end_date ? `${rule.start_date} → ${rule.end_date}` : 'Sempre'}
                            </span>
                            {type === 'min_stay' && <span>Priorità {rule.priority}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isRuleActive(rule) && <Badge variant="outline" className="text-[10px]">Disattiva</Badge>}
                          <Switch
                            checked={isRuleActive(rule)}
                            onCheckedChange={(v) => handleToggle(rule, v)}
                            aria-label="Regola attiva"
                          />
                          <button
                            type="button"
                            onClick={() => setForm(formFromRule(rule))}
                            className="text-slate-400 hover:text-primary"
                            aria-label="Modifica regola"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rule)}
                            className="text-slate-400 hover:text-rose-600"
                            aria-label="Elimina regola"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** Campi da rimandare insieme a is_active per non azzerare nulla in un update parziale. */
function keepFields(rule: MinStayRule): Partial<StayRuleInput> {
  return {
    apartment_id: rule.apartment_id,
    start_date: rule.start_date,
    end_date: rule.end_date,
    priority: rule.priority,
    description: rule.description,
    min_nights: rule.min_nights,
    amount: rule.amount ?? null,
    amount_type: rule.amount_type ?? null,
    charge_basis: rule.charge_basis ?? null,
    threshold_nights: rule.threshold_nights ?? null,
  };
}

export default StayRulesDialog;
