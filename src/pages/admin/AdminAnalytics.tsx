import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  PhoneCall,
  MessageCircle,
  Mail,
  Eye,
  Search,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  MousePointerClick,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSiteEvents } from '@/lib/tracking';
import { SiteEvent } from '@/types/database';
import { ColumnHeader, TableToolbar } from '@/components/admin/ColumnHeader';
import { ColumnDef, useTableControls } from '@/lib/table-controls';

// Inserisci qui l'URL di incorporamento del report Google Data Studio.
const GOOGLE_DATA_STUDIO_EMBED_URL = 'https://datastudio.google.com/embed/reporting/b6670af3-d9f3-4022-aa9d-b71df15a68bd/page/6zXD';


const PERIODS = [
  { key: '7', label: 'Ultimi 7 giorni', days: 7 },
  { key: '30', label: 'Ultimi 30 giorni', days: 30 },
  { key: '90', label: 'Ultimi 90 giorni', days: 90 },
  { key: 'all', label: 'Sempre', days: 0 },
] as const;

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Pagina visitata',
  phone_click: 'Clic telefono',
  whatsapp_click: 'Clic WhatsApp',
  email_click: 'Clic email',
  form_start: 'Form iniziato',
  form_submit: 'Form inviato',
  form_error: 'Form: errore invio',
};

const CONTACT_TYPES = ['phone_click', 'whatsapp_click', 'email_click', 'form_submit'];

