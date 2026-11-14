const fs = require('fs');
const path = require('path');
const season = require('../src/data/season.json');
const { csvToEvents } = require('./lib/csv');
const { auditCatalog } = require('./lib/catalog');
const { archivedIds } = require('./audit-events');

// Validate editorial input without asking AI to estimate prices or addresses.
try {
  const csvPath = path.join(__dirname, `../art-basel-${season.year}.csv`);
  const events = csvToEvents(fs.readFileSync(csvPath, 'utf8'));
  const report = auditCatalog(events, { year: season.year, archivedIds: archivedIds(season.year) });
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.errors.length ? 1 : 0;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
