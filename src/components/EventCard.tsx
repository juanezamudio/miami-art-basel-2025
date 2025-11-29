'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import { Calendar, MapPin, Clock, Tag, Ticket, Share2, Copy, MoreVertical, Flag, Check } from 'lucide-react';
import ReportIssueModal from './ReportIssueModal';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showMapsMenu, setShowMapsMenu] = useState(false);
  const typeColor = eventTypeColors[event.eventType] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  const getGoogleMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getAppleMapsUrl = (address: string) => {
    return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  };

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

  const getShareText = () => {
    const shareText = `${event.event}${event.neighborhood ? ` - ${event.neighborhood}` : ''}${event.startDate ? ` (${dateDisplay})` : ''}`;
    const shareUrl = event.ticketsLink || '';
    return { shareText, shareUrl };
  };

  const handleShare = async () => {
    const { shareText, shareUrl } = getShareText();

    const shareData = {
      title: event.event,
      text: shareText,
      url: shareUrl || window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed - silently ignore
      }
    } else {
      // Fallback for browsers without Web Share API
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    const { shareText, shareUrl } = getShareText();
    const clipboardText = shareUrl ? `${shareText}\n${shareUrl}` : shareText;
    await navigator.clipboard.writeText(clipboardText);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

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
    <div className="h-full flex flex-col bg-[#1a1a2e] rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-700/50 hover:border-purple-500/30">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-100 leading-tight">
            {event.event}
          </h3>
          <span className={`text-xs px-3 py-1 rounded-full border ${typeColor} whitespace-nowrap`}>
            {event.eventType}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-300 flex-1">
          {event.notes && (
            <p className="text-orange-400 text-xs italic">{event.notes}</p>
          )}

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

          {event.ticketPrice && event.ticketPrice.toLowerCase() !== 'tbd' && (
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-500 flex-shrink-0" />
              <span>{event.ticketPrice.toLowerCase() === 'free' ? 'Free' : `Starting at ${event.ticketPrice}`}</span>
            </div>
          )}

          {event.neighborhood && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              <span>{event.neighborhood}</span>
            </div>
          )}

          {event.address && (
            <div className="relative pl-6">
              <button
                onClick={() => setShowMapsMenu(!showMapsMenu)}
                className="text-gray-500 text-xs text-left line-clamp-2 hover:text-purple-400 hover:underline transition-colors cursor-pointer"
              >
                {event.address}
              </button>
              {showMapsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMapsMenu(false)}
                  />
                  <div className="absolute left-6 top-full mt-1 bg-[#252542] border border-gray-700 rounded-lg shadow-xl z-20 py-1 min-w-[150px]">
                    <a
                      href={getGoogleMapsUrl(event.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMapsMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>Google Maps</span>
                    </a>
                    <a
                      href={getAppleMapsUrl(event.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMapsMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.95 1.54 2.2 2.86 3.16 4.4.47.75.81 1.45 1.17 2.26.26.55.47 1.5 1.26 1.5s1-.95 1.25-1.5c.37-.81.7-1.51 1.17-2.26.96-1.53 2.21-2.85 3.16-4.4C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7zm0 9.75c-1.52 0-2.75-1.23-2.75-2.75S10.48 6.25 12 6.25s2.75 1.23 2.75 2.75-1.23 2.75-2.75 2.75z"/>
                      </svg>
                      <span>Apple Maps</span>
                    </a>
                  </div>
                </>
              )}
            </div>
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
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-700/50"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 bg-[#252542] border border-gray-700 rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      handleCopy();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      handleShare();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                  >
                    <Flag size={14} />
                    <span>Report Issue</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Copy Toast */}
        {showToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-green-500/90 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-fade-in">
            <Check size={16} />
            <span>Copied to clipboard!</span>
          </div>
        )}
      </div>

      <ReportIssueModal
        event={event}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
