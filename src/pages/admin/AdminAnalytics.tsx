import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRecentSiteEvents } from '@/lib/tracking';
import { SiteEvent } from '@/types/database';

// Inserisci qui l'URL di incorporamento del report Google Data Studio.
const GOOGLE_DATA_STUDIO_EMBED_URL = 'https://datastudio.google.com/embed/reporting/b6670af3-d9f3-4022-aa9d-b71df15a68bd/page/6zXD';


export const AdminAnalytics: React.FC = () => {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const evts = await getRecentSiteEvents();
      setEvents(evts);
      setLoading(false);
    }
    load();
  }, []);

  // Calcola metriche aggregate degli eventi sito
  const phoneClicks = events.filter((e) => e.event_type === 'phone_click').length;
  const whatsappClicks = events.filter((e) => e.event_type === 'whatsapp_click').length;
  const formSubmits = events.filter((e) => e.event_type === 'form_submit').length;
  const pageViews = events.filter((e) => e.event_type === 'page_view').length;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Telefonate Cliccate
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{phoneClicks}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Clic sul numero di telefono</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Contatti WhatsApp
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{whatsappClicks}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Chat WhatsApp avviate</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Moduli Inviati
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formSubmits}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Richieste dal form Netlify</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Pagine Visitate
                </CardTitle>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{pageViews}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Visite anonime conformi privacy</p>
              </CardContent>
            </Card>
          </div>

          {/* Registro Ultimi Eventi */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Registro Interazioni Recenti
              </CardTitle>
              <CardDescription className="text-xs">
                Eventi anonimi registrati sul sito pubblico (chiamate, WhatsApp, invio modulo).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Data e Ora</th>
                      <th className="py-2.5 px-4">Tipo Evento</th>
                      <th className="py-2.5 px-4">Pagina</th>
                      <th className="py-2.5 px-4">Dettagli</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Nessun evento ancora registrato. Cliccando sui pulsanti di contatto sul sito gli eventi appariranno qui.
                        </td>
                      </tr>
                    ) : (
                      events.slice(0, 15).map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-4 text-slate-500">
                            {new Date(evt.created_at).toLocaleString('it-IT')}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {evt.event_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">{evt.page_path}</td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {JSON.stringify(evt.metadata || {})}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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