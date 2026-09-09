import { useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';
import { AuthContext } from './authContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('texcellence_token')));

  useEffect(() => {
    if (!localStorage.getItem('texcellence_token')) return undefined;
    authApi.me().then(({ data }) => setUser(data.data.user)).catch(() => localStorage.removeItem('texcellence_token')).finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, isLoading,
    setSession: ({ token, user: authenticatedUser }) => { localStorage.setItem('texcellence_token', token); setUser(authenticatedUser); },
    logout: () => { localStorage.removeItem('texcellence_token'); setUser(null); },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
