'use client';

import { useState, useEffect, useMemo } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';
import { Radio, ChevronLeft, ChevronRight } from 'lucide-react';

interface HappeningNowProps {
  events: Event[];
}

// Check if an event is happening right now
function isEventHappeningNow(event: Event): boolean {
  if (!event.startDate) return false;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const startDate = event.startDate;
  const endDate = event.endDate || event.startDate;

  // Check if today falls within the event date range
  return today >= startDate && today <= endDate;
}

export default function HappeningNow({ events }: HappeningNowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const happeningNowEvents = useMemo(() => {
    return events.filter(isEventHappeningNow);
  }, [events]);

  // Check visibility based on current date
  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      const eventStart = new Date('2025-11-30');
      const eventEnd = new Date('2025-12-09T23:59:59');
      setIsVisible(now >= eventStart && now <= eventEnd && happeningNowEvents.length > 0);
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [happeningNowEvents.length]);

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % happeningNowEvents.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + happeningNowEvents.length) % happeningNowEvents.length);
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (happeningNowEvents.length <= 1) return;
    const interval = setInterval(nextEvent, 5000);
    return () => clearInterval(interval);
  }, [happeningNowEvents.length]);

  if (!isVisible || happeningNowEvents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-500/10 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
            <Radio size={18} />
            Happening Now
          </h2>
          <span className="text-green-500/70 text-sm">
            ({happeningNowEvents.length} event{happeningNowEvents.length === 1 ? '' : 's'})
          </span>
        </div>

        {happeningNowEvents.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevEvent}
              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-green-500/70 text-sm min-w-[3rem] text-center">
              {currentIndex + 1} / {happeningNowEvents.length}
            </span>
            <button
              onClick={nextEvent}
              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Event Display */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <EventCard event={happeningNowEvents[currentIndex]} />
        </div>
      </div>

      {/* Dots indicator for mobile */}
      {happeningNowEvents.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4">
          {happeningNowEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-green-400' : 'bg-green-500/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
