import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Contenitore di tutte le rotte /admin. Caricato in modo "lazy": il sito pubblico
 * non scarica né il client Supabase né il codice di autenticazione.
 */
const AdminShell = () => {
  // L'area riservata non deve comparire sui motori di ricerca
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default AdminShell;
