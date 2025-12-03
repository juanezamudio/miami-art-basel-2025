'use client';

import Image from 'next/image';
import { track } from '@vercel/analytics';

export default function AdBar() {
  const handleAdClick = () => {
    track('ad_click', {
      advertiser: 'mymarketingpro',
      campaign: 'art_basel_2025',
      ad_name: 'memory_free_leads',
    });
  };

  return (
    <a
      href="http://mymarketingpro.com/memory"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleAdClick}
      className="block mb-8 bg-gradient-to-br from-sky-900/30 to-blue-900/30 rounded-xl border border-sky-500/20 hover:border-sky-500/40 transition-all p-3 sm:p-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        {/* Full Ad Image - scaled down */}
        <div className="relative h-20 sm:h-32 w-full sm:w-auto sm:aspect-[3/1] flex-shrink-0 bg-gradient-to-r from-sky-200 to-sky-300 rounded-xl" style={{ overflow: 'hidden' }}>
          <Image
            src="/basel_ad.png"
            alt="My Marketing Pro"
            fill
            className="object-cover sm:object-contain sm:object-left scale-90 sm:scale-100"
            style={{ objectPosition: '50% 35%' }}
          />
        </div>

        {/* Ad Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base sm:text-xl tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Get 100 Free Leads
            </span>
            <span className="text-[10px] text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide font-medium">Sponsored</span>
          </div>
          <p className="text-gray-200 text-sm sm:text-base mt-1 font-medium">
            Turn your Art Basel connections into customers with AI-powered follow-ups.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 hidden sm:block leading-relaxed">
            Memory is your AI marketing assistant that nurtures leads, sends personalized outreach, and books meetings while you focus on making connections.
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 hidden sm:flex">
          <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-all">
            Visit Site
          </span>
        </div>
      </div>
    </a>
  );
}
