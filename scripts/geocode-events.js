const fs = require('fs');
const path = require('path');

// Neighborhood fallback coordinates for Miami areas
const neighborhoodCoordinates = {
  'Miami Beach': { lat: 25.7907, lng: -80.1300 },
  'Downtown': { lat: 25.7751, lng: -80.1947 },
  'Wynwood': { lat: 25.8010, lng: -80.1990 },
  'Design District': { lat: 25.8126, lng: -80.1925 },
  'Coconut Grove': { lat: 25.7270, lng: -80.2413 },
  'Brickell': { lat: 25.7617, lng: -80.1918 },
  'Little River': { lat: 25.8352, lng: -80.1798 },
  'Hialeah': { lat: 25.8576, lng: -80.2781 },
  'Fort Lauderdale': { lat: 26.1224, lng: -80.1373 },
  'Coral Gables': { lat: 25.7215, lng: -80.2684 },
  'North Miami': { lat: 25.8900, lng: -80.1867 },
};

// Rate limiting helper - Nominatim requires 1 request per second
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Basel.ai Miami Art Basel Guide',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error(`  Error geocoding: ${error.message}`);
    return null;
  }
}

async function main() {
  const eventsPath = path.join(__dirname, '../src/data/events.json');
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

  console.log(`Processing ${events.length} events...\n`);

  let geocodedCount = 0;
  let fallbackCount = 0;
  let failedCount = 0;

  let skippedCount = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Skip if already has coordinates
    if (event.coordinates) {
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${events.length}] ${event.event}`);

    // Try geocoding the address first
    if (event.address) {
      console.log(`  Geocoding: ${event.address}`);
      await sleep(1100); // Nominatim rate limit: 1 req/sec

      const coords = await geocodeAddress(event.address);
      if (coords) {
        event.coordinates = coords;
        console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}`);
        geocodedCount++;
        continue;
      }
    }

    // Fallback to neighborhood coordinates
    const neighborhood = event.neighborhood?.trim();
    if (neighborhood && neighborhoodCoordinates[neighborhood]) {
      const baseCoords = neighborhoodCoordinates[neighborhood];
      // Add small random offset so markers don't stack
      event.coordinates = {
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.01,
      };
      console.log(`  → Fallback to neighborhood: ${neighborhood}`);
      fallbackCount++;
    } else {
      console.log(`  ✗ No address or neighborhood found`);
      failedCount++;
    }
  }

  // Save updated events
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));

  console.log('\n--- Summary ---');
  console.log(`Skipped (already geocoded): ${skippedCount}`);
  console.log(`Geocoded from address: ${geocodedCount}`);
  console.log(`Fallback to neighborhood: ${fallbackCount}`);
  console.log(`Failed (no location): ${failedCount}`);
  console.log('\nEvents saved to events.json');
}

main().catch(console.error);
