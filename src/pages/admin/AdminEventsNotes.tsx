import React, { useEffect, useState } from 'react';
import {
  CalendarCheck2,
  FileText,
  PlusCircle,
  Flame,
  Trash2,
  Calendar,
  Sparkles,
  Lock,
  Tag,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  getEvents,
  createEvent,
  deleteEvent,
  getNotes,
  createNote,
  deleteNote,
  getApartments,
} from '@/lib/admin-api';
import { EventItem, InternalNote, Apartment } from '@/types/database';

export const AdminEventsNotes: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  // Event form
  const [evtName, setEvtName] = useState('');
  const [evtStartDate, setEvtStartDate] = useState('');
  const [evtEndDate, setEvtEndDate] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtHighDemand, setEvtHighDemand] = useState(true);

  // Note form
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'tariff' | 'reminder' | 'maintenance' | 'general'>('general');
  const [noteAptId, setNoteAptId] = useState<string>('all');
  const [noteDate, setNoteDate] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [evts, nts, apts] = await Promise.all([getEvents(), getNotes(), getApartments()]);
    setEvents(evts);
    setNotes(nts);
    setApartments(apts);
  }

  const handleCreateEvent = async () => {
    if (!evtName || !evtStartDate || !evtEndDate) {
      toast.warning('Compila nome e date dell\'evento.');
      return;
    }
    try {
      await createEvent({
        name: evtName,
        start_date: evtStartDate,
        end_date: evtEndDate,
        description: evtDesc || null,
        is_high_demand: evtHighDemand,
        extra_info: {},
      });
      toast.success('Evento aggiunto con successo!');
      setEventDialogOpen(false);
      setEvtName('');
      setEvtStartDate('');
      setEvtEndDate('');
      setEvtDesc('');
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio dell\'evento.';
      toast.error(msg);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      await deleteEvent(id);
      toast.success('Evento eliminato.');
      await loadAll();
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent) {
      toast.warning('Inserisci il testo della nota.');
      return;
    }
    try {
      await createNote({
        apartment_id: noteAptId === 'all' ? null : noteAptId,
        event_id: null,
        note_date: noteDate || null,
        content: noteContent,
        category: noteCategory,
        is_private: true,
      });
      toast.success('Nota interna salvata!');
      setNoteDialogOpen(false);
      setNoteContent('');
      setNoteDate('');
      await loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio della nota.';
      toast.error(msg);
    }
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    toast.success('Nota eliminata.');
    await loadAll();
  };

  const aptMap = new Map(apartments.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Eventi & Note Interne
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestisci festività, fiere di Milano, congressi medici OSR e note private di gestione.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setEventDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nuovo Evento
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNoteDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nuova Nota
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Eventi & Festività */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-amber-500" />
              Eventi Monitorati ({events.length})
            </h2>
          </div>

          <div className="space-y-3">
            {events.map((evt) => (
              <Card key={evt.id} className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {evt.name}
                      {evt.is_high_demand && (
                        <Badge className="bg-amber-600 text-[10px] gap-1">
                          <Flame className="h-3 w-3 fill-white" /> Alta Richiesta
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-[11px] text-amber-800 font-semibold mt-1">
                      📅 Dal {evt.start_date} al {evt.end_date}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                {evt.description && (
                  <CardContent className="p-4 text-xs text-slate-600">
                    {evt.description}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Note Interne Riservate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Note Interne Riservate ({notes.length})
            </h2>
            <Badge variant="outline" className="text-[10px] gap-1 bg-slate-50 text-slate-600">
              <Lock className="h-3 w-3" /> Solo Admin
            </Badge>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="border-slate-200 shadow-sm">
                <CardHeader className="p-3.5 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {note.category}
                    </Badge>
                    {note.apartment_id && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                        {aptMap.get(note.apartment_id) || 'Alloggio'}
                      </Badge>
                    )}
                    {note.note_date && (
                      <span className="text-[11px] text-slate-400">📅 {note.note_date}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                    className="h-7 w-7 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3.5 pt-1 text-xs text-slate-700 whitespace-pre-wrap">
                  {note.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Aggiungi Nuovo Evento</DialogTitle>
            <DialogDescription className="text-xs">
              Gli eventi inseriti verranno evidenziati sul calendario con contrassegno alta richiesta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nome Evento</Label>
              <Input
                placeholder="Es. Salone del Mobile 2027, Convegno OSR..."
                value={evtName}
                onChange={(e) => setEvtName(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Data Inizio</Label>
                <Input
                  type="date"
                  value={evtStartDate}
                  onChange={(e) => setEvtStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Data Fine</Label>
                <Input
                  type="date"
                  value={evtEndDate}
                  onChange={(e) => setEvtEndDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <div>
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                  Contrassegno Alta Richiesta
                </div>
                <div className="text-[11px] text-amber-700">Evidenzia nel calendario e nel preventivatore</div>
              </div>
              <Switch checked={evtHighDemand} onCheckedChange={setEvtHighDemand} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Descrizione (opzionale)</Label>
              <Textarea
                rows={2}
                placeholder="Dettagli sull'affluenza attesa, target ospiti..."
                value={evtDesc}
                onChange={(e) => setEvtDesc(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEventDialogOpen(false)}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleCreateEvent} className="font-semibold">
              Salva Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Aggiungi Nota Interna</DialogTitle>
            <DialogDescription className="text-xs">
              Le note sono visibili solo a te e non vengono mostrate sul sito pubblico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Categoria</Label>
                <Select value={noteCategory} onValueChange={(v: 'tariff' | 'reminder' | 'maintenance' | 'general') => setNoteCategory(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Generale</SelectItem>
                    <SelectItem value="tariff">Tariffe & Offerte</SelectItem>
                    <SelectItem value="maintenance">Manutenzione</SelectItem>
                    <SelectItem value="reminder">Promemoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alloggio Riferimento</Label>
                <Select value={noteAptId} onValueChange={setNoteAptId}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti / Nessuno specifico</SelectItem>
                    {apartments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data Riferimento (opzionale)</Label>
              <Input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Contenuto Nota</Label>
              <Textarea
                rows={3}
                placeholder="Inserisci la nota o promemoria..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNoteDialogOpen(false)}>
              Annulla
            </Button>
            <Button size="sm" onClick={handleCreateNote} className="font-semibold">
              Salva Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
