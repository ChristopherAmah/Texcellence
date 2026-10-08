import { zipSync, strToU8 } from 'fflate';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

const csvValue = (value) => {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

const filePart = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const attendeeExportRow = (attendee, qrUrl, qrFile) => [
  attendee.attendeeId,
  attendee.firstName,
  attendee.lastName,
  attendee.email,
  attendee.phone,
  attendee.jobTitle,
  attendee.company,
  attendee.industry,
  attendee.companySize,
  attendee.country,
  attendee.city,
  attendee.attendeeType,
  attendee.attendanceStatus,
  attendee.eventId?.name,
  attendee.eventId?.year,
  attendee.registrationDate || attendee.createdAt ? new Date(attendee.registrationDate || attendee.createdAt).toISOString() : '',
  attendee.consent ? 'Yes' : 'No',
  attendee.leadSharingConsent ? 'Yes' : 'No',
  qrUrl,
  qrFile,
];

const headers = [
  'Pass ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Company', 'Industry',
  'Company Size', 'Country', 'City', 'Attendee Type', 'Attendance Status', 'Event', 'Event Year',
  'Registration Date', 'Consent', 'Lead Sharing Consent', 'QR Scan URL', 'QR File',
];

export const exportAttendeesArchive = (attendees, origin = window.location.origin) => {
  if (!attendees.length) throw new Error('There are no attendees to export.');

  const baseUrl = origin.replace(/\/$/, '');
  const files = {};
  const rows = [headers];

  attendees.forEach((attendee) => {
    const qrUrl = `${baseUrl}/scan/${encodeURIComponent(attendee.attendeeId)}`;
    const name = filePart(`${attendee.firstName}-${attendee.lastName}`) || 'attendee';
    const qrFile = `qr-codes/${attendee.attendeeId}-${name}.svg`;
    const svg = renderToStaticMarkup(createElement(QRCodeSVG, { value: qrUrl, size: 512, includeMargin: true, level: 'M' }));

    files[qrFile] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);
    rows.push(attendeeExportRow(attendee, qrUrl, qrFile));
  });

  const csv = `\uFEFF${rows.map((row) => row.map(csvValue).join(',')).join('\r\n')}\r\n`;
  files['attendees.csv'] = strToU8(csv);

  const archive = zipSync(files, { level: 6 });
  const url = URL.createObjectURL(new Blob([archive], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `texcellence-attendees-${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  URL.revokeObjectURL(url);
};
