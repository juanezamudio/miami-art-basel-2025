'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

// Single event button component
function EventButton({ event, keyPrefix }: { event: Event; keyPrefix: string }) {
  return (
    <button
      key={`${keyPrefix}-${event.id}`}
      onClick={() => scrollToEvent(event.id)}
      className="flex-shrink-0 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:text-green-200 transition-colors whitespace-nowrap"
    >
      {event.event}
    </button>
  );
}

export default function HappeningNow({ events }: HappeningNowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);
  const setWidthRef = useRef(0);
  const [, forceUpdate] = useState(0);

  // Filter events happening now (memoized)
  const filteredEvents = useMemo(() => {
    return events.filter(isEventHappeningNow);
  }, [events]);

  // Shuffle only once when filtered events change, using a stable shuffle
  const [happeningNowEvents, setHappeningNowEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fisher-Yates shuffle for stable randomization
    const shuffled = [...filteredEvents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setHappeningNowEvents(shuffled);
  }, [filteredEvents]);

  // Check visibility based on current date
  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      const eventStart = new Date('2025-11-30');
      const eventEnd = new Date('2025-12-09T23:59:59');
      setIsVisible(now >= eventStart && now <= eventEnd && filteredEvents.length > 0);
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 60000);
    return () => clearInterval(interval);
  }, [filteredEvents.length]);

  // Check if mobile and measure container
  useEffect(() => {
    const updateMeasurements = () => {
      setIsMobile(window.innerWidth < 640);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, []);

  // Re-measure container when it becomes visible
  useEffect(() => {
    if (isVisible && containerRef.current) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible, happeningNowEvents]);

  // Measure set width once and cache it
  useEffect(() => {
    if (contentRef.current && happeningNowEvents.length > 0 && containerWidth > 0) {
      const timer = setTimeout(() => {
        if (contentRef.current) {
          const firstSet = contentRef.current.children[0] as HTMLElement;
          if (firstSet) {
            setWidthRef.current = firstSet.offsetWidth;
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [happeningNowEvents, containerWidth]);

  // Animation loop - use refs to avoid re-creating callback
  const animate = useCallback((timestamp: number) => {
    if (!containerRef.current || !contentRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    if (isPausedRef.current) {
      // Keep updating lastTimeRef while paused so there's no jump when resuming
      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Speed in pixels per millisecond
    const speed = isMobile ? 0.03 : 0.05;
    positionRef.current += deltaTime * speed;

    // Use cached set width for consistent looping
    const setWidth = setWidthRef.current;
    if (setWidth > 0 && positionRef.current >= setWidth) {
      positionRef.current = positionRef.current - setWidth;
    }

    // Apply transform directly to DOM for performance
    contentRef.current.style.transform = `translateX(-${positionRef.current}px)`;

    animationRef.current = requestAnimationFrame(animate);
  }, [isMobile]);

  // Start animation
  useEffect(() => {
    if (isVisible && happeningNowEvents.length > 0) {
      positionRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, happeningNowEvents, animate]);

  // Reset position when events change
  useEffect(() => {
    positionRef.current = 0;
    forceUpdate(n => n + 1);
  }, [happeningNowEvents]);

  // Buffer space = container width so events fully exit before reappearing
  // This ensures the last event scrolls completely off before the first event comes back
  const bufferSpace = containerWidth || 500; // fallback to 500px if not measured yet

  if (!isVisible || happeningNowEvents.length === 0) {
    return null;
  }

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
          ref={containerRef}
          className="flex-1 overflow-hidden relative ticker-fade"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
          onTouchStart={() => { isPausedRef.current = true; }}
          onTouchEnd={() => { isPausedRef.current = false; }}
        >
          <div
            ref={contentRef}
            className="flex items-center"
            style={{ willChange: 'transform' }}
          >
            {/* First set of events + buffer space (container width) */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              style={{ paddingRight: `${bufferSpace}px` }}
            >
              {happeningNowEvents.map((event) => (
                <EventButton key={`set1-${event.id}`} event={event} keyPrefix="set1" />
              ))}
            </div>

            {/* Second set - duplicate for seamless loop + buffer space */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              style={{ paddingRight: `${bufferSpace}px` }}
            >
              {happeningNowEvents.map((event) => (
                <EventButton key={`set2-${event.id}`} event={event} keyPrefix="set2" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
