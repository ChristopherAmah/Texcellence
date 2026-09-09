import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import AuthenticatedLayout from './components/layouts/AuthenticatedLayout.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import AttendeePortalPage from './pages/attendee/AttendeePortalPage.jsx';
import HomePage from './pages/HomePage.jsx';
import OperationsPage from './pages/operations/OperationsPage.jsx';
import ScanInteractionPage from './pages/sponsor/ScanInteractionPage.jsx';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <main className="app-loading">Loading TEXCELLENCE...</main>;

  return <Routes>
    <Route path="/scan/:attendeeId" element={<ScanInteractionPage />} />
    <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
    {user ? <Route element={<AuthenticatedLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/attendee" element={user.role === 'ATTENDEE' ? <AttendeePortalPage /> : <Navigate to="/operations" replace />} />
      <Route path="/operations/*" element={user.role !== 'ATTENDEE' ? <OperationsPage user={user} /> : <Navigate to="/attendee" replace />} />
    </Route> : <Route path="*" element={<Navigate to="/auth" replace />} />}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default App;
