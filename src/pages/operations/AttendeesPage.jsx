import { useEffect, useState } from 'react';
import { Search, UsersRound } from 'lucide-react';
import { attendeeApi } from '../../services/api.js';

function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.resolve().then(() => attendeeApi.list({ limit: 100 })).then(({ data }) => { setAttendees(data.data.attendees); setPagination(data.data.pagination); }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load attendees.')).finally(() => setLoading(false));
  }, []);
  const filteredAttendees = attendees.filter((attendee) => `${attendee.firstName} ${attendee.lastName} ${attendee.email} ${attendee.company || ''} ${attendee.attendeeId}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Event audience</p><h1>Attendees</h1><p>Every completed attendee registration is saved here with its event pass and registration status.</p></div><section className="attendees-panel"><div className="attendees-toolbar"><div className="panel-heading"><div><p className="eyebrow">Attendee registry</p><h2>{pagination.total || 0} registered</h2></div></div><label className="search-field"><Search size={16} /><input placeholder="Search attendees" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>{loading ? <div className="empty-state">Loading attendees...</div> : error ? <p className="form-error" role="alert">{error}</p> : filteredAttendees.length ? <div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Attendee</th><th>Company</th><th>Event</th><th>Pass ID</th><th>Status</th><th>Registered</th></tr></thead><tbody>{filteredAttendees.map((attendee) => <tr key={attendee._id}><td><strong>{attendee.firstName} {attendee.lastName}</strong><span>{attendee.email}</span></td><td>{attendee.company || 'Not provided'}</td><td>{attendee.eventId?.name || 'TEXCELLENCE'}</td><td><code>{attendee.attendeeId}</code></td><td><span className={`event-status ${attendee.attendanceStatus.toLowerCase()}`}>{attendee.attendanceStatus.replace('_', ' ')}</span></td><td>{new Date(attendee.registrationDate || attendee.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty-state"><UsersRound size={22} /><h3>No attendees registered</h3><p>Completed registrations will appear here automatically.</p></div>}</section></div>;
}

export default AttendeesPage;