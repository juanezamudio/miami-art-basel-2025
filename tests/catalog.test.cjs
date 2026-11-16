const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseEventDate, eventDateKey, isEventOnDate, miamiDateKey, getCatalogDateKeys } = require('../src/lib/event-dates.ts');
const { withEventCoordinates } = require('../src/lib/event-locations.ts');
const { auditCatalog } = require('../scripts/lib/catalog');
const { parseCSV, csvToEvents } = require('../scripts/lib/csv');
const catalog = require('../src/data/events.json');
const archive = require('../src/data/archive/events-2025.json');
const options = { year: 2026, archivedIds: archive.map(event => event.id), now: new Date('2026-11-13T17:00:00Z') };

test('date parsing rejects impossible days and supports ISO and legacy input', () => {
  for (const value of ['2026-02-29', '2/30/2026', '2026-13-01', 'unknown', '', null]) assert.equal(parseEventDate(value), null);
  assert.equal(eventDateKey('12/4/2026'), '2026-12-04');
  assert.equal(eventDateKey('2024-02-29'), '2024-02-29');
});

test('single and multi-day filtering agree across Miami, UTC, and Tokyo', () => {
  const script = `const assert = require('node:assert/strict');
    const { isEventOnDate, eventDateKey, parseEventDate } = require('./src/lib/event-dates.ts');
    const event = { startDate: '12/4/2026', endDate: '12/6/2026' };
    for (const day of ['2026-12-04', '2026-12-05', '2026-12-06']) assert.ok(isEventOnDate(event, day));
    assert.ok(!isEventOnDate(event, '2026-12-03'));
    assert.ok(!isEventOnDate(event, '2026-12-07'));
    assert.ok(isEventOnDate({ startDate: '12/4/2026', endDate: null }, '2026-12-04'));
    assert.equal(eventDateKey(parseEventDate('2026-12-04')), '2026-12-04');`;
  for (const TZ of ['America/New_York', 'UTC', 'Asia/Tokyo']) {
    execFileSync(process.execPath, ['--experimental-strip-types', '-e', script], { cwd: path.join(__dirname, '..'), env: { ...process.env, TZ } });
  }
});

test('filtering does not mutate the selected date or match invalid and TBA dates', () => {
  const selected = new Date(2026, 11, 4, 8, 45);
  const time = selected.getTime();
  assert.ok(isEventOnDate({ startDate: '2026-12-04', endDate: null }, selected));
  assert.equal(selected.getTime(), time);
  assert.equal(isEventOnDate({ startDate: null, endDate: null }, selected), false);
  assert.equal(isEventOnDate({ startDate: '2026-12-04', endDate: 'bad' }, selected), false);
  assert.equal(isEventOnDate({ startDate: '2026-12-06', endDate: '2026-12-04' }, selected), false);
});

test('today uses Miami calendar time even after UTC midnight', () => {
  assert.equal(miamiDateKey(new Date('2026-12-04T03:00:00Z')), '2026-12-03');
  assert.equal(miamiDateKey(new Date('2026-12-04T06:00:00Z')), '2026-12-04');
});

test('fallback map coordinates are stable, explicitly approximate, and leave source data unchanged', () => {
  const input = { ...catalog[0], neighborhood: 'Miami Beach ' };
  delete input.coordinates;
  delete input.coordinateAccuracy;
  const result = withEventCoordinates(input);
  assert.deepEqual(result, withEventCoordinates(input));
  assert.equal(result.coordinateAccuracy, 'neighborhood');
  assert.equal(input.coordinates, undefined);
  const exact = { ...input, coordinates: { lat: 25.8, lng: -80.1 }, coordinateAccuracy: 'venue' };
  assert.equal(withEventCoordinates(exact), exact);
  assert.equal(withEventCoordinates({ ...input, neighborhood: 'Unknown' }).coordinates, undefined);
});

test('date controls include the vernissage without changing the official Art Week', () => {
  const season = require('../src/data/season.json');
  const dates = getCatalogDateKeys(season, catalog);
  assert.equal(season.startDate, '2026-11-30');
  assert.equal(season.endDate, '2026-12-06');
  assert.ok(dates.includes('2026-11-29'));
  for (const event of catalog) {
    assert.ok(dates.includes(event.startDate), event.event);
    assert.ok(dates.includes(event.endDate || event.startDate), event.event);
  }
  assert.equal(new Set(dates).size, dates.length);
});

test('browse dates retain an empty official week and ignore malformed event intervals', () => {
  const season = { startDate: '2026-11-30', endDate: '2026-12-06' };
  const expected = getCatalogDateKeys(season, []);
  assert.equal(expected.length, 7);
  assert.deepEqual(getCatalogDateKeys(season, [
    { startDate: '2026-11-28', endDate: '2026-11-27' },
    { startDate: 'bad', endDate: null },
  ]), expected);
});

