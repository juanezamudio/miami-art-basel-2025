'use client';

import { useState, useEffect } from 'react';
import { Share, Plus, X } from 'lucide-react';

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('basel-ai-ios-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check if running on iOS Safari and NOT already installed as PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Show prompt after delay if iOS Safari and not installed
    if (isIOS && isSafari && !isInStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 8000); // Show after 8 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('basel-ai-ios-install-dismissed', 'true');
    setShowPrompt(false);
    setDismissed(true);
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleRemindLater}
      />
      <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-sm border border-gray-700/50 overflow-hidden animate-slide-up">
        {/* Close button */}
        <button
          onClick={handleRemindLater}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-5">
          {/* App Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>B</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-100 text-center mb-2">
            Install Basel.ai
          </h3>
          <p className="text-gray-400 text-sm text-center mb-5">
            Add to your home screen for the best experience and push notifications!
          </p>

          {/* Instructions */}
          <div className="bg-[#0a0a0f] rounded-lg p-4 mb-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm font-semibold">1</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <span>Tap the</span>
                <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-700 rounded">
                  <Share size={14} className="text-blue-400" />
                </div>
                <span>Share button</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm font-semibold">2</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <span>Scroll and tap</span>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 rounded text-xs">
                  <Plus size={12} />
                  <span>Add to Home Screen</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm font-semibold">3</span>
              </div>
              <div className="text-gray-300 text-sm">
                <span>Tap <strong className="text-white">Add</strong> in the top right</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              Push Notifications
            </span>
            <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
              Fullscreen Mode
            </span>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">
              Quick Access
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg text-sm transition-colors"
            >
              Don&apos;t show again
            </button>
            <button
              onClick={handleRemindLater}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm hover:from-purple-500 hover:to-pink-500 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>

        {/* Arrow pointing to Safari share button */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a2e] rotate-45 border-r border-b border-gray-700/50" />
      </div>
    </div>
  );
}
