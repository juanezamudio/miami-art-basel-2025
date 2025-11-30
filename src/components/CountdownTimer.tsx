'use client';

import { useState, useEffect } from 'react';

const EVENT_START_DATE = new Date('2025-11-30T00:00:00');
const EVENT_END_DATE = new Date('2025-12-09T23:59:59');

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

      if (now < EVENT_START_DATE) {
        // Before event
        setStatus('before');
        const difference = EVENT_START_DATE.getTime() - now.getTime();

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else if (now <= EVENT_END_DATE) {
        // During event
        setStatus('during');
        setTimeLeft(null);
      } else {
        // After event
        setStatus('after');
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (status === 'during') {
    return (
      <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>Art Basel is happening now!</span>
      </div>
    );
  }

  if (status === 'after') {
    return (
      <div className="text-gray-400 text-sm">
        Art Basel 2025 has ended. See you next year!
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-gray-400 text-sm">Art Basel starts in</div>
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
}