test('review batches cover every added listing and retain a primary source', () => {
  const directory = path.join(__dirname, '../src/data');
  const reviews = fs.readdirSync(directory)
    .filter(name => /^catalog-review-.*\.json$/.test(name))
    .map(name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')));
  const entries = reviews.flatMap(review => review.approved.map(entry => ({ ...entry, reviewedAt: review.reviewedAt })));
  const approvals = new Map(entries.map(entry => [entry.eventId, entry]));
  for (const event of catalog.filter(event => event.id >= 2026012)) {
    const approval = approvals.get(event.id);
    assert.ok(approval, event.event);
    assert.ok(approval.primarySources.includes(event.sourceUrl), event.event);
    assert.ok(approval.evidence.length > 30);
    assert.equal(event.lastVerifiedAt, approval.reviewedAt);
  }
  assert.equal(approvals.size, entries.length);
});

test('public fair days exclude private previews and the NADA Sunday closure', () => {
  const find = name => catalog.find(event => event.event === name);
  assert.ok(!isEventOnDate(find('Design Miami 2026'), '2026-12-01'));
  assert.ok(!isEventOnDate(find('Aqua Art Miami 2026'), '2026-12-02'));
  assert.ok(!isEventOnDate(find('NADA Miami 2026'), '2026-12-06'));
  assert.ok(isEventOnDate(find('NADA Miami 2026'), '2026-12-05'));
  assert.ok(!isEventOnDate(find('Spectrum Miami 2026'), '2026-12-02'));
});

test('recurring markets, gallery closed days and overnight parties use their actual session dates', () => {
  const find = name => catalog.find(event => event.event === name);
  const market = find('Miami Worldcenter Night Market — Art Week Friday');
  assert.ok(isEventOnDate(market, '2026-12-04'));
  assert.ok(!isEventOnDate(market, '2026-12-05'));
  const gallery = find('Ana Benaroya: Hide and Seek — Art Week viewing');
  assert.ok(!isEventOnDate(gallery, '2026-11-30'));
  assert.ok(!isEventOnDate(gallery, '2026-12-06'));
  const party = find('NTS Miami (Ground Basel 2026)');
  assert.equal(party.startDate, '2026-12-05');
  assert.equal(party.endDate, '2026-12-05');
  assert.match(party.schedule, /next day/);
});

test('current catalog has provenance, 2026 dates, and no IDs reused from 2025', () => {
  assert.equal(archive.length, 172);
  assert.deepEqual(auditCatalog(catalog, { ...options, now: new Date() }).errors, []);
  const csv = fs.readFileSync(path.join(__dirname, '../art-basel-2026.csv'), 'utf8');
  assert.deepEqual(csvToEvents(csv), catalog.map(({ coordinates, coordinateAccuracy, ...event }) => event));
});

test('audit rejects stale-year data, duplicates, unsafe URLs, missing proof, and reversed dates', () => {
  for (const patch of [
    { startDate: '2025-12-04' }, { id: archive[0].id }, { sourceUrl: 'javascript:alert(1)' },
    { sourceUrl: '' }, { edition: 2025 }, { lastVerifiedAt: '2026-11-14' },
    { lastVerifiedAt: '2026-02-30' }, { endDate: '2026-12-01' },
    { ticketsLink: 'https://name:secret@example.com' },
  ]) assert.ok(auditCatalog([{ ...catalog[0], ...patch }], options).errors.length, JSON.stringify(patch));
  assert.ok(auditCatalog([catalog[0], { ...catalog[0], id: 2026999 }], options).errors.some(error => error.includes('duplicate title')));
  assert.ok(auditCatalog([], options).errors.length);
  assert.ok(auditCatalog({}, options).errors.length);
});

test('audit warns about stale verification, unknown prices, and missing venue coordinates', () => {
  const report = auditCatalog(catalog, { ...options, now: new Date('2026-12-01T17:00:00Z') });
  assert.deepEqual(report.errors, []);
  assert.ok(report.warnings.some(warning => warning.includes('14 days')));
  assert.ok(report.warnings.some(warning => warning.includes('ticket price')));
  assert.ok(report.warnings.some(warning => warning.includes('coordinates')));
});

test('CSV parsing preserves quoted commas, newlines, and escaped quotes', () => {
  assert.deepEqual(parseCSV('\uFEFFID,Event\r\n1,"Artist ""A"", Miami\nOpening"\r\n'), [['ID', 'Event'], ['1', 'Artist "A", Miami\nOpening']]);
  assert.throws(() => parseCSV('ID,Event\n1,"unclosed'), /Unclosed/);
  assert.throws(() => parseCSV('ID,Event\n1,"name"extra'), /Invalid/);
  assert.throws(() => csvToEvents('ID,Event\n1,Test'), /Missing CSV column/);
});

test('archiving refuses to overwrite the historical snapshot', () => {
  const before = fs.readFileSync(path.join(__dirname, '../src/data/archive/events-2025.json'));
  assert.throws(() => execFileSync(process.execPath, ['--experimental-strip-types', 'scripts/archive-events.js', '2025'], { cwd: path.join(__dirname, '..'), stdio: 'pipe' }), /refusing to overwrite history/);
  assert.deepEqual(fs.readFileSync(path.join(__dirname, '../src/data/archive/events-2025.json')), before);
});
