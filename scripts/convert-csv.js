const fs = require('fs');
const path = require('path');

// Read from root CSV file
const csvPath = path.join(__dirname, '..', 'art-basel-2025.csv');
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'events.json');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

console.log('Reading from:', csvPath);
console.log('Headers found:', headers);

const events = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Parse CSV line handling quoted values with commas
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const event = {
    id: parseInt(values[0]) || i,
    event: values[1] || '',
    eventType: values[2]?.trim() || '',
    startDate: values[3] || null,
    endDate: values[4] || null,
    schedule: values[5] || '',
    neighborhood: values[6] || '',
    address: values[7] || '',
    notes: values[8] || '',
    ticketsLink: values[9] || '',
    link: values[9] || '', // Use tickets link as fallback
  };

  events.push(event);
}

fs.writeFileSync(jsonPath, JSON.stringify(events, null, 2));
console.log(`Converted ${events.length} events to JSON`);
console.log('Output saved to:', jsonPath);
