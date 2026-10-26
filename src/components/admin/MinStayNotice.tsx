import React, { useState } from 'react';
import { Moon, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createStayRule, updateStayRule } from '@/lib/admin-api';
import { DEFAULT_MIN_NIGHTS, getAlwaysMinStayRule } from '@/lib/stay-rules';
import { MinStayRule } from '@/types/database';

interface Props {
  apartmentId: string;
  apartmentName?: string;
  rules: MinStayRule[];
  onChanged: () => void | Promise<void>;
}

const nightsLabel = (n: number) => `${n} ${n === 1 ? 'notte' : 'notti'}`;

/**
 * Regola delle notti minime mostrata come semplice testo accanto al calendario.
 * È solo informativa: non blocca prenotazioni né date. Si modifica direttamente da qui.
 */
export const MinStayNotice: React.FC<Props> = ({ apartmentId, apartmentName, rules, onChanged }) => {
  const rule = getAlwaysMinStayRule(rules, apartmentId);
  const minNights = rule?.min_nights ?? DEFAULT_MIN_NIGHTS;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setValue(String(minNights));
    setEditing(true);
  };

  const save = async () => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 60) {
      toast.error('Inserisci un numero intero di notti (da 1 a 60).');
      return;
    }
    setSaving(true);
    try {
      if (rule && rule.apartment_id === apartmentId) {
        await updateStayRule(rule.id, { min_nights: n, description: `Minimo ${n} notti` });
      } else {
        // La regola attuale è quella generale (o manca): ne creo una solo per questo alloggio
        await createStayRule({
          rule_type: 'min_stay',
          apartment_id: apartmentId,
          min_nights: n,
          start_date: null,
          end_date: null,
          priority: Math.max(rule?.priority ?? 1, 1),
          description: `Minimo ${n} notti`,
        });
      }
      await onChanged();
      toast.success('Notti minime aggiornate.');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvataggio non riuscito.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
      data-testid="min-stay-notice"
    >
      <Moon className="h-4 w-4 shrink-0 text-sky-600" />
      {editing ? (
        <>
          <label htmlFor="minStayInline" className="font-medium">
            {apartmentName ? `${apartmentName}: ` : ''}prenotazione minima di
          </label>
          <Input
            id="minStayInline"
            type="number"
            min={1}
            max={60}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void save();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="h-8 w-20 bg-white"
            autoFocus
          />
          <span>notti</span>
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={save} disabled={saving} className="h-8 gap-1 text-xs font-semibold">
              <Check className="h-3.5 w-3.5" />
              Salva
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving} className="h-8 gap-1 text-xs">
              <X className="h-3.5 w-3.5" />
              Annulla
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium">
            {apartmentName ? `${apartmentName}: s` : 'S'}i richiede una prenotazione minima di{' '}
            <strong className="font-extrabold">{nightsLabel(minNights)}</strong>, in ogni periodo.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={startEdit}
            className="h-7 gap-1 px-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 hover:text-sky-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifica
          </Button>
        </>
      )}
    </div>
  );
};
