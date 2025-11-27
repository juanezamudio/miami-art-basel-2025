'use client';

import { useState, useMemo } from 'react';
import { getEvents, getEventTypes, getNeighborhoods, filterEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import DonationBar from '@/components/DonationBar';

// Pluralize event type names correctly
function pluralizeType(type: string): string {
  const plurals: Record<string, string> = {
    'Party': 'Parties',
    'Wellness': 'Wellness',
    'Art Show': 'Art Shows',
    'Conference': 'Conferences',
    'Networking': 'Networking',
    'Pop Up': 'Pop Ups',
  };
  return plurals[type] || `${type}s`;
}

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

  const scrollToSection = (sectionId: string) => {
    // Clear filters first so the section exists
    clearFilters();
    // Use setTimeout to allow React to re-render with cleared filters
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

      {/* Donation Bar */}
      <DonationBar />

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-8">
        <button
          onClick={() => scrollToSection('art-show')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">
            {allEvents.filter((e) => e.eventType === 'Art Show').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Art Shows</div>
        </button>
        <button
          onClick={() => scrollToSection('party')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {allEvents.filter((e) => e.eventType === 'Party').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Parties</div>
        </button>
        <button
          onClick={() => scrollToSection('wellness')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-green-400">
            {allEvents.filter((e) => e.eventType === 'Wellness').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Wellness</div>
        </button>
        <button
          onClick={() => scrollToSection('conference')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">
            {allEvents.filter((e) => e.eventType === 'Conference').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Conferences</div>
        </button>
        <button
          onClick={() => scrollToSection('networking')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-orange-400">
            {allEvents.filter((e) => e.eventType === 'Networking').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Networking</div>
        </button>
        <button
          onClick={() => scrollToSection('pop-up')}
          className="bg-[#1a1a2e] rounded-xl shadow-lg p-3 sm:p-4 text-center border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
            {allEvents.filter((e) => e.eventType === 'Pop Up').length}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Pop Ups</div>
        </button>
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
        Object.entries(groupedEvents).map(([type, events]) => {
          const typeColors: Record<string, string> = {
            'Art Show': 'bg-purple-500',
            'Party': 'bg-pink-500',
            'Wellness': 'bg-green-500',
            'Conference': 'bg-blue-500',
            'Networking': 'bg-orange-500',
            'Pop Up': 'bg-cyan-500',
          };
          const anchorId = type.toLowerCase().replace(/\s+/g, '-');

          return (
            <div key={type} id={anchorId} className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-500'}`} />
                {pluralizeType(type)}
                <span className="text-gray-500 font-normal text-lg">({events.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })
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
