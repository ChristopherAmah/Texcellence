import { Plus } from 'lucide-react';

function ResourcePage({ title, icon: IconComponent }) {
  return <div className="resource-page"><div className="section-heading"><p className="eyebrow">Operations module</p><h1>{title}</h1><p>This workspace is ready for live event data. Its API table, filters, and actions will be connected as the module comes online.</p></div><section className="resource-empty"><div className="resource-empty-icon"><IconComponent size={25} /></div><h2>No {title.toLowerCase()} yet</h2><p>There is no data to display for this event.</p><button className="primary-action compact-action"><Plus size={17} /> Add {title.toLowerCase().slice(0, -1)}</button></section></div>;
}

export default ResourcePage;