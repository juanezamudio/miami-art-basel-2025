import type { Event } from '../types/event';

const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
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

export function withEventCoordinates(event: Event): Event {
  if (event.coordinates) return event;
  const coordinates = neighborhoodCoordinates[event.neighborhood?.trim() || ''];
  return coordinates
    ? { ...event, coordinates: { ...coordinates }, coordinateAccuracy: 'neighborhood' }
    : event;
}
