'use client';

import { useState, useMemo } from 'react';
import { getEvents, getEventTypes, getNeighborhoods, filterEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('All');
  const [neighborhood, setNeighborhood] = useState('All');
  const [date, setDate] = useState('');

  const allEvents = useMemo(() => getEvents(), []);
  const eventTypes = useMemo(() => getEventTypes(), []);
  const neighborhoods = useMemo(() => getNeighborhoods(), []);

  const filteredEvents = useMemo(() => {
    return filterEvents(allEvents, { search, eventType, neighborhood, date });
  }, [allEvents, search, eventType, neighborhood, date]);

  const clearFilters = () => {
    setSearch('');
    setEventType('All');
    setNeighborhood('All');
    setDate('');
  };

  // Group events by type for display
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof filteredEvents> = {};
    filteredEvents.forEach((event) => {
      const type = event.eventType || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(event);
    });
    return groups;
  }, [filteredEvents]);

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
          Miami Art Basel 2025
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
          Your complete guide to art shows, parties, and wellness events during Miami Art Week.
          November 30 - December 9, 2025.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-purple-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">
            {allEvents.filter((e) => e.eventType === 'Art Show').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Art Shows</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-pink-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {allEvents.filter((e) => e.eventType === 'Party').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Parties</div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-green-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-green-400">
            {allEvents.filter((e) => e.eventType === 'Wellness').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Wellness</div>
        </div>
      </div>

      {/* Filters */}
      <EventFilters
        search={search}
        onSearchChange={setSearch}
        eventType={eventType}
        onEventTypeChange={setEventType}
        neighborhood={neighborhood}
        onNeighborhoodChange={setNeighborhood}
        date={date}
        onDateChange={setDate}
        eventTypes={eventTypes}
        neighborhoods={neighborhoods}
        onClearFilters={clearFilters}
      />

      {/* Results count */}
      <div className="mb-4 text-gray-400">
        Showing {filteredEvents.length} of {allEvents.length} events
      </div>

      {/* Event Grid */}
      {Object.keys(groupedEvents).length > 0 ? (
        Object.entries(groupedEvents).map(([type, events]) => (
          <div key={type} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  type === 'Art Show'
                    ? 'bg-purple-500'
                    : type === 'Party'
                    ? 'bg-pink-500'
                    : type === 'Wellness'
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`}
              />
              {type}s
              <span className="text-gray-500 font-normal text-lg">({events.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-purple-400 hover:text-purple-300 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
