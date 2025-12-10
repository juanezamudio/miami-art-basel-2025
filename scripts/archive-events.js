const fs = require('fs');
const path = require('path');

// Get the year from command line args, or default to current year
const year = process.argv[2] || new Date().getFullYear();

const sourcePath = path.join(__dirname, '../src/data/events.json');
const archiveDir = path.join(__dirname, '../src/data/archive');
const destPath = path.join(archiveDir, `events-${year}.json`);

// Ensure archive directory exists
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log(`Created archive directory: ${archiveDir}`);
}

// Check if source file exists
if (!fs.existsSync(sourcePath)) {
  console.error('Error: events.json not found');
  process.exit(1);
}

// Check if archive already exists
if (fs.existsSync(destPath)) {
  console.log(`Archive for ${year} already exists at: ${destPath}`);
  console.log('Overwriting with current events.json...');
}

// Copy the file
fs.copyFileSync(sourcePath, destPath);

// Get event count for confirmation
const events = JSON.parse(fs.readFileSync(destPath, 'utf-8'));
console.log(`\nSuccessfully archived ${events.length} events to:`);
console.log(destPath);
console.log(`\nYou can now safely clear events.json for the next year.`);
