'use client';

import { useMemo, useState } from 'react';
import { getEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart, CalendarHeart, Share2, Check, Copy } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  const { favorites } = useFavorites();
  const allEvents = useMemo(() => getEvents(), []);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const savedEvents = useMemo(() => {
    return allEvents
      .filter((event) => favorites.includes(String(event.id)))
      .sort((a, b) => {
        // Sort by date, TBA events go to end
        const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB;
        return a.event.localeCompare(b.event);
      });
  }, [allEvents, favorites]);

  // Group saved events by date for schedule view
  const eventsByDate = useMemo(() => {
    const groups: Record<string, typeof savedEvents> = {};
    savedEvents.forEach((event) => {
      const dateKey = event.startDate || 'TBA';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return groups;
  }, [savedEvents]);

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === 'TBA') return 'Date TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getShareUrl = () => {
    const encoded = btoa(favorites.join(','));
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/shared-schedule?s=${encoded}`;
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: 'My Art Basel 2025 Schedule',
      text: `Check out my Art Basel Miami 2025 schedule with ${savedEvents.length} events!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-3 flex items-center justify-center gap-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <CalendarHeart className="text-pink-500" size={36} />
          My Schedule
        </h1>
        <p className="text-gray-400 text-lg">
          {savedEvents.length === 0
            ? 'Save events to build your personalized Art Basel schedule'
            : `You have ${savedEvents.length} event${savedEvents.length === 1 ? '' : 's'} saved`}
        </p>
      </div>

      {/* Share Button */}
      {savedEvents.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            <Share2 size={18} />
            <span>Share My Schedule</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Share Your Schedule</h3>
              <p className="text-gray-400 text-sm mb-4">
                Share your Art Basel schedule with friends!
              </p>
              <div className="bg-[#0a0a0f] rounded-lg p-3 mb-4 break-all text-sm text-gray-300 border border-gray-700">
                {getShareUrl()}
              </div>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 border-t border-gray-700/50">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a2e] rounded-xl border border-gray-700/50">
          <Heart size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No saved events yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Browse events and tap the heart icon to save them to your personal schedule.
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
