import React, { useState } from 'react';
import {
  Settings,
  Download,
  Database,
  ShieldCheck,
  Key,
  HardDrive,
  Copy,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { exportAllDataJSON, exportMonthlyDataCSV } from '@/lib/admin-api';

export const AdminSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isCloudActive = isSupabaseConfigured();

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const json = await exportAllDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `san_raffaele_backup_completo_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Backup JSON completo esportato con successo!');
    } catch {
      toast.error('Errore durante l\'export.');
    } finally {
      setIsExporting(false);
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
      toast.success('CSV esportato con successo!');
    } catch {
      toast.error('Errore durante l\'export CSV.');
    }
  };

  const sqlFileInstructions = `supabase/migrations/20261019_initial_schema.sql`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Impostazioni & Backup Dati
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configurazione del sistema, verifica stato del database Supabase ed esportazione dati di sicurezza.
          </p>
        </div>
      </div>

      {/* Export Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold text-slate-900">
              Esportazione e Backup Dati (Requisito F1.20)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Scarica in qualunque momento una copia completa di tutti i dati registrati per conservazione autonoma e trasparenza.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Backup Completo (JSON)</h3>
                  <p className="text-[11px] text-slate-500">
                    Include: 3 appartamenti, tariffe giornaliere, disponibilità, storico prezzi, dati mensili, eventi e note riservate.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportJSON}
                disabled={isExporting}
                size="sm"
                className="w-full gap-1.5 font-semibold text-xs"
              >
                <Download className="h-4 w-4" />
                Scarica Backup JSON
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Dati Mensili (CSV / Excel)</h3>
                  <p className="text-[11px] text-slate-500">
                    Tabella compatibile con Microsoft Excel e Google Fogli con percentuali di occupazione e tariffe medie.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 font-semibold text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="h-4 w-4" />
                Scarica Foglio CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
