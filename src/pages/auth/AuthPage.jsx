import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { authApi } from '../../services/api.js';
import logo from '../../assets/texcellence_logo.png';

function AuthPage() {
  const { setSession } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try { const credentials = { ...form, email: form.email.trim() }; const response = mode === 'login' ? await authApi.login({ email: credentials.email, password: credentials.password }) : await authApi.register(credentials); setSession(response.data.data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to connect to TEXCELLENCE.'); }
    finally { setSubmitting(false); }
  };
  return <main className="app-shell auth-shell"><section className="brand-panel"><div className="brand-lockup"><img className="brand-logo" src={logo} alt="The TeXcellence Conference" /><span className="edition">2026</span></div><div className="brand-copy"><p className="eyebrow">Event engagement platform</p><h1>Every conversation should lead somewhere.</h1><p>Bring attendee engagement, sponsor value, and commercial outcomes into one measured event experience.</p></div><div className="brand-stat"><CalendarDays size={20} /><span>Registration, engagement, lead capture, and ROI.</span></div></section><section className="auth-panel"><div className="auth-card"><p className="eyebrow">Secure access</p><h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create attendee account'}</h2><div className="mode-toggle" role="group" aria-label="Authentication mode"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div><form onSubmit={submit}>{mode === 'register' && <div className="name-fields"><label>First name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></label><label>Last name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></label></div>}<label>Email address<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></label><label>Password<input type="password" required minLength={mode === 'register' ? 12 : undefined} value={form.password} onChange={(event) => update('password', event.target.value)} /></label>{mode === 'register' && <p className="field-note">Use at least 12 characters.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<ChevronRight size={18} /></button></form></div></section></main>;
}

export default AuthPage;
