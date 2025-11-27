import { Event } from '@/types/event';
import eventsData from '@/data/events.json';

// Neighborhood coordinates for Miami areas
const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  'Miami Beach': { lat: 25.7907, lng: -80.1300 },
  'Downtown': { lat: 25.7751, lng: -80.1947 },
  'Downtown ': { lat: 25.7751, lng: -80.1947 },
  'Wynwood': { lat: 25.8010, lng: -80.1990 },
  'Design District': { lat: 25.8126, lng: -80.1925 },
  'Coconut Grove': { lat: 25.7270, lng: -80.2413 },
  'Brickell': { lat: 25.7617, lng: -80.1918 },
  'Little River': { lat: 25.8352, lng: -80.1798 },
  'Hialeah': { lat: 25.8576, lng: -80.2781 },
  'Fort Lauderdale': { lat: 26.1224, lng: -80.1373 },
};

export function getEvents(): Event[] {
  return (eventsData as Event[]).map((event, index) => {
    const neighborhood = event.neighborhood?.trim() || '';
    const coords = neighborhoodCoordinates[neighborhood];

    return {
      ...event,
      coordinates: coords ? {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
      } : undefined,
    };
  });
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

export function filterEvents(
  events: Event[],
  filters: {
    search?: string;
    eventType?: string;
    neighborhood?: string;
    date?: string;
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
        const filterDate = new Date(filters.date);
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : startDate;

        if (startDate && endDate) {
          if (filterDate < startDate || filterDate > endDate) return false;
        } else if (startDate) {
          if (filterDate.toDateString() !== startDate.toDateString()) return false;
        } else {
          // No start date means TBA - exclude from specific date filters
          return false;
        }
      }
    }

    return true;
  });
}

export function getEventsForDate(events: Event[], date: Date): Event[] {
  return events.filter(event => {
    if (!event.startDate) return false;

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    date.setHours(12, 0, 0, 0);

    return date >= startDate && date <= endDate;
  });
}

export function getEventsContext(): string {
  const events = getEvents();
  return events.map(e => {
    const parts = [
      `Event: ${e.event}`,
      `Type: ${e.eventType}`,
      e.startDate && `Date: ${e.startDate}${e.endDate ? ` to ${e.endDate}` : ''}`,
      e.schedule && `Schedule: ${e.schedule}`,
      e.neighborhood && `Neighborhood: ${e.neighborhood}`,
      e.address && `Address: ${e.address}`,
      e.notes && `Notes: ${e.notes}`,
      e.ticketsLink && `Tickets: ${e.ticketsLink}`,
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\n');
}
