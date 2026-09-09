import { Check, QrCode, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function AttendeeDashboardPage({ attendee, onRefresh }) {
  const scanLink = `${window.location.origin}/scan/${encodeURIComponent(attendee.qrCodeValue)}`;
  return <div className="workspace"><div className="section-heading"><p className="eyebrow">Attendee portal</p><h1>Your event pass is ready.</h1><p>Keep this QR code available at the event. It opens a secure sponsor interaction form without exposing your personal details.</p></div><div className="attendee-layout"><section className="qr-panel"><div className="qr-frame"><QRCodeSVG value={scanLink} size={220} includeMargin /></div><p className="qr-label">{attendee.attendeeId}</p><span className="status-pill"><Check size={14} /> Registered</span></section><section className="profile-panel"><div className="panel-title"><UserRound size={20} /><h2>Profile</h2></div><dl><div><dt>Name</dt><dd>{attendee.firstName} {attendee.lastName}</dd></div><div><dt>Company</dt><dd>{attendee.company || 'Not provided'}</dd></div><div><dt>Role</dt><dd>{attendee.jobTitle || 'Not provided'}</dd></div><div><dt>Event</dt><dd>{attendee.eventId?.name || 'TEXCELLENCE 2026'}</dd></div><div><dt>Lead sharing</dt><dd>{attendee.leadSharingConsent ? 'Consent given' : 'Private by default'}</dd></div></dl><button className="secondary-action" onClick={onRefresh}><QrCode size={17} /> Refresh pass</button></section></div></div>;
}

export default AttendeeDashboardPage;
