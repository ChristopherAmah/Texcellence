import { useEffect, useState } from 'react';
import { Printer, Search, UsersRound, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { attendeeApi } from '../../services/api.js';

function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [cardError, setCardError] = useState('');
  useEffect(() => {
    Promise.resolve().then(() => attendeeApi.list({ limit: 100 })).then(({ data }) => { setAttendees(data.data.attendees); setPagination(data.data.pagination); }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load attendees.')).finally(() => setLoading(false));
  }, []);
  const filteredAttendees = attendees.filter((attendee) => `${attendee.firstName} ${attendee.lastName} ${attendee.email} ${attendee.company || ''} ${attendee.attendeeId}`.toLowerCase().includes(search.toLowerCase()));
  const openCard = (attendee) => { setCardError(''); setSelected(null); attendeeApi.getById(attendee.attendeeId).then(({ data }) => setSelected(data.data.attendee)).catch((requestError) => setCardError(requestError.response?.data?.message || 'Unable to load attendee details.')); };
  const closeCard = () => { setSelected(null); setCardError(''); };
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Event audience</p><h1>Attendees</h1><p>Every completed attendee registration is saved here with its event pass and registration status. Click a row to view and print their ID card.</p></div><section className="attendees-panel"><div className="attendees-toolbar"><div className="panel-heading"><div><p className="eyebrow">Attendee registry</p><h2>{pagination.total || 0} registered</h2></div></div><label className="search-field"><Search size={16} /><input placeholder="Search attendees" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>{loading ? <div className="empty-state">Loading attendees...</div> : error ? <p className="form-error" role="alert">{error}</p> : filteredAttendees.length ? <div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Attendee</th><th>Company</th><th>Event</th><th>Pass ID</th><th>Status</th><th>Registered</th></tr></thead><tbody>{filteredAttendees.map((attendee) => <tr key={attendee._id} className="attendee-row" onClick={() => openCard(attendee)}><td><strong>{attendee.firstName} {attendee.lastName}</strong><span>{attendee.email}</span></td><td>{attendee.company || 'Not provided'}</td><td>{attendee.eventId?.name || 'TEXCELLENCE'}</td><td><code>{attendee.attendeeId}</code></td><td><span className={`event-status ${attendee.attendanceStatus.toLowerCase()}`}>{attendee.attendanceStatus.replace('_', ' ')}</span></td><td>{new Date(attendee.registrationDate || attendee.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty-state"><UsersRound size={22} /><h3>No attendees registered</h3><p>Completed registrations will appear here automatically.</p></div>}</section>
    {(selected || cardError) && <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => { if (event.target === event.currentTarget) closeCard(); }}>
      <div className="id-card-shell">
        <div className="id-card-toolbar no-print"><button type="button" className="icon-button" aria-label="Close" onClick={closeCard}><X size={18} /></button>{selected && <button type="button" className="primary-action compact-action" onClick={() => window.print()}><Printer size={17} />Print ID card</button>}</div>
        {cardError && <p className="form-error" role="alert">{cardError}</p>}
        {selected && <article className="id-card">
          <div className="id-card-header"><span className="eyebrow">{selected.eventId?.name || 'TEXCELLENCE'} {selected.eventId?.year || ''}</span><h2>Event Pass</h2></div>
          <div className="id-card-body">
            <div className="id-card-avatar">{selected.firstName?.[0]}{selected.lastName?.[0]}</div>
            <h3>{selected.firstName} {selected.lastName}</h3>
            <p>{selected.jobTitle || 'Attendee'}{selected.company ? ` · ${selected.company}` : ''}</p>
            <span className={`event-status ${selected.attendeeType?.toLowerCase()}`}>{selected.attendeeType?.replace('_', ' ')}</span>
          </div>
          <div className="id-card-qr"><QRCodeSVG value={`${window.location.origin}/scan/${encodeURIComponent(selected.qrCodeValue || selected.attendeeId)}`} size={140} includeMargin /></div>
          <p className="id-card-id">{selected.attendeeId}</p>
        </article>}
      </div>
    </div>}
  </div>;
}

export default AttendeesPage;