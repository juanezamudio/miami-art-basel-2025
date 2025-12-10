'use client';

import { useState, useEffect } from 'react';
import ActiveArtBaselHero from '@/components/ActiveArtBaselHero';
import PostArtBaselHero from '@/components/PostArtBaselHero';

// Art Basel 2025 end date - update this each year
const EVENT_END_DATE = new Date('2025-12-09T23:59:59');

export default function HomePage() {
  const [isArtBaselOver, setIsArtBaselOver] = useState<boolean | null>(null);

  // Check if Art Basel has ended
  useEffect(() => {
    const checkIfOver = () => {
      setIsArtBaselOver(new Date() > EVENT_END_DATE);
    };
    checkIfOver();
    // Check every minute in case we cross the end time
    const interval = setInterval(checkIfOver, 60000);
    return () => clearInterval(interval);
  }, []);

  // Don't render until we know the state (prevents hydration mismatch)
  if (isArtBaselOver === null) {
    return null;
  }

  return isArtBaselOver ? <PostArtBaselHero /> : <ActiveArtBaselHero />;
}
