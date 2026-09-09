import { useState } from 'react';
import { BarChart3, CalendarDays, ChartNoAxesCombined, ClipboardList, Handshake, LayoutDashboard, Plus, UsersRound } from 'lucide-react';
import OperationsDashboardPage from './OperationsDashboardPage.jsx';
import ResourcePage from './ResourcePage.jsx';
import EventManagementPage from './EventManagementPage.jsx';
import AttendeesPage from './AttendeesPage.jsx';
import SponsorsPage from './SponsorsPage.jsx';
import InteractionsPage from './InteractionsPage.jsx';
import LeadsPage from './LeadsPage.jsx';

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'attendees', label: 'Attendees', icon: UsersRound },
  { id: 'sponsors', label: 'Sponsors', icon: Handshake },
  { id: 'interactions', label: 'Interactions', icon: Plus },
  { id: 'leads', label: 'Leads', icon: ClipboardList },
  { id: 'meetings', label: 'Meetings', icon: Plus },
  { id: 'pipeline', label: 'Pipeline', icon: ChartNoAxesCombined },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

function OperationsPage({ user }) {
  const [activePage, setActivePage] = useState('dashboard');
  const activeNavigation = navigation.find((item) => item.id === activePage);
  return <div className="operations-layout"><aside className="operations-nav"><div className="operations-nav-heading"><p className="eyebrow">Control room</p><h2>Event workspace</h2></div><nav aria-label="Operations navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={activePage === id ? 'active' : ''} onClick={() => setActivePage(id)}><Icon size={17} />{label}</button>)}</nav><p className="operations-nav-note">{user.role.replace('_', ' ')} access</p></aside><section className="operations-content">{activePage === 'dashboard' ? <OperationsDashboardPage user={user} /> : activePage === 'events' ? <EventManagementPage /> : activePage === 'attendees' ? <AttendeesPage /> : activePage === 'sponsors' ? <SponsorsPage /> : activePage === 'interactions' ? <InteractionsPage /> : activePage === 'leads' ? <LeadsPage /> : <ResourcePage title={activeNavigation.label} icon={activeNavigation.icon} />}</section></div>;
}

export default OperationsPage;
