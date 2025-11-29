require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate limiting - Gemini has limits on requests per minute
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds between requests
const BATCH_SIZE = 5; // Process 5 events at a time for address standardization

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse CSV file
function parseCSV(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

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

    events.push({
      id: values[0] || String(i),
      event: values[1] || '',
      eventType: values[2] || '',
      startDate: values[3] || '',
      endDate: values[4] || '',
      schedule: values[5] || '',
      neighborhood: values[6] || '',
      address: values[7] || '',
      notes: values[8] || '',
      ticketPrice: values[9] || '',
      ticketsLink: values[10] || '',
    });
  }

  return events;
}

// Write events back to CSV
function writeCSV(events, outputPath) {
  const headers = ['ID', 'Event', 'Event Type', 'Start Date', 'End Date', 'Schedule', 'Neighborhood', 'Address', 'Notes', 'Ticket Price', 'Tickets Link'];

  const lines = [headers.join(',')];

  for (const event of events) {
    const values = [
      event.id,
      event.event.includes(',') ? `"${event.event}"` : event.event,
      event.eventType,
      event.startDate,
      event.endDate,
      event.schedule,
      event.neighborhood,
      event.address.includes(',') ? `"${event.address}"` : event.address,
      event.notes.includes(',') ? `"${event.notes}"` : event.notes,
      event.ticketPrice,
      event.ticketsLink,
    ];
    lines.push(values.join(','));
  }

  fs.writeFileSync(outputPath, lines.join('\n'));
  console.log(`\nOutput saved to: ${outputPath}`);
}

// Fetch ticket price from event URL using Gemini
async function fetchTicketPrice(event, model) {
  if (!event.ticketsLink) {
    return 'N/A';
  }

  // Skip if already has a ticket price
  if (event.ticketPrice && event.ticketPrice !== '') {
    return event.ticketPrice;
  }

  try {
    const prompt = `I need you to analyze this event ticket URL and determine the starting ticket price.

Event: ${event.event}
URL: ${event.ticketsLink}

Based on the URL and event name, what is the likely starting ticket price?
- If it appears to be a free event, respond with "Free"
- If you can determine a price, respond with just the price (e.g., "$25" or "$50+")
- If you cannot determine the price, respond with "TBD"
- For events on platforms like Eventbrite, Luma, Dice, etc., make your best estimate based on the event type

Respond with ONLY the price, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const price = response.text().trim();

    return price;
  } catch (error) {
    console.error(`  Error fetching price for ${event.event}:`, error.message);
    return 'TBD';
  }
}

// Standardize addresses using Gemini
async function standardizeAddresses(events, model) {
  const eventsWithAddresses = events.filter(e => e.address && e.address.trim() !== '');

  if (eventsWithAddresses.length === 0) {
    return events;
  }

  console.log(`\nStandardizing ${eventsWithAddresses.length} addresses...`);

  // Process in batches
  for (let i = 0; i < eventsWithAddresses.length; i += BATCH_SIZE) {
    const batch = eventsWithAddresses.slice(i, i + BATCH_SIZE);

    const addressList = batch.map((e, idx) => `${idx + 1}. "${e.address}"`).join('\n');

    const prompt = `Standardize these Miami event addresses to a consistent format.

Format each address as: "Venue Name (if applicable), Street Address, City, FL ZIP"
- If the address is already standardized, keep it as is
- If it's missing city/zip but is clearly in Miami area, add "Miami, FL" or appropriate city
- If it's just a venue name without address, keep it as is
- Remove any extra whitespace or formatting issues

Addresses to standardize:
${addressList}

Respond with ONLY the standardized addresses, one per line, numbered to match the input. Example:
1. The Standard Spa, 40 Island Ave, Miami Beach, FL 33139
2. Wynwood Walls, 2516 NW 2nd Ave, Miami, FL 33127`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const standardized = response.text().trim().split('\n');

      // Update events with standardized addresses
      standardized.forEach((line, idx) => {
        if (batch[idx]) {
          // Remove the number prefix (e.g., "1. ")
          const address = line.replace(/^\d+\.\s*/, '').trim();
          const eventIdx = events.findIndex(e => e.id === batch[idx].id);
          if (eventIdx !== -1 && address) {
            events[eventIdx].address = address;
          }
        }
      });

      console.log(`  Processed addresses ${i + 1}-${Math.min(i + BATCH_SIZE, eventsWithAddresses.length)}`);
    } catch (error) {
      console.error(`  Error standardizing batch:`, error.message);
    }

    await sleep(DELAY_BETWEEN_REQUESTS);
  }

  return events;
}

async function main() {
  const csvPath = path.join(__dirname, '..', 'art-basel-2025.csv');
  const outputPath = path.join(__dirname, '..', 'art-basel-2025-preprocessed.csv');

  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('Reading CSV from:', csvPath);
  const events = parseCSV(csvPath);
  console.log(`Found ${events.length} events\n`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Step 1: Fetch ticket prices
  console.log('Fetching ticket prices...');
  let pricesUpdated = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (!event.ticketPrice || event.ticketPrice === '') {
      process.stdout.write(`  [${i + 1}/${events.length}] ${event.event.substring(0, 50)}...`);

      const price = await fetchTicketPrice(event, model);
      events[i].ticketPrice = price;

      console.log(` -> ${price}`);
      pricesUpdated++;

      await sleep(DELAY_BETWEEN_REQUESTS);
    } else {
      console.log(`  [${i + 1}/${events.length}] ${event.event.substring(0, 50)}... (already has price: ${event.ticketPrice})`);
    }
  }

  console.log(`\nUpdated ${pricesUpdated} ticket prices`);

  // Step 2: Standardize addresses
  const updatedEvents = await standardizeAddresses(events, model);

  // Step 3: Write output
  writeCSV(updatedEvents, outputPath);

  console.log('\nPreprocessing complete!');
  console.log(`Run 'npm run update-data' after reviewing ${outputPath}`);
}

main().catch(console.error);
