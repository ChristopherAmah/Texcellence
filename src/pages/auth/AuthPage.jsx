import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { authApi } from '../../services/api.js';
import PasswordField from '../../components/PasswordField.jsx';
import logo from '../../assets/texcellence_logo.png';

function AuthPage() {
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try { const response = await authApi.login({ email: form.email.trim(), password: form.password }); setSession(response.data.data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to connect to TEXCELLENCE.'); }
    finally { setSubmitting(false); }
  };
  return <main className="app-shell auth-shell"><section className="brand-panel"><div className="brand-lockup"><img className="brand-logo" src={logo} alt="The TeXcellence Conference" /><span className="edition">2026</span></div><div className="brand-copy"><p className="eyebrow">Control room access</p><h1>Run every conversation with clarity.</h1><p>Sign in with an administrator account to manage TEXCELLENCE.</p></div><div className="brand-stat"><CalendarDays size={20} /><span>Tuesday, 13 October 2026, at the Landmark Event Centre, Lagos.</span></div></section><section className="auth-panel"><div className="auth-card"><p className="eyebrow">Administrator access</p><h2>Sign in to the control room</h2><form onSubmit={submit}><label>Email address<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></label><label>Password<PasswordField required value={form.password} onChange={(event) => update('password', event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" disabled={submitting}>{submitting ? 'Please wait...' : 'Sign in'}<ChevronRight size={18} /></button></form></div></section></main>;
}

export default AuthPage;
