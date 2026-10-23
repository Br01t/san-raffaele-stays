import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Edit3,
  Check,
  Save,
  BedDouble,
  Users,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getApartments, updateApartment } from '@/lib/admin-api';
import { Apartment } from '@/types/database';

export const AdminApartments: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadApartments();
  }, []);

  async function loadApartments() {
    setLoading(true);
    try {
      const data = await getApartments();
      setApartments(data);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenEdit = (apt: Apartment) => {
    setEditingApt({ ...apt });
  };

  const handleSave = async () => {
    if (!editingApt) return;
    setIsSaving(true);
    try {
      await updateApartment(editingApt.id, {
        name: editingApt.name,
        description: editingApt.description,
        location_description: editingApt.location_description,
        beds_description: editingApt.beds_description,
        base_price_2p: Number(editingApt.base_price_2p),
        base_price_3p: Number(editingApt.base_price_3p),
        base_price_4p: Number(editingApt.base_price_4p),
        extra_guest_supplement: Number(editingApt.extra_guest_supplement),
        cleaning_fee: Number(editingApt.cleaning_fee),
        max_guests: Number(editingApt.max_guests),
        is_active: editingApt.is_active,
      });
      toast.success(`Scheda ${editingApt.name} aggiornata con successo!`);
      setEditingApt(null);
      await loadApartments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Gestione Alloggi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualizza e modifica le informazioni base, tariffe standard e capienza dei 3 alloggi.
          </p>
        </div>
      </div>

      {/* Grid of 3 Apartments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {apartments.map((apt) => (
          <Card key={apt.id} className="border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
            <div>
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {apt.name.replace('AMICI ', '')}
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{apt.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {apt.is_active ? 'Attivo' : 'Non attivo'}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-600 line-clamp-2">
                  {apt.location_description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Letti & Ospiti */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <BedDouble className="h-4 w-4 text-slate-400" />
                    <span>Configurazione Letti</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {apt.beds_description}
                  </p>
                </div>

                {/* Prezzi Base */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Tariffe Standard a Notte</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-500 font-medium">2 Persone</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{apt.base_price_2p} €</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-500 font-medium">3 Persone</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{apt.base_price_3p} €</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-500 font-medium">4 Persone</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{apt.base_price_4p} €</div>
                    </div>
                  </div>
                </div>

                {/* Costi Aggiuntivi */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[10px] block">Ospite Aggiuntivo:</span>
                    <span className="font-semibold text-slate-800">+{apt.extra_guest_supplement} €/notte</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[10px] block">Costo Pulizie:</span>
                    <span className="font-semibold text-slate-800">
                      {Number(apt.cleaning_fee) === 0 ? 'Gratuito (0 €)' : `${apt.cleaning_fee} €`}
                    </span>
                  </div>
                </div>

                {/* Servizi Tag */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-700">Dotazioni Principali</div>
                  <div className="flex flex-wrap gap-1">
                    {apt.services.slice(0, 6).map((srv) => (
                      <span
                        key={srv}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                    {apt.services.length > 6 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        +{apt.services.length - 6} altri
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(apt)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Edit3 className="h-3.5 w-3.5" /> Modifica
              </Button>
              <Link to={`/admin/calendario?apartment=${apt.id}`} className="w-full">
                <Button size="sm" className="w-full gap-1.5 text-xs font-semibold">
                  <CalendarDays className="h-3.5 w-3.5" /> Calendario
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingApt && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingApt(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Modifica Scheda {editingApt.name}</DialogTitle>
              <DialogDescription className="text-xs">
                Aggiorna le tariffe predefinite e i dettagli operativi dell'alloggio.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price2p" className="text-xs font-semibold">Prezzo 2 Pers. (€)</Label>
                  <Input
                    id="price2p"
                    type="number"
                    value={editingApt.base_price_2p}
                    onChange={(e) => setEditingApt({ ...editingApt, base_price_2p: Number(e.target.value) })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price3p" className="text-xs font-semibold">Prezzo 3 Pers. (€)</Label>
                  <Input
                    id="price3p"
                    type="number"
                    value={editingApt.base_price_3p}
                    onChange={(e) => setEditingApt({ ...editingApt, base_price_3p: Number(e.target.value) })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price4p" className="text-xs font-semibold">Prezzo 4 Pers. (€)</Label>
                  <Input
                    id="price4p"
                    type="number"
                    value={editingApt.base_price_4p}
                    onChange={(e) => setEditingApt({ ...editingApt, base_price_4p: Number(e.target.value) })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="extraSupplement" className="text-xs font-semibold">Supplemento Ospite Extra (€)</Label>
                  <Input
                    id="extraSupplement"
                    type="number"
                    value={editingApt.extra_guest_supplement}
                    onChange={(e) => setEditingApt({ ...editingApt, extra_guest_supplement: Number(e.target.value) })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cleaningFee" className="text-xs font-semibold">Costo Pulizia (€)</Label>
                  <Input
                    id="cleaningFee"
                    type="number"
                    value={editingApt.cleaning_fee}
                    onChange={(e) => setEditingApt({ ...editingApt, cleaning_fee: Number(e.target.value) })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="beds" className="text-xs font-semibold">Descrizione Letti e Capienza</Label>
                <Input
                  id="beds"
                  value={editingApt.beds_description || ''}
                  onChange={(e) => setEditingApt({ ...editingApt, beds_description: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold">Descrizione Posizione</Label>
                <Textarea
                  id="location"
                  rows={3}
                  value={editingApt.location_description || ''}
                  onChange={(e) => setEditingApt({ ...editingApt, location_description: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setEditingApt(null)} disabled={isSaving}>
                Annulla
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 font-semibold">
                {isSaving ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
