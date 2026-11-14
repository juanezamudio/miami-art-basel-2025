const fs = require('fs');
const path = require('path');
const season = require('../src/data/season.json');
const { csvToEvents } = require('./lib/csv');
const { auditCatalog } = require('./lib/catalog');
const { archivedIds } = require('./audit-events');

try {
  const csvPath = path.join(__dirname, `../art-basel-${season.year}.csv`);
  const jsonPath = path.join(__dirname, '../src/data/events.json');
  const events = csvToEvents(fs.readFileSync(csvPath, 'utf8'));
  const report = auditCatalog(events, { year: season.year, archivedIds: archivedIds(season.year) });
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  // Preserve previously reviewed coordinates when editorial data is reimported.
  const previous = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const existing = new Map(previous.map(event => [event.id, event]));
  for (const event of events) {
    const old = existing.get(event.id);
    if (old?.coordinates && old.address === event.address && old.neighborhood === event.neighborhood) {
      event.coordinates = old.coordinates;
      if (old.coordinateAccuracy) event.coordinateAccuracy = old.coordinateAccuracy;
    }
  }
  const temporaryPath = `${jsonPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(events, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporaryPath, jsonPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
  console.log(`Imported ${events.length} reviewed ${season.year} events from ${csvPath}`);
  for (const warning of report.warnings) console.warn(warning);
} catch (error) {
  console.error(`Import failed; live catalog unchanged: ${error.message}`);
  process.exitCode = 1;
}
