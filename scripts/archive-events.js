const fs = require('fs');
const path = require('path');
const season = require('../src/data/season.json');
const { auditCatalog } = require('./lib/catalog');

try {
  const year = Number(process.argv[2] || season.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Invalid edition year');
  const sourcePath = path.join(__dirname, '../src/data/events.json');
  const archiveDir = path.join(__dirname, '../src/data/archive');
  const destPath = path.join(archiveDir, `events-${year}.json`);
  if (fs.existsSync(destPath)) throw new Error(`Archive ${year} already exists; refusing to overwrite history`);
  const events = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const report = auditCatalog(events, { year });
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  fs.mkdirSync(archiveDir, { recursive: true });
  fs.writeFileSync(destPath, JSON.stringify(events, null, 2) + '\n', { flag: 'wx' });
  console.log(`Archived ${events.length} events to ${destPath}`);
  console.log('Register this snapshot in src/lib/archive.ts before starting the next edition.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
