'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import { Calendar, MapPin, Clock, Tag, Ticket, Heart, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const allEvents = useMemo(() => getEvents(), []);
  const [showModal, setShowModal] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  const event = useMemo(() => {
    return allEvents.find((e) => String(e.id) === eventId);
  }, [allEvents, eventId]);

  const isSaved = event ? isFavorite(String(event.id)) : false;

  // Get related events (same type or neighborhood)
  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return allEvents
      .filter(
        (e) =>
          e.id !== event.id &&
          (e.eventType === event.eventType || e.neighborhood === event.neighborhood)
      )
      .slice(0, 6);
  }, [allEvents, event]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const dateDisplay = event?.startDate
    ? event.endDate && event.startDate !== event.endDate
      ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
      : formatDate(event.startDate)
    : 'Date TBA';

  const eventTypeColors: Record<string, string> = {
    'Art Show': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Party': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Wellness': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Conference': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Networking': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'Pop Up': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  if (!event) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Event Not Found</h1>
        <p className="text-gray-400 mb-6">This event may no longer be available.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
        >
          <ArrowLeft size={18} />
          Browse All Events
        </Link>
      </div>
    );
  }

  const typeColor = eventTypeColors[event.eventType] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  return (
    <div>
      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              {/* Event Type Badge */}
              <div className="mb-4">
                <span className={`text-sm px-3 py-1 rounded-full border ${typeColor}`}>
                  {event.eventType}
                </span>
              </div>

              {/* Event Title */}
              <h1 className="text-2xl font-bold text-gray-100 mb-4 pr-8">
                {event.event}
              </h1>

              {/* Event Details */}
              <div className="space-y-3 text-gray-300 mb-6">
                {event.notes && (
                  <p className="text-orange-400 text-sm italic">{event.notes}</p>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-500 flex-shrink-0" />
                  <span>{dateDisplay}</span>
                </div>

                {event.schedule && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-gray-500 flex-shrink-0" />
                    <span>{event.schedule}</span>
                  </div>
                )}

                {event.ticketPrice && event.ticketPrice.toLowerCase() !== 'tbd' && (
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-gray-500 flex-shrink-0" />
                    <span>{event.ticketPrice.toLowerCase() === 'free' ? 'Free' : `Starting at ${event.ticketPrice}`}</span>
                  </div>
                )}

                {event.neighborhood && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-500 flex-shrink-0" />
                    <span>{event.neighborhood}</span>
                  </div>
                )}

                {event.address && (
                  <div className="pl-8 text-gray-500 text-sm">
                    {event.address}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {event.ticketsLink && (
                  <a
                    href={event.ticketsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
                  >
                    <Ticket size={18} />
                    <span>Get Tickets</span>
                  </a>
                )}
                <button
                  onClick={() => toggleFavorite(String(event.id))}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors border ${
                    isSaved
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                      : 'bg-gray-700/30 text-gray-300 border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-t border-gray-700/50">
              <p className="text-center text-gray-300 text-sm mb-3">
                Discover more events at Art Basel Miami 2025
              </p>
              <Link
                href="/"
                className="block w-full text-center py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Background Content - Related Events */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {event.event}
        </h1>
        <p className="text-gray-400">
          {event.eventType} • {event.neighborhood || 'Miami'}
        </p>
      </div>

      {/* Show the event card */}
      <div className="max-w-md mx-auto mb-12">
        <EventCard event={event} />
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
