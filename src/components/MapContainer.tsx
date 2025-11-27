'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '@/types/event';

interface MapContainerProps {
  events: Event[];
  onEventSelect: (event: Event | null) => void;
  selectedEvent: Event | null;
}

const eventTypeColors: Record<string, string> = {
  'Art Show': '#9333ea',
  'Party': '#ec4899',
  'Wellness': '#22c55e',
  'Conference': '#3b82f6',
  'Networking': '#f97316',
  'Pop Up': '#06b6d4',
};

export default function MapContainer({
  events,
  onEventSelect,
  selectedEvent,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Miami
    const map = L.map(mapRef.current).setView([25.7907, -80.18], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for events
    events.forEach((event) => {
      if (!event.coordinates) return;

      const color = eventTypeColors[event.eventType] || '#6b7280';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([event.coordinates.lat, event.coordinates.lng], {
        icon,
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<strong>${event.event}</strong><br/>${event.eventType}<br/>${event.neighborhood || 'Miami'}`
        );

      marker.on('click', () => {
        onEventSelect(event);
      });

      markersRef.current.push(marker);
    });
  }, [events, onEventSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEvent?.coordinates) return;

    mapInstanceRef.current.setView(
      [selectedEvent.coordinates.lat, selectedEvent.coordinates.lng],
      14,
      { animate: true }
    );
  }, [selectedEvent]);

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[500px] w-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#1a1a2e] rounded-lg shadow-lg p-3 z-[1000] border border-gray-700/50">
        <div className="text-xs font-semibold text-gray-300 mb-2">Event Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9333ea' }} />
            <span className="text-xs text-gray-400">Art Show</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ec4899' }} />
            <span className="text-xs text-gray-400">Party</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs text-gray-400">Wellness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs text-gray-400">Conference</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="text-xs text-gray-400">Networking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
            <span className="text-xs text-gray-400">Pop Up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
