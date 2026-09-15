import { useEffect, useState } from 'react';
import { CalendarPlus, Check, Pencil, Plus, Save, X } from 'lucide-react';
import { eventApi } from '../../services/api.js';

const blankEvent = { name: 'TEXCELLENCE', year: new Date().getFullYear(), startDate: '', startTime: '', endDate: '', endTime: '', venue: '', status: 'REGISTRATION_OPEN' };

function EventManagementPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(blankEvent);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const loadEvents = () => { setLoading(true); eventApi.list().then(({ data }) => setEvents(data.data.events)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load events.')).finally(() => setLoading(false)); };
  useEffect(() => { Promise.resolve().then(loadEvents); }, []);
  const resetForm = () => { setForm(blankEvent); setEditingId(null); };
  const editEvent = (event) => { const start = event.startDate ? new Date(event.startDate) : null; const end = event.endDate ? new Date(event.endDate) : null; const dateValue = (value) => value ? value.toISOString().slice(0, 10) : ''; const timeValue = (value) => value ? value.toISOString().slice(11, 16) : ''; setForm({ name: event.name, year: event.year, startDate: dateValue(start), startTime: timeValue(start), endDate: dateValue(end), endTime: timeValue(end), venue: event.venue, status: event.status }); };
  const openCreateModal = () => { resetForm(); setError(''); setShowModal(true); };
  const openEditModal = (event) => { setEditingId(event._id); editEvent(event); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); resetForm(); setError(''); };
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); setMessage(''); const payload = { ...form, year: Number(form.year) }; delete payload.startTime; delete payload.endTime; payload.startDate = new Date(`${form.startDate}T${form.startTime}`).toISOString(); if (form.endDate && form.endTime) payload.endDate = new Date(`${form.endDate}T${form.endTime}`).toISOString(); else delete payload.endDate; try { if (editingId) await eventApi.update(editingId, payload); else await eventApi.create(payload); setMessage(editingId ? 'Event updated.' : 'TEXCELLENCE event created.'); resetForm(); setShowModal(false); loadEvents(); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save event.'); } finally { setSaving(false); } };
  return <div className="resource-page">
    <div className="section-heading"><p className="eyebrow">Admin setup</p><h1>Events</h1><p>Create the TEXCELLENCE event once, then open registration for every attendee from this workspace.</p></div>
    <section className="event-list-panel">
      <div className="panel-heading"><div><p className="eyebrow">Event registry</p><h2>Configured events</h2></div><button type="button" className="primary-action compact-action" onClick={openCreateModal}><Plus size={18} />Add event</button></div>
      {message && <p className="success-message" role="status"><Check size={16} />{message}</p>}
      {error && !showModal && <p className="form-error" role="alert">{error}</p>}
      {loading ? <div className="empty-state">Loading events...</div> : events.length ? <div className="event-list">{events.map((event) => <article key={event._id}><div><strong>{event.name}</strong><span>{event.year} · {event.venue}</span></div><div className="event-list-actions"><span className={`event-status ${event.status.toLowerCase()}`}>{event.status.replace('_', ' ')}</span><button className="icon-button" title={`Edit ${event.name}`} aria-label={`Edit ${event.name}`} onClick={() => openEditModal(event)}><Pencil size={16} /></button></div></article>)}</div> : <div className="empty-state"><CalendarPlus size={22} /><h3>No events configured</h3><p>Create TEXCELLENCE to open attendee registration.</p></div>}
    </section>
    {showModal && <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <form className="registration-form event-form modal-panel" onSubmit={submit}>
        <div className="panel-heading"><div><p className="eyebrow">{editingId ? 'Edit event' : 'New event'}</p><h2>{editingId ? 'Update event details' : 'Create TEXCELLENCE'}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={closeModal}><X size={18} /></button></div>
        <label>Event name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
        <div className="form-grid">
          <label>Year<input required type="number" min="2000" max="2100" value={form.year} onChange={(event) => update('year', event.target.value)} /></label>
          <label>Venue<input required value={form.venue} onChange={(event) => update('venue', event.target.value)} /></label>
          <label>Start date<input required type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} /></label>
          <label>Start time<input required type="time" value={form.startTime} onChange={(event) => update('startTime', event.target.value)} /></label>
          <label>End date <span className="field-note">Optional</span><input type="date" value={form.endDate} onChange={(event) => update('endDate', event.target.value)} /></label>
          <label>End time <span className="field-note">Optional</span><input type="time" value={form.endTime} onChange={(event) => update('endTime', event.target.value)} /></label>
        </div>
        <label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}><option value="DRAFT">Draft</option><option value="REGISTRATION_OPEN">Registration open</option><option value="LIVE">Live</option><option value="COMPLETED">Completed</option></select></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="event-form-actions"><button className="primary-action compact-action" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save event' : 'Create event'}{editingId ? <Save size={17} /> : <CalendarPlus size={17} />}</button><button type="button" className="secondary-action" onClick={closeModal}>Cancel</button></div>
      </form>
    </div>}
  </div>;
}

export default EventManagementPage;