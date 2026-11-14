import { Event } from '@/types/event';
import events2025 from '@/data/archive/events-2025.json';

const archives: Record<number, Event[]> = { 2025: events2025 as Event[] };

export function getArchiveYears(): number[] {
  return Object.keys(archives).map(Number).sort((a, b) => b - a);
}

export function getArchiveEvents(year: number): Event[] {
  return (archives[year] || []).map(event => ({ ...event, edition: year }));
}

export function getArchiveEventTypes(year: number): string[] {
  return [...new Set(getArchiveEvents(year).map(e => e.eventType).filter(Boolean))].sort();
}

export function getArchiveNeighborhoods(year: number): string[] {
  return [...new Set(getArchiveEvents(year).map(e => e.neighborhood.trim()).filter(Boolean))].sort();
}

export function getArchiveEventById(year: number, id: number): Event | undefined {
  return getArchiveEvents(year).find(e => e.id === id);
}
