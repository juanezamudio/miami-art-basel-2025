// Parse quoted commas, escaped quotes, CRLF, and multiline values without
// changing the text supplied by an organizer or editor.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let closedQuote = false;
  const pushField = () => { row.push(field); field = ''; closedQuote = false; };
  const pushRow = () => { pushField(); if (row.some(value => value.trim())) rows.push(row); row = []; };
  text = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index++; }
      else if (char === '"') { quoted = false; closedQuote = true; }
      else field += char;
    } else if (char === ',') pushField();
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++;
      pushRow();
    } else if (char === '"' && field === '' && !closedQuote) quoted = true;
    else if (closedQuote || char === '"') throw new Error('Invalid characters around a quoted CSV field');
    else field += char;
  }
  if (quoted) throw new Error('Unclosed quoted CSV field');
  if (field || row.length || closedQuote) pushRow();
  return rows;
}

const columns = {
  id: 'ID', event: 'Event', eventType: 'Event Type', startDate: 'Start Date', endDate: 'End Date',
  schedule: 'Schedule', neighborhood: 'Neighborhood', address: 'Address', notes: 'Notes',
  ticketPrice: 'Ticket Price', ticketsLink: 'Tickets Link', edition: 'Edition',
  sourceUrl: 'Source URL', lastVerifiedAt: 'Last Verified At',
};

function csvToEvents(text) {
  const [headers, ...rows] = parseCSV(text);
  if (!headers) throw new Error('CSV is empty');
  const names = headers.map(value => value.trim());
  if (new Set(names).size !== names.length) throw new Error('Duplicate CSV columns');
  const indexes = Object.fromEntries(Object.entries(columns).map(([key, name]) => {
    const index = names.indexOf(name);
    if (index < 0) throw new Error(`Missing CSV column: ${name}`);
    return [key, index];
  }));
  return rows.map((row, index) => {
    if (row.length !== names.length) throw new Error(`CSV row ${index + 2} has ${row.length} fields; expected ${names.length}`);
    const event = Object.fromEntries(Object.entries(indexes).map(([key, column]) => [key, row[column].trim()]));
    event.id = Number(event.id);
    event.edition = Number(event.edition);
    event.startDate ||= null;
    event.endDate ||= null;
    return event;
  });
}

module.exports = { parseCSV, csvToEvents };
