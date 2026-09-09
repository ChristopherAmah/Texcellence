import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarCheck, CircleDollarSign, Handshake, Target, UsersRound } from 'lucide-react';
import { analyticsApi } from '../../services/api.js';

function OperationsDashboardPage({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { Promise.resolve().then(() => analyticsApi.executive()).then(({ data }) => setAnalytics(data.data)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load overview data.')); }, []);
  if (error) return <div className="workspace"><p className="form-error" role="alert">{error}</p></div>;
  if (!analytics) return <div className="loading-state">Loading event overview...</div>;
  const { metrics } = analytics;
  const cards = [
    { label: 'Registered attendees', value: metrics.attendees, detail: `${analytics.events} event${analytics.events === 1 ? '' : 's'} configured`, icon: UsersRound },
    { label: 'Sponsors', value: metrics.sponsors, detail: 'Partners configured', icon: Handshake },
    { label: 'Sponsor interactions', value: metrics.interactions, detail: `${metrics.qualifiedLeads} qualified lead${metrics.qualifiedLeads === 1 ? '' : 's'}`, icon: Target },
    { label: 'Pipeline value', value: `₦${metrics.pipeline.toLocaleString()}`, detail: 'Awaiting opportunities', icon: CircleDollarSign },
  ];
  return <div className="operations-dashboard"><div className="section-heading"><p className="eyebrow">{user.role.replace('_', ' ')}</p><h1>Event operations, at a glance.</h1><p>Track the journey from attendee engagement to commercial impact in one workspace.</p></div><div className="metric-grid">{cards.map(({ label, value, detail, icon: Icon }) => <article className="metric-card" key={label}><div className="metric-icon"><Icon size={19} /></div><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>)}</div><div className="dashboard-lower-grid"><section className="activity-panel"><div className="panel-heading"><div><p className="eyebrow">Live feed</p><h2>Recent activity</h2></div><ArrowUpRight size={19} /></div><div className="empty-state"><div className="empty-state-mark"><CalendarCheck size={21} /></div><h3>No activity recorded</h3><p>Interactions, registrations, and meetings will appear here as your event gets moving.</p></div></section><section className="funnel-panel"><div className="panel-heading"><div><p className="eyebrow">Commercial journey</p><h2>Conversion funnel</h2></div></div><div className="funnel-list"><div><span>Interactions</span><strong>{metrics.interactions}</strong></div><div><span>Qualified leads</span><strong>{metrics.qualifiedLeads}</strong></div><div><span>Meetings</span><strong>{metrics.meetings}</strong></div><div><span>Opportunities</span><strong>{metrics.opportunities}</strong></div></div></section></div></div>;
}

export default OperationsDashboardPage;