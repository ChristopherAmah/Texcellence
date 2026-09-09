import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { interactionAdminApi } from '../../services/api.js';

function InteractionsPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { Promise.resolve().then(() => interactionAdminApi.list()).then(({ data }) => setItems(data.data.interactions)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load interactions.')).finally(() => setLoading(false)); }, []);
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Engagement records</p><h1>Interactions</h1><p>Every sponsor conversation is stored with its attendee, sponsor, qualification answers, and engagement score.</p></div><section className="attendees-panel">{loading ? <div className="empty-state">Loading interactions...</div> : error ? <p className="form-error">{error}</p> : items.length ? <div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Attendee</th><th>Sponsor</th><th>Interest</th><th>Lead quality</th><th>Score points</th><th>Next action</th><th>Recorded</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><strong>{item.attendeeId?.firstName} {item.attendeeId?.lastName}</strong><span>{item.attendeeId?.attendeeId}</span></td><td><strong>{item.sponsorId?.name || 'Unknown'}</strong><span>{item.sponsorId?.sponsorId}</span></td><td>{item.interestLevel}</td><td><span className={`event-status ${item.leadQuality.toLowerCase()}`}>{item.leadQuality}</span></td><td>{item.engagementPoints}</td><td>{item.nextAction.replace('_', ' ')}</td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Activity size={22} /><h3>No interactions recorded</h3><p>Submitted sponsor forms will appear here.</p></div>}</section></div>;
}

export default InteractionsPage;