import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { leadApi } from '../../services/api.js';

function LeadsPage() {
  const [leads, setLeads] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { Promise.resolve().then(() => leadApi.list()).then(({ data }) => setLeads(data.data.leads)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load leads.')).finally(() => setLoading(false)); }, []);
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Commercial qualification</p><h1>Leads</h1><p>Qualified leads are linked to the sponsor and attendee that created the opportunity.</p></div><section className="attendees-panel">{loading ? <div className="empty-state">Loading leads...</div> : error ? <p className="form-error">{error}</p> : leads.length ? <div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Lead</th><th>Sponsor</th><th>Attendee</th><th>Score</th><th>Grade</th><th>Status</th><th>Timeline</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id}><td><strong>{lead.leadId}</strong><span>{lead.interest?.join(', ') || 'General interest'}</span></td><td><strong>{lead.sponsorId?.name || 'Unknown'}</strong><span>{lead.sponsorId?.sponsorId}</span></td><td>{lead.attendeeId?.firstName} {lead.attendeeId?.lastName}<span>{lead.attendeeId?.company}</span></td><td><strong>{lead.leadScore}/100</strong></td><td><span className={`event-status ${lead.leadGrade.toLowerCase()}`}>{lead.leadGrade}</span></td><td>{lead.status}</td><td>{lead.buyingTimeline.replaceAll('_', ' ')}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Target size={22} /><h3>No leads qualified</h3><p>Leads appear when a sponsor explicitly qualifies an interaction.</p></div>}</section></div>;
}

export default LeadsPage;