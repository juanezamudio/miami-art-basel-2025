'use client';

import { useMemo } from 'react';
import { getEvents } from '@/lib/events';
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  const events = useMemo(() => getEvents(), []);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">
          Event Calendar
        </h1>
        <p className="text-gray-400">
          Browse events by date during Miami Art Basel Week
        </p>
      </div>

      <CalendarView events={events} />
    </div>
  );
}
