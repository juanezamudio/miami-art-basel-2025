'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import { CalendarHeart, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SharedSchedulePage() {
  const searchParams = useSearchParams();
  const [decodedIds, setDecodedIds] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const allEvents = useMemo(() => getEvents(), []);

  useEffect(() => {
    const encoded = searchParams.get('s');
    if (encoded) {
      try {
        const decoded = atob(encoded);
        const ids = decoded.split(',').filter(Boolean);
        setDecodedIds(ids);
      } catch {
        setError(true);
      }
    }
  }, [searchParams]);

  const sharedEvents = useMemo(() => {
    return allEvents
      .filter((event) => decodedIds.includes(String(event.id)))
      .sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;
        return a.event.localeCompare(b.event);
      });
  }, [allEvents, decodedIds]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const groups: Record<string, typeof sharedEvents> = {};
    sharedEvents.forEach((event) => {
      const dateKey = event.startDate || 'TBA';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return groups;
  }, [sharedEvents]);

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === 'TBA') return 'Date TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={64} className="mx-auto text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Invalid Schedule Link</h1>
        <p className="text-gray-400 mb-6">
          This schedule link appears to be invalid or corrupted.
        </p>
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

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-3 flex items-center justify-center gap-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <CalendarHeart className="text-pink-500" size={36} />
          Shared Schedule
        </h1>
        <p className="text-gray-400 text-lg">
          {sharedEvents.length === 0
            ? 'No events in this schedule'
            : `${sharedEvents.length} event${sharedEvents.length === 1 ? '' : 's'} shared with you`}
        </p>
      </div>

      {/* CTA to create own schedule */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 mb-8 border border-purple-500/30 text-center">
        <p className="text-gray-200 mb-4">
          Like what you see? Create your own personalized Art Basel schedule!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
        >
          Start Building My Schedule
        </Link>
      </div>

      {/* Empty State */}
      {sharedEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a2e] rounded-xl border border-gray-700/50">
          <AlertCircle size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No events found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            The events in this schedule may no longer be available.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        /* Schedule View */
        <div className="space-y-8">
          {Object.entries(eventsByDate).map(([dateKey, events]) => (
            <div key={dateKey}>
              <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2 sticky top-0 bg-[#0a0a0f] py-2 z-10">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                {formatDateHeader(dateKey)}
                <span className="text-gray-500 font-normal text-base">
                  ({events.length} event{events.length === 1 ? '' : 's'})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
