'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';

interface MapViewProps {
  events: Event[];
}

export default function MapView({ events }: MapViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet components to avoid SSR issues
    import('./MapContainer').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  const eventsWithCoords = events.filter((e) => e.coordinates);

  if (!MapComponent) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-8 text-center border border-gray-700/50">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
        <MapComponent
          events={eventsWithCoords}
          onEventSelect={setSelectedEvent}
          selectedEvent={selectedEvent}
        />
      </div>

      {selectedEvent && (
        <div className="max-w-md mx-auto">
          <EventCard event={selectedEvent} />
        </div>
      )}

      {!selectedEvent && (
        <p className="text-gray-500 text-center">
          Click on a marker to see event details. Showing {eventsWithCoords.length} events with locations.
        </p>
      )}
    </div>
  );
}
