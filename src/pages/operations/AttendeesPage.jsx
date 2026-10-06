import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Printer, Search, Upload, UsersRound, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { attendeeApi, eventApi } from '../../services/api.js';
import { downloadAttendeeTemplate, parseAttendeeFile } from '../../utils/attendeeSpreadsheet.js';

function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [cardError, setCardError] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [eventId, setEventId] = useState('');
  const [importRows, setImportRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true); setError('');
      attendeeApi.list({ page, limit: 50, search: search.trim() })
        .then(({ data }) => { if (active) { setAttendees(data.data.attendees); setPagination(data.data.pagination); } })
        .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load attendees.'); })
        .finally(() => { if (active) setLoading(false); });
    }, search.trim() ? 300 : 0);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [page, search, refreshKey]);

  useEffect(() => {
    eventApi.list({ limit: 100 }).then(({ data }) => {
      const availableEvents = data.data.events;
      setEvents(availableEvents);
      const preferred = availableEvents.find((item) => ['REGISTRATION_OPEN', 'LIVE'].includes(item.status)) || availableEvents[0];
      if (preferred) setEventId(preferred._id);
    }).catch(() => {});
  }, []);

  const openCard = (attendee) => { setCardError(''); setSelected(null); attendeeApi.getById(attendee.attendeeId).then(({ data }) => setSelected(data.data.attendee)).catch((requestError) => setCardError(requestError.response?.data?.message || 'Unable to load attendee details.')); };
  const closeCard = () => { setSelected(null); setCardError(''); };
  const closeImport = () => { if (importing) return; setShowImport(false); setImportRows([]); setFileName(''); setImportError(''); setImportResult(null); };
  const chooseWorkbook = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImportError(''); setImportResult(null); setImportRows([]); setFileName(file.name);
    try { setImportRows(await parseAttendeeFile(file)); } catch (parseError) { setImportError(parseError.message || 'Unable to read this spreadsheet.'); }
  };
  const submitImport = async (event) => {
    event.preventDefault(); setImporting(true); setImportError(''); setImportResult(null);
    try {
      const response = await attendeeApi.import({ eventId, attendees: importRows });
      setImportResult(response.data.data);
      if (response.data.data.summary.imported || response.data.data.summary.updated) { setPage(1); setRefreshKey((current) => current + 1); }
    } catch (requestError) { setImportError(requestError.response?.data?.message || 'Unable to import attendees.'); }
    finally { setImporting(false); }
  };

  return <div className="resource-page">
    <div className="section-heading"><p className="eyebrow">Event audience</p><h1>Attendees</h1><p>Every completed attendee registration is saved here with its event pass and registration status. Click a row to view and print their ID card.</p></div>
    <section className="attendees-panel">
      <div className="attendees-toolbar"><div className="panel-heading"><div><p className="eyebrow">Attendee registry</p><h2>{pagination.total || 0} {search.trim() ? 'found' : 'registered'}</h2></div></div><div className="attendee-tools"><label className="search-field"><Search size={16} /><input placeholder="Search all attendees" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><button type="button" className="primary-action compact-action" onClick={() => setShowImport(true)}><Upload size={17} />Import file</button></div></div>
      {loading ? <div className="empty-state">Loading attendees...</div> : error ? <p className="form-error" role="alert">{error}</p> : attendees.length ? <><div className="attendees-table-wrap"><table className="attendees-table"><thead><tr><th>Attendee</th><th>Job title</th><th>Company</th><th>Event</th><th>Pass ID</th><th>Status</th><th>Registered</th></tr></thead><tbody>{attendees.map((attendee) => <tr key={attendee._id} className="attendee-row" onClick={() => openCard(attendee)}><td><strong>{attendee.firstName} {attendee.lastName}</strong><span>{attendee.email}</span></td><td>{attendee.jobTitle || 'Not provided'}</td><td>{attendee.company || 'Not provided'}</td><td>{attendee.eventId?.name || 'TEXCELLENCE'}</td><td><code>{attendee.attendeeId}</code></td><td><span className={`event-status ${attendee.attendanceStatus.toLowerCase()}`}>{attendee.attendanceStatus.replace('_', ' ')}</span></td><td>{new Date(attendee.registrationDate || attendee.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div><div className="table-pagination"><span>Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span><div><button type="button" className="secondary-action compact-action" disabled={pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} />Previous</button><strong>Page {pagination.page} of {pagination.totalPages}</strong><button type="button" className="secondary-action compact-action" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight size={16} /></button></div></div></> : <div className="empty-state"><UsersRound size={22} /><h3>{search.trim() ? 'No attendees found' : 'No attendees registered'}</h3><p>{search.trim() ? 'Try a different name, email, company, job title, phone number, or pass ID.' : 'Completed registrations and imported attendees will appear here.'}</p></div>}
    </section>

    {showImport && <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="import-title" onClick={(event) => { if (event.target === event.currentTarget) closeImport(); }}><form className="registration-form event-form modal-panel import-panel" onSubmit={submitImport}>
      <div className="panel-heading"><div><p className="eyebrow">Bulk registration</p><h2 id="import-title">Import attendees</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={closeImport}><X size={18} /></button></div>
      <p className="import-help">Upload an .xlsx, .csv, or tab-separated spreadsheet with one attendee per row. First Name, Last Name, and Email are required. Existing attendees with a missing company or job title are updated.</p>
      <label>Event<select required value={eventId} onChange={(event) => setEventId(event.target.value)}><option value="">Select an event</option>{events.map((item) => <option key={item._id} value={item._id}>{item.name} {item.year} — {item.status.replaceAll('_', ' ')}</option>)}</select></label>
      <div className="import-actions"><input ref={fileInput} className="visually-hidden" type="file" accept=".xlsx,.csv,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/tab-separated-values" onChange={chooseWorkbook} /><button type="button" className="secondary-action" onClick={() => fileInput.current?.click()}><FileSpreadsheet size={17} />{fileName ? 'Choose another file' : 'Choose spreadsheet'}</button><button type="button" className="secondary-action" onClick={downloadAttendeeTemplate}><Download size={17} />Download template</button></div>
      {fileName && <div className="file-summary"><FileSpreadsheet size={18} /><div><strong>{fileName}</strong><span>{importRows.length ? `${importRows.length} attendee row${importRows.length === 1 ? '' : 's'} ready` : 'No valid rows loaded'}</span></div></div>}
      {importError && <p className="form-error" role="alert">{importError}</p>}
      {importResult && <div className="import-result" role="status"><p className="success-message"><Check size={16} />Imported {importResult.summary.imported} and updated {importResult.summary.updated || 0} of {importResult.summary.total} attendees.</p>{importResult.errors.length > 0 && <div className="import-errors"><strong>{importResult.summary.rejected} row{importResult.summary.rejected === 1 ? '' : 's'} skipped</strong><ul>{importResult.errors.slice(0, 10).map((item) => <li key={`${item.rowNumber}-${item.email}`}>Row {item.rowNumber}{item.email ? ` (${item.email})` : ''}: {item.message}</li>)}</ul>{importResult.errors.length > 10 && <span>And {importResult.errors.length - 10} more.</span>}</div>}</div>}
      <div className="event-form-actions"><button className="primary-action compact-action" disabled={importing || !eventId || !importRows.length}>{importing ? 'Importing...' : `Import ${importRows.length || ''} attendee${importRows.length === 1 ? '' : 's'}`}<Upload size={17} /></button><button type="button" className="secondary-action" onClick={closeImport}>Close</button></div>
    </form></div>}

    {(selected || cardError) && <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => { if (event.target === event.currentTarget) closeCard(); }}><div className="id-card-shell"><div className="id-card-toolbar no-print"><button type="button" className="icon-button" aria-label="Close" onClick={closeCard}><X size={18} /></button>{selected && <button type="button" className="primary-action compact-action" onClick={() => window.print()}><Printer size={17} />Print ID card</button>}</div>{cardError && <p className="form-error" role="alert">{cardError}</p>}{selected && <article className="id-card"><div className="id-card-header"><span className="eyebrow">{selected.eventId?.name || 'TEXCELLENCE'} {selected.eventId?.year || ''}</span><h2>Event Pass</h2></div><div className="id-card-body"><div className="id-card-avatar">{selected.firstName?.[0]}{selected.lastName?.[0]}</div><h3>{selected.firstName} {selected.lastName}</h3><p>{selected.jobTitle || 'Attendee'}{selected.company ? ` · ${selected.company}` : ''}</p><span className={`event-status ${selected.attendeeType?.toLowerCase()}`}>{selected.attendeeType?.replace('_', ' ')}</span></div><div className="id-card-qr"><QRCodeSVG value={`${window.location.origin}/scan/${encodeURIComponent(selected.qrCodeValue || selected.attendeeId)}`} size={140} includeMargin /></div><p className="id-card-id">{selected.attendeeId}</p></article>}</div></div>}
  </div>;
}

export default AttendeesPage;
