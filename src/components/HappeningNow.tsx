'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Event } from '@/types/event';
import { Radio } from 'lucide-react';

interface HappeningNowProps {
  events: Event[];
}

// Parse date string in various formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try MM/DD/YYYY format
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1;
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    return new Date(year, month, day);
  }

  // Try YYYY-MM-DD format
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  // Fallback
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Check if an event is happening today
function isEventHappeningNow(event: Event): boolean {
  if (!event.startDate) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startDate = parseDate(event.startDate);
  if (!startDate) return false;

  const endDate = event.endDate ? parseDate(event.endDate) : startDate;
  if (!endDate) return false;

  // Normalize to just dates
  const eventStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const eventEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  // Check if today falls within the event date range
  return todayStart >= eventStart && todayStart <= eventEnd;
}

// Scroll to event card on the page
function scrollToEvent(eventId: number) {
  const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
  if (eventCard) {
    eventCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Add a brief highlight effect
    eventCard.classList.add('ring-2', 'ring-green-500', 'ring-offset-2', 'ring-offset-[#0a0a0f]');
    setTimeout(() => {
      eventCard.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2', 'ring-offset-[#0a0a0f]');
    }, 2000);
  }
}

export default function HappeningNow({ events }: HappeningNowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(checkVisibility, 60000);
    return () => clearInterval(interval);
  }, [happeningNowEvents.length]);

  if (!isVisible || happeningNowEvents.length === 0) {
    return null;
  }

  // Duplicate events for seamless infinite scroll
  const duplicatedEvents = [...happeningNowEvents, ...happeningNowEvents];

  return (
    <div className="mb-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/30 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Live indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
            <Radio size={14} />
            Live
          </span>
        </div>

        {/* Continuous scrolling ticker */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-hidden relative ticker-fade"
        >
          <div className="flex gap-3 animate-ticker">
            {duplicatedEvents.map((event, index) => (
              <button
                key={`${event.id}-${index}`}
                onClick={() => scrollToEvent(event.id)}
                className="flex-shrink-0 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:text-green-200 transition-colors whitespace-nowrap"
              >
                {event.event}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
