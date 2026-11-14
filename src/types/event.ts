export interface Event {
  id: number;
  event: string;
  eventType: string;
  startDate: string | null;
  endDate: string | null;
  schedule: string;
  neighborhood: string;
  address: string;
  notes: string;
  ticketPrice: string;
  ticketsLink: string;
  edition?: number;
  sourceUrl?: string;
  lastVerifiedAt?: string;
  coordinateAccuracy?: 'venue' | 'neighborhood';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type EventType = 'Art Show' | 'Party' | 'Wellness' | 'All';
export type Neighborhood = string;
