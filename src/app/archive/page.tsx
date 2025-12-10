'use client';

import { useMemo, useRef, useState } from 'react';
import { getArchiveEvents, getArchiveEventTypes, getArchiveYears } from '@/lib/archive';
import EventCard from '@/components/EventCard';
import { Share2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArchivePage() {
  // For now, default to 2025. In the future, could add year selector
  const selectedYear = 2025;
  const availableYears = useMemo(() => getArchiveYears(), []);

  const allEvents = useMemo(() => getArchiveEvents(selectedYear), [selectedYear]);
  const eventTypes = useMemo(() => getArchiveEventTypes(selectedYear), [selectedYear]);
  const posterRef = useRef<HTMLDivElement>(null);
  const [showCopied, setShowCopied] = useState(false);

  // Group events by type for the poster (unique titles only)
  const eventsByType = useMemo(() => {
    const grouped: Record<string, Set<string>> = {};
    allEvents.forEach(event => {
      const type = event.eventType || 'Other';
      if (!grouped[type]) {
        grouped[type] = new Set();
      }
      grouped[type].add(event.event); // Set automatically handles duplicates
    });
    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(grouped).forEach(type => {
      result[type] = Array.from(grouped[type]).sort();
    });
    return result;
  }, [allEvents]);

  // Get unique neighborhoods for stats
  const neighborhoods = useMemo(() => {
    const hoods = new Set(allEvents.map(e => e.neighborhood).filter(Boolean));
    return hoods.size;
  }, [allEvents]);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out all ${allEvents.length} events from Art Basel Miami 2025!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Art Basel Miami 2025 Archive',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  // Type colors for the poster
  const typeColors: Record<string, string> = {
    'Art Show': 'text-purple-300',
    'Party': 'text-pink-300',
    'Wellness': 'text-green-300',
    'Conference': 'text-blue-300',
    'Networking': 'text-orange-300',
    'Pop Up': 'text-cyan-300',
  };

  const typeBgColors: Record<string, string> = {
    'Art Show': 'bg-purple-500/20 border-purple-500/30',
    'Party': 'bg-pink-500/20 border-pink-500/30',
    'Wellness': 'bg-green-500/20 border-green-500/30',
    'Conference': 'bg-blue-500/20 border-blue-500/30',
    'Networking': 'bg-orange-500/20 border-orange-500/30',
    'Pop Up': 'bg-cyan-500/20 border-cyan-500/30',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors"
            >
              {showCopied ? <Check size={18} /> : <Share2 size={18} />}
              <span>{showCopied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Festival Poster */}
        <div
          ref={posterRef}
          className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] rounded-2xl border border-gray-700/50 overflow-hidden mb-12"
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6 sm:p-10">
            {/* Poster Header */}
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-xs text-gray-400 uppercase tracking-widest mb-4">
                Archive
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Art Basel Miami
                </span>
              </h1>
              <div className="text-6xl sm:text-7xl md:text-8xl font-black text-white/90 tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                2025
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-gray-400 text-sm">
                <span>November 30 - December 9</span>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span>Miami, FL</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-6 py-4 border-y border-gray-700/50">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {eventTypes.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {neighborhoods}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Neighborhoods</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  10
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Days</div>
              </div>
            </div>

            {/* Category Stats Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-10">
              <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/30">
                <div className="text-xl sm:text-2xl font-bold text-purple-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Art Show').length}
                </div>
                <div className="text-gray-400 text-xs">Art Shows</div>
              </div>
              <div className="bg-pink-500/10 rounded-xl p-3 text-center border border-pink-500/30">
                <div className="text-xl sm:text-2xl font-bold text-pink-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Party').length}
                </div>
                <div className="text-gray-400 text-xs">Parties</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/30">
                <div className="text-xl sm:text-2xl font-bold text-green-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Wellness').length}
                </div>
                <div className="text-gray-400 text-xs">Wellness</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/30">
                <div className="text-xl sm:text-2xl font-bold text-blue-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Conference').length}
                </div>
                <div className="text-gray-400 text-xs">Conferences</div>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/30">
                <div className="text-xl sm:text-2xl font-bold text-orange-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Networking').length}
                </div>
                <div className="text-gray-400 text-xs">Networking</div>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/30">
                <div className="text-xl sm:text-2xl font-bold text-cyan-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {allEvents.filter((e) => e.eventType === 'Pop Up').length}
                </div>
                <div className="text-gray-400 text-xs">Pop Ups</div>
              </div>
            </div>

            {/* Event Names by Category - Festival Lineup Style */}
            <div className="space-y-6">
              {Object.entries(eventsByType).map(([type, events]) => (
                <div key={type} className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider mb-3 border ${typeBgColors[type] || 'bg-gray-500/20 border-gray-500/30'} ${typeColors[type] || 'text-gray-300'}`}>
                    {type}
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {events.map((eventName, index) => (
                      <span key={index} className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">
                        {eventName}
                        {index < events.length - 1 && (
                          <span className="text-gray-600 ml-3">•</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Poster Footer */}
            <div className="mt-10 pt-6 border-t border-gray-700/50 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Basel.ai
              </div>
              <p className="text-gray-500 text-xs">
                Your Official Guide to Art Basel Miami
              </p>
            </div>
          </div>
        </div>

        {/* Archived Events Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">All 2025 Events</h2>
          <p className="text-gray-400 mb-6">
            Browse all {allEvents.length} events from Art Basel Miami 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
