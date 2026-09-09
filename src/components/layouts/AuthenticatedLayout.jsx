import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import AppShell from './AppShell.jsx';

function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <AppShell user={user} logout={logout}><Outlet /></AppShell>;
}

export default AuthenticatedLayout;