export const AdminAnalytics: React.FC = () => {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['key']>('30');
  const [fromDatabase, setFromDatabase] = useState(true);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const days = PERIODS.find((p) => p.key === period)!.days;
      const since = days ? new Date(Date.now() - days * 86400000).toISOString() : undefined;
      const res = await getSiteEvents(since);
      if (cancelled) return;
      setEvents(res.events);
      setFromDatabase(res.fromDatabase);
      setTruncated(res.truncated);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  // Conteggi aggregati su TUTTI gli eventi del periodo (non solo gli ultimi 100)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of events) c[e.event_type] = (c[e.event_type] || 0) + 1;
    return c;
  }, [events]);

  const phoneClicks = counts['phone_click'] || 0;
  const whatsappClicks = counts['whatsapp_click'] || 0;
  const emailClicks = counts['email_click'] || 0;
  const formSubmits = counts['form_submit'] || 0;
  const formStarts = counts['form_start'] || 0;
  const formErrors = counts['form_error'] || 0;
  const pageViews = counts['page_view'] || 0;
  const totalContacts = phoneClicks + whatsappClicks + emailClicks + formSubmits;

  // Dettaglio per singolo pulsante / link
  const byButton = useMemo(() => {
    const map = new Map<string, { type: string; label: string; page: string; apartment: string; count: number }>();
    for (const e of events) {
      if (!CONTACT_TYPES.includes(e.event_type)) continue;
      const md = (e.metadata || {}) as Record<string, unknown>;
      const label = String(md.label ?? md.form ?? e.event_type);
      const apartment = md.apartment ? String(md.apartment) : '';
      const key = `${e.event_type}|${label}|${apartment}|${e.page_path}`;
      const row = map.get(key) ?? { type: e.event_type, label, page: e.page_path, apartment, count: 0 };
      row.count += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [events]);

  // Registro: tutti i contatti del periodo (non solo gli ultimi), con "mostra altri"
  const recentEvents = useMemo(
    () => events.filter((e) => CONTACT_TYPES.includes(e.event_type) || e.event_type === 'form_error'),
    [events]
  );
  const [visibleLog, setVisibleLog] = useState(50);

  const buttonColumns = useMemo<ColumnDef<(typeof byButton)[number]>[]>(
    () => [
      { key: 'label', type: 'text', accessor: (r) => r.label },
      { key: 'apartment', type: 'select', accessor: (r) => r.apartment || '—' },
      { key: 'type', type: 'select', accessor: (r) => EVENT_LABELS[r.type] ?? r.type },
      { key: 'page', type: 'select', accessor: (r) => r.page },
      { key: 'count', type: 'number', accessor: (r) => r.count },
    ],
    []
  );
  const buttonTable = useTableControls(byButton, buttonColumns, { key: 'count', dir: 'desc' });

  const logColumns = useMemo<ColumnDef<SiteEvent>[]>(
    () => [
      {
        key: 'date',
        type: 'text',
        accessor: (e) => new Date(e.created_at).toLocaleString('it-IT'),
        sortValue: (e) => new Date(e.created_at).getTime(),
      },
      { key: 'type', type: 'select', accessor: (e) => EVENT_LABELS[e.event_type] ?? e.event_type },
      { key: 'page', type: 'select', accessor: (e) => e.page_path },
      {
        key: 'button',
        type: 'text',
        accessor: (e) => {
          const md = (e.metadata || {}) as Record<string, unknown>;
          return `${String(md.label ?? md.form ?? '—')}${md.apartment ? ` (${String(md.apartment)})` : ''}`;
        },
      },
    ],
    []
  );
  const logTable = useTableControls(recentEvents, logColumns, { key: 'date', dir: 'desc' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Analytics & Statistiche
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoraggio conversioni del sito, integrazione Google Search Console e Google Business Profile.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="site" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="site" className="text-xs font-semibold">
            Metriche Sito Web
          </TabsTrigger>
          <TabsTrigger value="gsc" className="text-xs font-semibold">
            Google Search Console
          </TabsTrigger>
          <TabsTrigger value="gbp" className="text-xs font-semibold">
            Google Business Profile
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Metriche Sito Web */}
        <TabsContent value="site" className="space-y-6">
          {!fromDatabase && (
            <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Database non collegato:</strong> in questo ambiente le variabili{' '}
                <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> non sono presenti nella build,
                quindi gli eventi dei visitatori restano nel loro browser e <strong>qui non compaiono</strong>.
                Quello che vedi sotto proviene solo da questo browser.
              </p>
            </div>
          )}
          {truncated && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              Periodo molto ampio: sono stati letti solo gli eventi più recenti. Restringi il periodo per conteggi esatti.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Contatti totali nel periodo:{' '}
              <strong className="text-slate-900 text-sm">{loading ? '…' : totalContacts}</strong>{' '}
              (telefono + WhatsApp + email + form inviati)
            </p>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    period === p.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Telefonate Cliccate', value: phoneClicks, hint: 'Clic su qualsiasi numero di telefono', Icon: PhoneCall, tone: 'bg-emerald-50 text-emerald-600' },
              { title: 'Contatti WhatsApp', value: whatsappClicks, hint: 'Clic su Contattaci, Richiedi informazioni/disponibilità, chat…', Icon: MessageCircle, tone: 'bg-green-50 text-green-600' },
              { title: 'Moduli Inviati', value: formSubmits, hint: formStarts ? `${formStarts} compilazioni iniziate${formErrors ? ` · ${formErrors} errori di invio` : ''}` : 'Invii riusciti del form contatti', Icon: Send, tone: 'bg-blue-50 text-blue-600' },
              { title: 'Pagine Visitate', value: pageViews, hint: 'Visualizzazioni di pagina anonime', Icon: Eye, tone: 'bg-purple-50 text-purple-600' },
            ].map(({ title, value, hint, Icon, tone }) => (
              <Card key={title} className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase text-slate-500">{title}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{loading ? '…' : value}</div>
                  <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {emailClicks > 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Clic su indirizzi email: <strong className="text-slate-800">{emailClicks}</strong>
            </p>
          )}

          {/* Dettaglio per pulsante */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-bold text-slate-900">Dettaglio per pulsante</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Quale pulsante o link genera più contatti, nel periodo selezionato.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableToolbar controls={buttonTable} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <ColumnHeader label="Pulsante / link" columnKey="label" controls={buttonTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Alloggio" columnKey="apartment" controls={buttonTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Tipo" columnKey="type" controls={buttonTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Pagina" columnKey="page" controls={buttonTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Clic" columnKey="count" controls={buttonTable} align="right" className="py-2.5 px-4 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buttonTable.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {byButton.length === 0
                            ? 'Nessun contatto registrato nel periodo.'
                            : 'Nessuna riga corrisponde ai filtri selezionati.'}
                        </td>
                      </tr>
                    ) : (
                      buttonTable.rows.map((r) => (
                        <tr key={`${r.type}|${r.label}|${r.apartment}|${r.page}`} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{r.label}</td>
                          <td className="py-2.5 px-4 text-slate-600">{r.apartment || '—'}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant="outline" className="text-[10px]">{EVENT_LABELS[r.type] ?? r.type}</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">{r.page}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">{r.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Registro Interazioni */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Registro Interazioni</CardTitle>
              <CardDescription className="text-xs">
                Tutti i contatti del periodo selezionato (clic su telefono, WhatsApp, email e invii del modulo).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TableToolbar controls={logTable} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <ColumnHeader label="Data e Ora" columnKey="date" controls={logTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Tipo Evento" columnKey="type" controls={logTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Pagina" columnKey="page" controls={logTable} className="py-2.5 px-4" />
                      <ColumnHeader label="Pulsante" columnKey="button" controls={logTable} className="py-2.5 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logTable.rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          {recentEvents.length === 0
                            ? 'Nessun evento ancora registrato. Cliccando sui pulsanti di contatto sul sito gli eventi appariranno qui.'
                            : 'Nessuna riga corrisponde ai filtri selezionati.'}
                        </td>
                      </tr>
                    ) : (
                      logTable.rows.slice(0, visibleLog).map((evt) => {
                        const md = (evt.metadata || {}) as Record<string, unknown>;
                        return (
                          <tr key={evt.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-4 text-slate-500">{new Date(evt.created_at).toLocaleString('it-IT')}</td>
                            <td className="py-2.5 px-4">
                              <Badge variant="outline" className="text-[10px]">{EVENT_LABELS[evt.event_type] ?? evt.event_type}</Badge>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">{evt.page_path}</td>
                            <td className="py-2.5 px-4 text-slate-500">
                              {String(md.label ?? md.form ?? '—')}
                              {md.apartment ? ` (${String(md.apartment)})` : ''}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {logTable.rows.length > visibleLog && (
                <div className="p-3 text-center border-t border-slate-100">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setVisibleLog((v) => v + 50)}>
                    Mostra altri 50 ({logTable.rows.length - visibleLog} rimanenti)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Google Search Console — Report Google Data Studio */}
        <TabsContent value="gsc" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Report Google Search Console
              </h2>
              <p className="text-sm text-slate-500">
                Report completo Google Data Studio per amicidelsanraffaele.com.
              </p>
            </div>
            {GOOGLE_DATA_STUDIO_EMBED_URL.startsWith('https://') &&
              !GOOGLE_DATA_STUDIO_EMBED_URL.includes('INSERISCI_URL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      GOOGLE_DATA_STUDIO_EMBED_URL,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                  className="flex items-center gap-2 shrink-0"
                >
                  Apri report in una nuova scheda
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {GOOGLE_DATA_STUDIO_EMBED_URL.startsWith('https://') &&
              !GOOGLE_DATA_STUDIO_EMBED_URL.includes('INSERISCI_URL') ? (
                <iframe
                  src={GOOGLE_DATA_STUDIO_EMBED_URL}
                  title="Report Google Data Studio - Google Search Console"
                  className="block w-full border-0"
                  style={{
                    height: 'calc(100vh - 190px)',
                    minHeight: '700px',
                  }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 p-8 text-center">
                  <Search className="mb-4 h-10 w-10 text-slate-400" />
                  <h3 className="text-base font-semibold text-slate-800">
                    Inserisci l'URL del report Google Data Studio
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                    Incolla l'URL di incorporamento del report nella costante
                    GOOGLE_DATA_STUDIO_EMBED_URL, in cima al file. Verifica che
                    l'incorporamento sia abilitato e che il report sia accessibile
                    agli utenti autorizzati.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Google Business Profile */}
        <TabsContent value="gbp" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Google Business Profile (Scheda Google Maps)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Stato fattibilità e metriche di visibilità locale
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-xs">
                  Valutazione Completata
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  Esito Valutazione di Fattibilità Tecnica
                </div>
                <p className="text-slate-600 leading-relaxed">
                  L'API di Google Business Profile (<em>Performance API</em>) richiede l'autenticazione OAuth 2.0 con l'account proprietario della scheda Google Business. Le metriche consultabili includono: visualizzazioni della scheda su Google Maps e Ricerca, chiamate telefoniche avviate, richieste di indicazioni stradali e visite al sito web.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Raccomandazione:</strong> Il sistema San Raffaele Stays è strutturato per archiviare queste metriche nella tabella <code>analytics_cache</code> non appena il cliente collegherà il proprio account Google con autorizzazione OAuth. Nel frattempo, tutte le conversioni dirette dal sito (telefonate e chat WhatsApp) vengono già conteggiate nel tab <em>Metriche Sito Web</em> in tempo reale.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};