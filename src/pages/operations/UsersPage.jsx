import { useEffect, useState } from 'react';
import { Check, Plus, ShieldPlus, Trash2, UserCog, X } from 'lucide-react';
import { userApi } from '../../services/api.js';
import PasswordField from '../../components/PasswordField.jsx';

const blankForm = { firstName: '', lastName: '', email: '', password: '', role: 'ADMIN' };

function UsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const hasSuperadmin = users.some((account) => account.role === 'SUPERADMIN');
  const isBootstrap = user.role !== 'SUPERADMIN' && !hasSuperadmin;
  const canCreate = user.role === 'SUPERADMIN' || (isBootstrap && !loading);
  const allowedRoles = user.role === 'SUPERADMIN' ? ['ADMIN', 'SUPERADMIN'] : ['SUPERADMIN'];
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const loadUsers = () => { setLoading(true); userApi.list().then(({ data }) => setUsers(data.data.users)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load users.')).finally(() => setLoading(false)); };
  useEffect(() => { Promise.resolve().then(loadUsers); }, []);
  useEffect(() => { if (!allowedRoles.includes(form.role)) update('role', allowedRoles[0]); }, [allowedRoles.join(',')]);
  useEffect(() => { if (isBootstrap) setShowModal(true); }, [isBootstrap]);
  const closeModal = () => { setShowModal(false); setForm(blankForm); setError(''); };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try { await userApi.create({ ...form, email: form.email.trim() }); setMessage(`${form.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'} account created.`); setForm(blankForm); setShowModal(false); loadUsers(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create user.'); }
    finally { setSaving(false); }
  };
  const deleteAccount = async (account) => {
    if (!window.confirm(`Delete the ${account.role.toLowerCase()} account for ${account.firstName} ${account.lastName}?`)) return;
    setDeletingId(account._id); setError(''); setMessage('');
    try { await userApi.remove(account._id); setMessage('Account deleted.'); loadUsers(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete user.'); }
    finally { setDeletingId(null); }
  };
  const changeRole = async (account, role) => {
    if (role === account.role) return;
    setUpdatingRoleId(account._id); setError(''); setMessage('');
    try { await userApi.updateRole(account._id, role); setMessage(`${account.firstName} ${account.lastName} is now ${role.toLowerCase()}.`); loadUsers(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to change role.'); }
    finally { setUpdatingRoleId(null); }
  };
  return <div className="resource-page">
    <div className="section-heading"><p className="eyebrow">Access control</p><h1>Users</h1><p>Every account with access to the control room, and who created it.</p></div>
    <section className="attendees-panel">
      <div className="panel-heading"><div><p className="eyebrow">Directory</p><h2>{users.length} account{users.length === 1 ? '' : 's'}</h2></div>{canCreate && <button type="button" className="primary-action compact-action" onClick={() => setShowModal(true)}><Plus size={18} />Add user</button>}</div>
      {message && <p className="success-message" role="status"><Check size={16} />{message}</p>}
      {error && !showModal && <p className="form-error" role="alert">{error}</p>}
      {loading ? <div className="empty-state">Loading users...</div> : users.length ? <div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Created</th>{user.role === 'SUPERADMIN' && <th>Actions</th>}</tr></thead><tbody>{users.map((account) => <tr key={account._id}><td><strong>{account.firstName} {account.lastName}</strong></td><td>{account.email}</td><td>{user.role === 'SUPERADMIN' && ['ADMIN', 'SUPERADMIN'].includes(account.role) ? <select value={account.role} disabled={updatingRoleId === account._id} onChange={(event) => changeRole(account, event.target.value)}><option value="ADMIN">Admin</option><option value="SUPERADMIN">Superadmin</option></select> : <span className={`event-status ${account.role.toLowerCase()}`}>{account.role.replace('_', ' ')}</span>}</td><td>{account.isActive ? 'Active' : 'Inactive'}</td><td>{new Date(account.createdAt).toLocaleDateString()}</td>{user.role === 'SUPERADMIN' && <td>{String(account._id) !== user.id && <button type="button" className="icon-button" title={`Delete ${account.firstName} ${account.lastName}`} aria-label={`Delete ${account.firstName} ${account.lastName}`} disabled={deletingId === account._id} onClick={() => deleteAccount(account)}><Trash2 size={16} /></button>}</td>}</tr>)}</tbody></table></div> : <div className="empty-state"><UserCog size={22} /><h3>No users found</h3><p>Created accounts will appear here.</p></div>}
    </section>
    {showModal && <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => { if (event.target === event.currentTarget && !isBootstrap) closeModal(); }}>
      <form className="registration-form event-form modal-panel" onSubmit={submit}>
        <div className="panel-heading"><div><p className="eyebrow">{isBootstrap ? 'One-time setup' : 'New account'}</p><h2>{isBootstrap ? 'Create the first superadmin' : 'Create admin or superadmin'}</h2></div>{isBootstrap ? <ShieldPlus size={22} /> : <button type="button" className="icon-button" aria-label="Close" onClick={closeModal}><X size={18} /></button>}</div>
        {isBootstrap && <p className="field-note">No superadmin exists yet, so this account can be created once. Afterwards only superadmins can add admins or superadmins.</p>}
        <div className="form-grid">
          <label>First name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></label>
          <label>Last name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></label>
        </div>
        <label>Username (email)<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label>Password<PasswordField required minLength={12} value={form.password} onChange={(event) => update('password', event.target.value)} /></label>
        <p className="field-note">Use at least 12 characters.</p>
        {allowedRoles.length > 1 ? <label>Role<select value={form.role} onChange={(event) => update('role', event.target.value)}><option value="ADMIN">Admin</option><option value="SUPERADMIN">Superadmin</option></select></label> : <input type="hidden" value={form.role} readOnly />}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-action" disabled={saving}>{saving ? 'Please wait...' : 'Create account'}</button>
      </form>
    </div>}
  </div>;
}

export default UsersPage;
