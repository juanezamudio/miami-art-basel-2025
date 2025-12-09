'use client';

import { useState, useEffect } from 'react';
import { Heart, Calendar, Sparkles } from 'lucide-react';

// Art Basel 2025 dates
const EVENT_START_DATE_2025 = new Date('2025-11-30T00:00:00');
const EVENT_END_DATE_2025 = new Date('2025-12-09T23:59:59');

// Art Basel 2026 dates (typically first week of December)
const EVENT_START_DATE_2026 = new Date('2026-12-01T00:00:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [status, setStatus] = useState<'before' | 'during' | 'after'>('before');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      if (now < EVENT_START_DATE_2025) {
        // Before Art Basel 2025
        setStatus('before');
        const difference = EVENT_START_DATE_2025.getTime() - now.getTime();

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else if (now <= EVENT_END_DATE_2025) {
        // During Art Basel 2025
        setStatus('during');
        setTimeLeft(null);
      } else {
        // After Art Basel 2025 - countdown to 2026
        setStatus('after');
        const difference = EVENT_START_DATE_2026.getTime() - now.getTime();

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Countdown display component
  const CountdownDisplay = ({ label }: { label: string }) => {
    if (!timeLeft) return null;

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="flex gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-purple-600 to-purple-800 text-white text-2xl sm:text-3xl font-bold px-3 sm:px-4 py-2 rounded-lg min-w-[60px] sm:min-w-[70px] text-center" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {timeLeft.days}
            </div>
            <div className="text-gray-500 text-xs mt-1">days</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-pink-600 to-pink-800 text-white text-2xl sm:text-3xl font-bold px-3 sm:px-4 py-2 rounded-lg min-w-[60px] sm:min-w-[70px] text-center" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs mt-1">hours</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-orange-500 to-orange-700 text-white text-2xl sm:text-3xl font-bold px-3 sm:px-4 py-2 rounded-lg min-w-[60px] sm:min-w-[70px] text-center" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs mt-1">mins</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-gray-600 to-gray-800 text-white text-2xl sm:text-3xl font-bold px-3 sm:px-4 py-2 rounded-lg min-w-[60px] sm:min-w-[70px] text-center" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs mt-1">secs</div>
          </div>
        </div>
      </div>
    );
  };

  // During Art Basel 2025
  if (status === 'during') {
    return (
      <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>Art Basel Miami is Happening Now!</span>
      </div>
    );
  }

  // After Art Basel 2025 - Thank you message + countdown to 2026
  if (status === 'after') {
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Thank you message */}
        <div className="max-w-2xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <Sparkles size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Art Basel Miami 2025</span>
            <Sparkles size={20} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Thank You for an Incredible Week!
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Art Basel Miami 2025 has officially wrapped, and what a journey it&apos;s been!
            From stunning exhibitions to unforgettable parties, this year&apos;s event brought
            together art lovers, creators, and dreamers from around the world.
          </p>

          <div className="flex items-center justify-center gap-2 text-pink-400">
            <Heart size={16} fill="currentColor" />
            <p className="text-sm">
              Thank you for making Basel.ai your guide to Art Basel Miami 2025.
            </p>
            <Heart size={16} fill="currentColor" />
          </div>

          <p className="text-gray-400 text-sm">
            We&apos;re honored to be your official events platform and can&apos;t wait to bring you
            even more next year. Stay tuned for Art Basel Miami 2026!
          </p>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <Calendar size={16} className="text-purple-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>

        {/* Countdown to 2026 */}
        <CountdownDisplay label="Art Basel Miami 2026 starts in" />
      </div>
    );
  }

  // Before Art Basel 2025
  return <CountdownDisplay label="Art Basel Miami 2025 starts in" />;
}
