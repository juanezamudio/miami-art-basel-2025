const fs = require('fs');
const path = require('path');
const { auditCatalog } = require('./lib/catalog');
const season = require('../src/data/season.json');

function archivedIds(year) {
  const directory = path.join(__dirname, '../src/data/archive');
  return fs.readdirSync(directory)
    .filter(file => /^events-\d{4}\.json$/.test(file) && file !== `events-${year}.json`)
    .flatMap(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')).map(event => event.id));
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => !/^--(year|file)=.+$/.test(arg))) throw new Error('Usage: npm run audit-data -- --year=2026 --file=src/data/events.json');
    const year = Number(args.find(arg => arg.startsWith('--year='))?.slice(7) || season.year);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Invalid edition year');
    const file = args.find(arg => arg.startsWith('--file='))?.slice(7) || path.join(__dirname, '../src/data/events.json');
    const report = auditCatalog(JSON.parse(fs.readFileSync(file, 'utf8')), { year, archivedIds: archivedIds(year) });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.errors.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { archivedIds };
