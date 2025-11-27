'use client';

import { Event } from '@/types/event';
import { Calendar, MapPin, Clock, ExternalLink, Ticket } from 'lucide-react';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

const eventTypeColors: Record<string, string> = {
  'Art Show': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Party': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Wellness': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Conference': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Networking': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Pop Up': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export default function EventCard({ event, compact = false }: EventCardProps) {
  const typeColor = eventTypeColors[event.eventType] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateDisplay = event.startDate
    ? event.endDate && event.startDate !== event.endDate
      ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
      : formatDate(event.startDate)
    : 'Date TBA';

  if (compact) {
    return (
      <div className="p-3 bg-[#1a1a2e] rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-colors">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-100 truncate">{event.event}</h4>
            <p className="text-sm text-gray-400">{event.neighborhood || 'Location TBA'}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${typeColor} whitespace-nowrap`}>
            {event.eventType}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-700/50 hover:border-purple-500/30">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-100 leading-tight">
            {event.event}
          </h3>
          <span className={`text-xs px-3 py-1 rounded-full border ${typeColor} whitespace-nowrap`}>
            {event.eventType}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500 flex-shrink-0" />
            <span>{dateDisplay}</span>
          </div>

          {event.schedule && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500 flex-shrink-0" />
              <span className="line-clamp-1">{event.schedule}</span>
            </div>
          )}

          {event.neighborhood && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              <span>{event.neighborhood}</span>
            </div>
          )}

          {event.address && (
            <p className="text-gray-500 text-xs pl-6 line-clamp-2">{event.address}</p>
          )}

          {event.notes && (
            <p className="text-orange-400 text-xs italic mt-2">{event.notes}</p>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700/50">
          {event.ticketsLink && (
            <a
              href={event.ticketsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
            >
              <Ticket size={14} />
              <span>Tickets</span>
            </a>
          )}
          {event.link && event.link !== event.ticketsLink && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white px-3 py-2 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700/50 transition-colors"
            >
              <ExternalLink size={14} />
              <span>More Info</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
