'use client';

import { useState, useEffect } from 'react';
import { Heart, Calendar, Sparkles, Archive } from 'lucide-react';
import Link from 'next/link';
import NotifyMe2026 from './NotifyMe2026';
import DonationBar from './DonationBar';

// Art Basel 2026 dates (update this each year)
const NEXT_EVENT_START_DATE = new Date('2026-12-01T00:00:00');
const NEXT_EVENT_YEAR = 2026;
const PAST_EVENT_YEAR = 2025;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PostArtBaselHero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = NEXT_EVENT_START_DATE.getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Countdown display component
  const CountdownDisplay = () => {
    if (!timeLeft) return null;

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-gray-400 text-sm">Art Basel Miami {NEXT_EVENT_YEAR} starts in</div>
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

  return (
    <div className="text-center mb-8">
      {/* Hero Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Your Complete <span className="whitespace-nowrap">AI-Powered</span> Guide to
        <br />
        Miami Art Basel {NEXT_EVENT_YEAR}
      </h1>
      <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto px-4 mb-6">
        Discover art shows, parties, and wellness events during Miami Art Week.
      </p>

      {/* Post Art Basel Content */}
      <div className="flex flex-col items-center gap-6">
        {/* Countdown to next year */}
        <CountdownDisplay />

        {/* Donation Bar */}
        <div className="w-full max-w-2xl">
          <DonationBar />
        </div>

        {/* Thank you message card */}
        <div className="max-w-2xl w-full bg-gradient-to-br from-[#1a1a2e]/90 via-[#16162a]/90 to-[#1a1a2e]/90 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-purple-500/5">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Sparkles size={20} />
              <span className="text-sm font-medium uppercase tracking-wider">Art Basel Miami {PAST_EVENT_YEAR}</span>
              <Sparkles size={20} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Thank You for an Incredible Week!
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Art Basel Miami {PAST_EVENT_YEAR} has officially wrapped, and what a journey it&apos;s been!
              From stunning exhibitions to unforgettable parties, this year&apos;s event brought
              together art lovers, creators, and dreamers from around the world.
            </p>

            <div className="flex items-center justify-center gap-2 text-pink-400">
              <Heart size={16} fill="currentColor" />
              <p className="text-sm">
                Thank you for making Basel.ai your guide to Art Basel Miami {PAST_EVENT_YEAR}.
              </p>
              <Heart size={16} fill="currentColor" />
            </div>

            <p className="text-gray-400 text-sm">
              We&apos;re honored to be your official events platform and can&apos;t wait to bring you
              even more next year. Stay tuned for Art Basel Miami {NEXT_EVENT_YEAR}!
            </p>

            {/* Archive Button */}
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
            >
              <Archive size={18} />
              <span>View {PAST_EVENT_YEAR} Archive</span>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <Calendar size={16} className="text-purple-400" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>

        {/* Notify Me for next year */}
        <NotifyMe2026 />
      </div>
    </div>
  );
}
