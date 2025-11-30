'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useOneSignal } from './OneSignalProvider';

export default function NotificationPrompt() {
  const { isSubscribed, isSupported, subscribe } = useOneSignal();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const wasDismissed = localStorage.getItem('basel-ai-notifications-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a delay if not subscribed
    const timer = setTimeout(() => {
      if (!isSubscribed && isSupported) {
        setShowPrompt(true);
      }
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [isSubscribed, isSupported]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    const success = await subscribe();
    setIsLoading(false);
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('basel-ai-notifications-dismissed', 'true');
    setShowPrompt(false);
    setDismissed(true);
  };

  // Don't show if already subscribed, dismissed, or not supported
  if (isSubscribed || dismissed || !isSupported || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                Never Miss an Event!
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Get reminders for your saved events and discover new ones during Art Basel week.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-white text-purple-600 px-3 py-1.5 rounded-md font-medium text-xs hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Enabling...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      Enable
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-md transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
