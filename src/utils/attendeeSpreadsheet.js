import { readSheet } from 'read-excel-file/browser';

const headerAliases = {
  firstname: 'firstName', first: 'firstName', lastname: 'lastName', surname: 'lastName', email: 'email', emailaddress: 'email', contactemail: 'email',
  phone: 'phone', phonenumber: 'phone', mobile: 'phone', mobilenumber: 'phone', jobtitle: 'jobTitle', title: 'jobTitle', designation: 'jobTitle', role: 'jobTitle',
  company: 'company', companyname: 'company', organization: 'company', organisation: 'company', organizationname: 'company', organisationname: 'company',
  industry: 'industry', companysize: 'companySize', country: 'country', city: 'city', attendeetype: 'attendeeType', type: 'attendeeType',
  consent: 'consent', leadsharingconsent: 'leadSharingConsent', sponsorsharingconsent: 'leadSharingConsent',
};

const normalizeHeader = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const textValue = (value) => value === null || value === undefined ? '' : String(value).trim();
const phoneValue = (value) => {
  const phone = textValue(value);
  if (/^[+-]?\d+(?:\.\d+)?e[+-]?\d+$/i.test(phone)) {
    const expanded = Number(phone);
    if (Number.isSafeInteger(expanded)) return String(expanded);
  }
  return phone;
};
const booleanValue = (value) => {
  if (typeof value === 'boolean') return value;
  const normalized = textValue(value).toLowerCase();
  if (['yes', 'true', '1', 'y'].includes(normalized)) return true;
  if (['no', 'false', '0', 'n'].includes(normalized)) return false;
  return undefined;
};

const parseDelimitedText = (contents, delimiter) => {
  const rows = [[]];
  let value = '';
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (character === '"') {
      if (quoted && contents[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      rows.at(-1).push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && contents[index + 1] === '\n') index += 1;
      rows.at(-1).push(value);
      value = '';
      rows.push([]);
    } else value += character;
  }

  if (quoted) throw new Error('The CSV file contains an unclosed quoted value.');
  rows.at(-1).push(value);
  return rows.filter((row) => row.some((cell) => textValue(cell)));
};

const rowsToAttendees = (rows) => {
  if (rows.length < 2) throw new Error('The spreadsheet must include a header row and at least one attendee.');

  const fields = rows[0].map((header) => headerAliases[normalizeHeader(header)] || null);
  for (const required of ['firstName', 'lastName', 'email']) {
    if (!fields.includes(required)) throw new Error(`The spreadsheet is missing the required "${required}" column.`);
  }

  const attendees = rows.slice(1).map((row, index) => {
    const attendee = { rowNumber: index + 2 };
    fields.forEach((field, columnIndex) => {
      if (!field) return;
      const value = row[columnIndex];
      if (field === 'phone') {
        const phone = phoneValue(value);
        if (phone) attendee[field] = phone;
      }
      else if (field === 'consent' || field === 'leadSharingConsent') {
        const parsed = booleanValue(value);
        if (parsed !== undefined) attendee[field] = parsed;
      } else if (value !== null && value !== undefined && textValue(value)) attendee[field] = textValue(value);
    });
    return attendee;
  }).filter((attendee) => Object.keys(attendee).length > 1);

  if (!attendees.length) throw new Error('The spreadsheet does not contain any attendee rows.');
  if (attendees.length > 500) throw new Error('A spreadsheet can contain a maximum of 500 attendees.');
  return attendees;
};

export const parseAttendeeFile = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv' || extension === 'tsv') {
    const contents = await file.text();
    const firstLine = contents.split(/\r?\n/, 1)[0];
    const delimiter = extension === 'tsv' || (firstLine.match(/\t/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? '\t' : ',';
    return rowsToAttendees(parseDelimitedText(contents, delimiter));
  }
  if (extension === 'xlsx') return rowsToAttendees(await readSheet(file));
  throw new Error('Choose an .xlsx, .csv, or .tsv file.');
};

export const downloadAttendeeTemplate = () => {
  const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Company', 'Industry', 'Company Size', 'Country', 'City', 'Attendee Type', 'Consent', 'Lead Sharing Consent'];
  const example = ['Ada', 'Lovelace', 'ada@example.com', '+2348000000000', 'CTO', 'Example Ltd', 'Technology', '51-200', 'Nigeria', 'Lagos', 'VIP', 'Yes', 'No'];
  const csv = `${headers.join(',')}\r\n${example.join(',')}\r\n`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'attendee-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
};
