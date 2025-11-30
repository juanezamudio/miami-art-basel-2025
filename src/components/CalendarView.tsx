'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';

interface CalendarViewProps {
  events: Event[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ events }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Art Basel 2025 dates: December 2-9
  const baselDates = [
    new Date(2025, 10, 30), // Nov 30
    new Date(2025, 11, 1),  // Dec 1
    new Date(2025, 11, 2),  // Dec 2
    new Date(2025, 11, 3),  // Dec 3
    new Date(2025, 11, 4),  // Dec 4
    new Date(2025, 11, 5),  // Dec 5
    new Date(2025, 11, 6),  // Dec 6
    new Date(2025, 11, 7),  // Dec 7
    new Date(2025, 11, 8),  // Dec 8
    new Date(2025, 11, 9),  // Dec 9
  ];

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      if (!event.startDate) return false;

      const startDate = new Date(event.startDate);
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const eventTypeColors: Record<string, string> = {
    'Art Show': 'bg-purple-500',
    'Party': 'bg-pink-500',
    'Wellness': 'bg-green-500',
    'Conference': 'bg-blue-500',
    'Networking': 'bg-orange-500',
    'Pop Up': 'bg-cyan-500',
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <h2 className="text-xl font-bold text-center">Miami Art Basel Week 2025</h2>
          <p className="text-center text-purple-200 text-lg mt-1">
            November 30 - December 9
          </p>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-1 p-4">
          {baselDates.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 md:p-4 rounded-lg transition-all flex flex-col items-center ${
                  isSelected
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : hasEvents
                    ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20'
                    : 'bg-[#0a0a0f] hover:bg-gray-800 border border-gray-700/50'
                }`}
              >
                <span className={`text-xs font-medium ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                  {DAYS[date.getDay()]}
                </span>
                <span
                  className={`text-lg md:text-2xl font-bold ${
                    isSelected ? 'text-white' : 'text-gray-200'
                  }`}
                >
                  {date.getDate()}
                </span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-purple-200' : 'text-gray-500'
                  }`}
                >
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayEvents.length <= 3 ? (
                      dayEvents.slice(0, 3).map((e, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            eventTypeColors[e.eventType] || 'bg-gray-400'
                          }`}
                        />
                      ))
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-purple-400'
                        }`}
                      >
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-400">Art Show</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-gray-400">Party</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Wellness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">Conference</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-400">Networking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-gray-400">Pop Up</span>
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-4">
            Events on{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            <span className="text-gray-500 font-normal ml-2">
              ({selectedEvents.length} events)
            </span>
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No events scheduled for this date.
            </p>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-gray-500 text-center py-8">
          Click on a date to see events scheduled for that day.
        </p>
      )}
    </div>
  );
}
