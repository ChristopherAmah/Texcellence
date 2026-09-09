import { useEffect, useState } from 'react';
import { Handshake, Plus, Trash2 } from 'lucide-react';
import { eventApi, sponsorApi } from '../../services/api.js';

const blankSponsor = { eventId: '', name: '', package: 'OTHER', boothNumber: '', status: 'PENDING' };

function SponsorsPage() {
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [form, setForm] = useState(blankSponsor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const load = () => {
    setLoading(true);
    Promise.all([eventApi.list(), sponsorApi.list()]).then(([eventResponse, sponsorResponse]) => {
      setEvents(eventResponse.data.data.events);
      setSponsors(sponsorResponse.data.data.sponsors);
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load sponsors.')).finally(() => setLoading(false));
  };
  useEffect(() => { Promise.resolve().then(load); }, []);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      await sponsorApi.create(form);
      setMessage('Sponsor created successfully.');
      setForm(blankSponsor);
      load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create sponsor.'); }
    finally { setSaving(false); }
  };
  const remove = async (sponsor) => { if (!window.confirm(`Delete ${sponsor.name}?`)) return; setError(''); try { await sponsorApi.remove(sponsor.sponsorId); setMessage('Sponsor deleted successfully.'); load(); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete sponsor.'); } };
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Partner management</p><h1>Sponsors</h1><p>Create sponsor records and connect each partner to an event.</p></div><div className="sponsor-management-grid"><form className="registration-form event-form" onSubmit={submit}><div className="panel-heading"><div><p className="eyebrow">New sponsor</p><h2>Sponsor details</h2></div><Handshake size={22} /></div><label>Event<select required value={form.eventId} onChange={(event) => update('eventId', event.target.value)}><option value="">Select an event</option>{events.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.year}</option>)}</select></label><div className="form-grid"><label>Company name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Package<select value={form.package} onChange={(event) => update('package', event.target.value)}><option value="GOLD">Gold</option><option value="PLATINUM">Platinum</option><option value="OTHER">Other</option></select></label><label>Booth number<input value={form.boothNumber} onChange={(event) => update('boothNumber', event.target.value)} /></label><label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option></select></label></div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="success-message" role="status">{message}</p>}<button className="primary-action compact-action" disabled={saving || loading || !events.length}>{saving ? 'Creating sponsor...' : 'Create sponsor'}<Plus size={17} /></button></form><section className="event-list-panel"><div className="panel-heading"><div><p className="eyebrow">Sponsor registry</p><h2>{sponsors.length} sponsors</h2></div></div>{loading ? <div className="empty-state">Loading sponsors...</div> : sponsors.length ? <div className="event-list">{sponsors.map((sponsor) => <article key={sponsor._id}><div><strong>{sponsor.name}</strong><span>{sponsor.sponsorId} · {sponsor.eventId?.name || 'Event'} · {sponsor.package}</span></div><div className="event-list-actions"><span className={`event-status ${sponsor.status.toLowerCase()}`}>{sponsor.status}</span><button className="icon-button" title={`Delete ${sponsor.name}`} aria-label={`Delete ${sponsor.name}`} onClick={() => remove(sponsor)}><Trash2 size={16} /></button></div></article>)}</div> : <div className="empty-state"><Handshake size={22} /><h3>No sponsors configured</h3><p>Create the first sponsor for this event.</p></div>}</section></div></div>;
}

export default SponsorsPage;
