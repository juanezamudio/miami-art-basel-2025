import { Event } from '@/types/event';
import currentEvents from '@/data/events.json';
import events2025 from '@/data/archive/events-2025.json';

// Art Basel end dates by year
const ART_BASEL_END_DATES: Record<number, Date> = {
  2025: new Date('2025-12-09T23:59:59'),
  // 2026: new Date('2026-12-XX...'),
};

// All available archive years
const ARCHIVE_YEARS = [2025];

// Get all available archive years
export function getArchiveYears(): number[] {
  return [...ARCHIVE_YEARS].sort((a, b) => b - a);
}

// Get events for a specific year
export function getArchiveEvents(year: number): Event[] {
  const endDate = ART_BASEL_END_DATES[year];
  const now = new Date();

  // If Art Basel for this year hasn't ended yet, use live events.json
  // This allows real-time updates during the event
  if (endDate && now <= endDate) {
    return currentEvents as Event[];
  }

  // After Art Basel ends, use the archived snapshot file
  // This preserves the data even if events.json gets cleared
  if (year === 2025) {
    return events2025 as Event[];
  }

  // Future years - add more cases as needed:
  // if (year === 2026) return events2026 as Event[];

  return [];
}

// Get event types for a specific year
export function getArchiveEventTypes(year: number): string[] {
  const events = getArchiveEvents(year);
  const types = new Set(events.map(e => e.eventType).filter(Boolean));
  return Array.from(types).sort();
}

// Get neighborhoods for a specific year
export function getArchiveNeighborhoods(year: number): string[] {
  const events = getArchiveEvents(year);
  const hoods = new Set(events.map(e => e.neighborhood).filter(Boolean));
  return Array.from(hoods).sort();
}

// Get a specific event from archive by ID and year
export function getArchiveEventById(year: number, id: number): Event | undefined {
  const events = getArchiveEvents(year);
  return events.find(e => e.id === id);
}
