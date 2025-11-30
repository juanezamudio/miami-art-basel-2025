'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Calendar, Sparkles, Sun, X } from 'lucide-react';
import { useOneSignal } from './OneSignalProvider';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { isSubscribed, isSupported, subscribe } = useOneSignal();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    eventReminders: true,
    newEvents: true,
    dailyDigest: true,
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('basel-ai-notification-prefs');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    await subscribe();
    setIsLoading(false);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    localStorage.setItem('basel-ai-notification-prefs', JSON.stringify(newPrefs));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-purple-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-100">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!isSupported ? (
            <div className="text-center py-6">
              <BellOff className="mx-auto text-gray-500 mb-3" size={48} />
              <p className="text-gray-400">
                Push notifications are not supported in your browser.
              </p>
            </div>
          ) : !isSubscribed ? (
            <div className="text-center py-6">
              <Bell className="mx-auto text-purple-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                Enable Notifications
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Get reminders for your saved events and stay updated on new Art Basel happenings.
              </p>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Choose which notifications you&apos;d like to receive:
              </p>

              {/* Event Reminders */}
              <label className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-400" size={20} />
                  <div>
                    <p className="text-gray-100 font-medium">Event Reminders</p>
                    <p className="text-gray-500 text-sm">Get notified before your saved events start</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.eventReminders}
                  onChange={() => handlePreferenceChange('eventReminders')}
                  className="w-5 h-5 accent-purple-500"
                />
              </label>

              {/* New Events */}
              <label className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-pink-400" size={20} />
                  <div>
                    <p className="text-gray-100 font-medium">New Events</p>
                    <p className="text-gray-500 text-sm">Be the first to know about new events</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newEvents}
                  onChange={() => handlePreferenceChange('newEvents')}
                  className="w-5 h-5 accent-purple-500"
                />
              </label>

              {/* Daily Digest */}
              <label className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Sun className="text-orange-400" size={20} />
                  <div>
                    <p className="text-gray-100 font-medium">Daily Digest</p>
                    <p className="text-gray-500 text-sm">Morning summary of today&apos;s events</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dailyDigest}
                  onChange={() => handlePreferenceChange('dailyDigest')}
                  className="w-5 h-5 accent-purple-500"
                />
              </label>

              <p className="text-gray-500 text-xs text-center pt-2">
                You can change these settings anytime from your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
