'use client';

import { useMemo } from 'react';
import { getEvents } from '@/lib/events';
import MapView from '@/components/MapView';

export default function MapPage() {
  const events = useMemo(() => getEvents(), []);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">
          Event Map
        </h1>
        <p className="text-gray-400">
          Explore Miami Art Basel venues across the city
        </p>
      </div>

      <MapView events={events} />
    </div>
  );
}
