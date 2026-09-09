import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function HomePage() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'ATTENDEE' ? '/attendee' : '/operations'} replace />;
}

export default HomePage;
