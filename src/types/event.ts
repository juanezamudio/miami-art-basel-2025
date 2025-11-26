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
  ticketsLink: string;
  link: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type EventType = 'Art Show' | 'Party' | 'Wellness' | 'All';
export type Neighborhood = string;
