import { AuthGuard } from './AuthGuard';
import { AdminLayout } from './AdminLayout';

/** Area protetta: nessun contenuto admin viene mostrato senza utente autorizzato. */
const AdminArea = () => (
  <AuthGuard>
    <AdminLayout />
  </AuthGuard>
);

export default AdminArea;
