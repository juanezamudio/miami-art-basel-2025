const { parseEventDate, eventDateKey } = require('../../src/lib/event-dates.ts');

function isWebUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function auditCatalog(events, { year, archivedIds = [], now = new Date() }) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(events)) return { errors: ['Catalog must be an array'], warnings, count: 0 };
  if (!events.length) errors.push('Catalog is empty');
  const seenIds = new Set(archivedIds);
  const fingerprints = new Set();
  let undated = 0;
  let missingLocations = 0;
  let missingPrices = 0;

  events.forEach((event, index) => {
    const label = `Row ${index + 1} (${event?.event || 'untitled'})`;
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      errors.push(`${label}: expected an event object`);
      return;
    }
    if (!Number.isSafeInteger(event.id) || event.id <= 0) errors.push(`${label}: ID must be a positive integer`);
    if (seenIds.has(event.id)) errors.push(`${label}: ID ${event.id} is duplicated or belongs to an archive`);
    seenIds.add(event.id);
    for (const key of ['event', 'eventType', 'schedule', 'neighborhood', 'address', 'notes', 'ticketPrice', 'ticketsLink']) {
      if (typeof event[key] !== 'string') errors.push(`${label}: ${key} must be a string`);
    }
    if (typeof event.event !== 'string' || !event.event.trim()) errors.push(`${label}: event title is required`);
    if (!['Art Show', 'Party', 'Wellness', 'Conference', 'Networking', 'Pop Up'].includes(event.eventType)) {
      errors.push(`${label}: unknown event type`);
    }
    for (const key of ['startDate', 'endDate']) {
      const value = event[key];
      if (value === null) continue;
      const date = typeof value === 'string' ? parseEventDate(value) : null;
      if (!date) errors.push(`${label}: invalid ${key}`);
      else if (date.getFullYear() !== year) errors.push(`${label}: ${key} belongs to ${date.getFullYear()}, expected ${year}`);
    }
    if (!event.startDate) {
      undated++;
      if (event.endDate) errors.push(`${label}: endDate requires startDate`);
    }
    const start = eventDateKey(typeof event.startDate === 'string' ? event.startDate : null);
    const end = eventDateKey(typeof event.endDate === 'string' ? event.endDate : null);
    if (start && end && end < start) errors.push(`${label}: endDate precedes startDate`);
    const fingerprint = [event.event, start, event.address].map(value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')).join('|');
    if (fingerprints.has(fingerprint)) errors.push(`${label}: duplicate title, date, and venue`);
    fingerprints.add(fingerprint);
    for (const key of ['ticketsLink', 'sourceUrl']) {
      if (event[key] && !isWebUrl(event[key])) errors.push(`${label}: ${key} must be an HTTP(S) URL without credentials`);
    }
    if (year >= 2026) {
      if (event.edition !== year) errors.push(`${label}: edition must be ${year}`);
      if (!event.sourceUrl) errors.push(`${label}: organizer sourceUrl is required`);
      const verified = typeof event.lastVerifiedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.lastVerifiedAt)
        ? parseEventDate(event.lastVerifiedAt) : null;
      if (!verified) errors.push(`${label}: valid ISO lastVerifiedAt date is required`);
      else {
        const verifiedKey = eventDateKey(verified);
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
        if (verifiedKey > today) errors.push(`${label}: lastVerifiedAt cannot be in the future`);
        if (now.getTime() - verified.getTime() > 14 * 86400000) warnings.push(`${label}: source check is more than 14 days old`);
      }
    }
    if (!event.coordinates || event.coordinateAccuracy === 'neighborhood') missingLocations++;
    if (event.coordinates && (!Number.isFinite(event.coordinates.lat) || !Number.isFinite(event.coordinates.lng) || Math.abs(event.coordinates.lat) > 90 || Math.abs(event.coordinates.lng) > 180)) {
      errors.push(`${label}: invalid coordinates`);
    }
    if (event.coordinateAccuracy && !['venue', 'neighborhood'].includes(event.coordinateAccuracy)) errors.push(`${label}: invalid coordinateAccuracy`);
    if (!event.ticketPrice) missingPrices++;
  });
  if (undated) warnings.push(`${undated} events have dates to be announced`);
  if (missingLocations) warnings.push(`${missingLocations} events lack venue coordinates; map locations may be approximate`);
  if (missingPrices) warnings.push(`${missingPrices} events have no verified ticket price`);
  return { count: events.length, year, errors, warnings };
}

module.exports = { auditCatalog };
