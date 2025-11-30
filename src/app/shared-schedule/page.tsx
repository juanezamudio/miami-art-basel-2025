'use client';

import { Suspense } from 'react';
import SharedScheduleContent from './SharedScheduleContent';

export default function SharedSchedulePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <div className="animate-pulse">
          <div className="h-10 w-64 bg-gray-700 rounded mx-auto mb-4" />
          <div className="h-6 w-48 bg-gray-700 rounded mx-auto" />
        </div>
      </div>
    }>
      <SharedScheduleContent />
    </Suspense>
  );
}
