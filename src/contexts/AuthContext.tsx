import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  /** Valorizzato SOLO se l'utente è autenticato E presente nell'allow-list admin del database. */
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true solo in sviluppo locale senza chiavi Supabase (mai in produzione). */
  isMockAuth: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_MOCK_USER = 'srs_mock_auth_user';

/**
 * La modalità "login finto" esiste solo per lo sviluppo in locale (npm run dev).
 * In produzione, se mancano le chiavi Supabase, l'area admin resta CHIUSA:
 * prima accettava qualunque email e password.
 */
const MOCK_AUTH_ALLOWED = import.meta.env.DEV && !isSupabaseConfigured();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const IDLE_LOGOUT_MS = 30 * 60_000; // 30 minuti senza attività

/** Controlla nel database che l'utente sia nell'elenco amministratori (funzione SQL is_admin). */
async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Verifica admin non riuscita:', error.message);
      return false; // in caso di dubbio: accesso negato
    }
    return data === true;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [adminState, setAdminState] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [mockUser, setMockUser] = useState<User | null>(null);

  const failedAttempts = useRef(0);
  const lockedUntil = useRef(0);

  // 1) Sessione Supabase (o utente finto, solo in sviluppo locale)
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setSessionLoaded(true);
      });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setSessionLoaded(true);
      });
      return () => subscription.unsubscribe();
    }

    if (MOCK_AUTH_ALLOWED) {
      try {
        const saved = localStorage.getItem(LS_MOCK_USER);
        if (saved) setMockUser(JSON.parse(saved) as User);
      } catch {
        setMockUser(null);
      }
    } else {
      localStorage.removeItem(LS_MOCK_USER); // elimina eventuali residui di versioni precedenti
    }
    setSessionLoaded(true);
  }, []);

  // 2) Per ogni utente autenticato verifica l'autorizzazione admin (una volta per utente, non a ogni refresh del token)
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (!userId) {
      setAdminState('unknown');
      return;
    }
    let cancelled = false;
    setAdminState('unknown');
    checkIsAdmin().then((ok) => {
      if (cancelled) return;
      setAdminState(ok ? 'yes' : 'no');
      if (!ok) supabase.auth.signOut();
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LS_MOCK_USER);
    setMockUser(null);
    setSession(null);
    setAdminState('unknown');
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const now = Date.now();
    if (now < lockedUntil.current) {
      const secs = Math.ceil((lockedUntil.current - now) / 1000);
      return { error: new Error(`Troppi tentativi. Riprova tra ${secs} secondi.`) };
    }
    if (!email || !password) {
      return { error: new Error('Inserisci sia email che password.') };
    }

    const fail = (message: string) => {
      failedAttempts.current += 1;
      if (failedAttempts.current >= MAX_FAILED_ATTEMPTS) {
        lockedUntil.current = Date.now() + LOCKOUT_MS;
        failedAttempts.current = 0;
      }
      return { error: new Error(message) };
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return fail('Email o password non corretti.');

      // Autenticato non significa autorizzato: serve essere nell'elenco amministratori
      if (!(await checkIsAdmin())) {
        await supabase.auth.signOut();
        return fail('Questo account non è autorizzato ad accedere all’area amministrativa.');
      }
      failedAttempts.current = 0;
      return { error: null };
    }

    if (!MOCK_AUTH_ALLOWED) {
      return {
        error: new Error('Area amministrativa non configurata: mancano le chiavi del database. Contatta lo sviluppatore.'),
      };
    }

    // Solo sviluppo locale (npm run dev) senza chiavi Supabase
    const user = {
      id: 'mock-admin-user',
      email: email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { name: 'Amministratore' },
      aud: 'authenticated',
      role: 'authenticated',
    } as unknown as User;
    localStorage.setItem(LS_MOCK_USER, JSON.stringify(user));
    setMockUser(user);
    return { error: null };
  };

  const user: User | null = isSupabaseConfigured()
    ? adminState === 'yes'
      ? session?.user ?? null
      : null
    : MOCK_AUTH_ALLOWED
    ? mockUser
    : null;

  const loading = isSupabaseConfigured()
    ? !sessionLoaded || (!!session && adminState === 'unknown')
    : !sessionLoaded;

  // 3) Uscita automatica dopo 30 minuti di inattività (computer condivisi / dimenticati aperti)
  useEffect(() => {
    if (!user) return;
    let timer = window.setTimeout(() => void signOut(), IDLE_LOGOUT_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void signOut(), IDLE_LOGOUT_MS);
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, signOut]);

  const fakeSession =
    MOCK_AUTH_ALLOWED && mockUser
      ? ({ access_token: 'mock-token', token_type: 'bearer', expires_in: 3600, refresh_token: 'mock-refresh', user: mockUser } as Session)
      : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? (isSupabaseConfigured() ? session : fakeSession) : null,
        loading,
        isMockAuth: MOCK_AUTH_ALLOWED,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider");
  }
  return context;
};
