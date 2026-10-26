import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: { pathname?: string } } | null;
  const from = locationState?.from?.pathname || '/admin';
  const hasSupabase = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message || 'Credenziali non valide. Riprova.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Si è verificato un errore inatteso.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to site link */}
        <div className="mb-6 flex justify-between items-center text-sm">
          <a
            href="/"
            className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al sito pubblico
          </a>
          <span className="text-slate-400 text-xs">Area Riservata</span>
        </div>

        <Card className="border-slate-800/80 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg mb-2">
              ASR
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Amici del San Raffaele
            </CardTitle>
            <CardDescription className="text-slate-500">
              Accesso riservato al proprietario per la gestione di calendari, tariffe e statistiche.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!hasSupabase && import.meta.env.DEV && (
              <Alert className="mb-5 bg-amber-50 border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <strong>Solo sviluppo locale:</strong> senza chiavi Supabase in <code>.env</code> il login è simulato.
                  Questa modalità è disattivata nel sito pubblicato.
                </AlertDescription>
              </Alert>
            )}

            {!hasSupabase && !import.meta.env.DEV && (
              <Alert variant="destructive" className="mb-5 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Area amministrativa non configurata: mancano le chiavi del database nella pubblicazione del sito.
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive" className="mb-5 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Amministratore
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tua-email@esempio.it" autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 border-slate-200 focus-visible:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10 border-slate-200 focus-visible:ring-primary"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold shadow-md mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticazione in corso...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-1.5 justify-center">
                    <ShieldCheck className="h-4 w-4" />
                    Accedi all'Area Riservata
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 pb-6 text-center text-[11px] text-slate-400 justify-center border-t border-slate-100">
            Protezione tramite crittografia end-to-end e Row Level Security (RLS)
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
