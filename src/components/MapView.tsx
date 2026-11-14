'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';
import type { MapContainerProps } from './MapContainer';

interface MapViewProps {
  events: Event[];
}

export default function MapView({ events }: MapViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<MapContainerProps> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet components to avoid SSR issues
    import('./MapContainer').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  const eventsWithCoords = events.filter((e) => e.coordinates);
  const approximateCount = eventsWithCoords.filter((e) => e.coordinateAccuracy === 'neighborhood').length;

  if (!MapComponent) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-8 text-center border border-gray-700/50">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approximateCount > 0 && (
        <p className="text-sm text-amber-300 text-center">
          {approximateCount} events use approximate neighborhood locations. Events in the same
          neighborhood share a marker location. Use event addresses for directions.
        </p>
      )}
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
