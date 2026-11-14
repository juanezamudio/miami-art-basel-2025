import { Event } from '@/types/event';
import eventsData from '@/data/events.json';
import { isEventOnDate } from './event-dates';
import { withEventCoordinates } from './event-locations';

export function getEvents(): Event[] {
  return (eventsData as Event[]).map(withEventCoordinates);
}

export function getEventById(id: number): Event | undefined {
  const events = getEvents();
  return events.find(e => e.id === id);
}

export function getEventTypes(): string[] {
  const events = getEvents();
  const types = new Set(events.map(e => e.eventType).filter(Boolean));
  return Array.from(types).sort();
}

export function getNeighborhoods(): string[] {
  const events = getEvents();
  const neighborhoods = new Set(events.map(e => e.neighborhood?.trim()).filter(Boolean));
  return Array.from(neighborhoods).sort();
}

// Helper to extract numeric price from price string
function extractPrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const lower = priceStr.toLowerCase();
  if (lower === 'free') return 0;
  if (lower === 'tbd' || lower === 'n/a') return null;

  // Extract first number from string (e.g., "$25+" -> 25, "$50 - $100" -> 50)
  const match = priceStr.match(/\$?(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function filterEvents(
  events: Event[],
  filters: {
    search?: string;
    eventType?: string;
    neighborhood?: string;
    date?: string;
    priceRange?: string;
  }
): Event[] {
  return events.filter(event => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        event.event.toLowerCase().includes(searchLower) ||
        event.neighborhood?.toLowerCase().includes(searchLower) ||
        event.address?.toLowerCase().includes(searchLower) ||
        event.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Event type filter
    if (filters.eventType && filters.eventType !== 'All') {
      if (event.eventType !== filters.eventType) return false;
    }

    // Neighborhood filter
    if (filters.neighborhood && filters.neighborhood !== 'All') {
      if (event.neighborhood?.trim() !== filters.neighborhood) return false;
    }

    // Date filter
    if (filters.date) {
      // Handle "TBA" filter - show events with no date
      if (filters.date === 'tba') {
        if (event.startDate) return false;
      } else {
        if (!isEventOnDate(event, filters.date)) return false;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const price = extractPrice(event.ticketPrice);

      switch (filters.priceRange) {
        case 'free':
          // Show only free events
          if (event.ticketPrice?.toLowerCase() !== 'free') return false;
          break;
        case '0-50':
          // Show events under $50 (including free)
          if (price === null || price >= 50) return false;
          break;
        case '50-100':
          // Show events $50 - $100
          if (price === null || price < 50 || price > 100) return false;
          break;
        case '100+':
          // Show events $100+
          if (price === null || price < 100) return false;
          break;
      }
    }

    return true;
  });
}

export function getEventsForDate(events: Event[], date: Date): Event[] {
  return events.filter(event => isEventOnDate(event, date));
}

export function getEventsContext(events: Event[] = getEvents()): string {
  return events.map(e => {
    const parts = [
      `Event: ${e.event}`,
      `Type: ${e.eventType}`,
      e.startDate && `Date: ${e.startDate}${e.endDate ? ` to ${e.endDate}` : ''}`,
      e.schedule && `Schedule: ${e.schedule}`,
      e.neighborhood && `Neighborhood: ${e.neighborhood}`,
      e.address && `Address: ${e.address}`,
      e.notes && `Notes: ${e.notes}`,
      `Price: ${e.ticketPrice || 'Not verified; check organizer'}`,
      e.ticketsLink && `Tickets: ${e.ticketsLink}`,
      e.sourceUrl && `Source: ${e.sourceUrl}`,
      e.lastVerifiedAt && `Last checked: ${e.lastVerifiedAt}`,
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\n');
}
