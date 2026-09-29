import { KeyRound, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordField from '../../components/PasswordField.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { authApi } from '../../services/api.js';

function ChangePasswordPage() {
  const { logout, setSession, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) { setError('The new passwords do not match.'); return; }
    setSaving(true);
    try {
      const response = await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSession(response.data.data);
      navigate('/operations', { replace: true });
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to change your password.'); }
    finally { setSaving(false); }
  };

  return <main className="password-change-page"><form className="registration-form password-change-card" onSubmit={submit}>
    <div className="password-change-icon"><KeyRound size={22} /></div>
    <p className="eyebrow">First login</p>
    <h1>Create your private password</h1>
    <p className="password-change-intro">Welcome, {user.firstName}. The password provided by your administrator is temporary. Change it before entering the control room.</p>
    <label>Temporary password<PasswordField required value={form.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} autoComplete="current-password" /></label>
    <label>New password<PasswordField required minLength={12} value={form.newPassword} onChange={(event) => update('newPassword', event.target.value)} autoComplete="new-password" /></label>
    <label>Confirm new password<PasswordField required minLength={12} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} autoComplete="new-password" /></label>
    <p className="field-note">Use at least 12 characters and choose a password different from the temporary one.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="event-form-actions"><button className="primary-action" disabled={saving}>{saving ? 'Changing password...' : 'Change password'}<KeyRound size={17} /></button><button type="button" className="secondary-action" onClick={logout}><LogOut size={17} />Sign out</button></div>
  </form></main>;
}

export default ChangePasswordPage;
