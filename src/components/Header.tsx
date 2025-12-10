'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Calendar, List, Map, MessageCircle, PlusCircle, Heart, Bell, Archive } from 'lucide-react';
import NotificationSettings from './NotificationSettings';

interface HeaderProps {
  onChatToggle: () => void;
}

export default function Header({ onChatToggle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Load YouForm script when modal opens
  useEffect(() => {
    if (showSubmitModal) {
      const script = document.createElement('script');
      script.src = 'https://app.youform.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showSubmitModal]);

  return (
    <header className="bg-gradient-to-r from-purple-900 via-pink-800 to-orange-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Basel.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <List size={18} />
              <span>Events</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <Map size={18} />
              <span>Map</span>
            </Link>
            <Link
              href="/schedule"
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <Heart size={18} />
              <span>My Schedule</span>
            </Link>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <PlusCircle size={18} />
              <span>Submit Event</span>
            </button>
            <Link
              href="/archive"
              className="flex items-center space-x-1 hover:text-pink-200 transition-colors"
            >
              <Archive size={18} />
              <span>Archive</span>
            </Link>
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={onChatToggle}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
            >
              <MessageCircle size={18} />
              <span>AI Assistant</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-2 py-2 hover:text-pink-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <List size={18} />
              <span>Events</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center space-x-2 py-2 hover:text-pink-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center space-x-2 py-2 hover:text-pink-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Map size={18} />
              <span>Map</span>
            </Link>
            <Link
              href="/schedule"
              className="flex items-center space-x-2 py-2 hover:text-pink-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart size={18} />
              <span>My Schedule</span>
            </Link>
            <button
              onClick={() => {
                setShowSubmitModal(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 py-2 hover:text-pink-200 w-full"
            >
              <PlusCircle size={18} />
              <span>Submit Event</span>
            </button>
            <Link
              href="/archive"
              className="flex items-center space-x-2 py-2 hover:text-pink-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Archive size={18} />
              <span>Archive</span>
            </Link>
            <button
              onClick={() => {
                setShowNotificationSettings(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 py-2 hover:text-pink-200 w-full"
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => {
                onChatToggle();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 py-2 hover:text-pink-200 w-full"
            >
              <MessageCircle size={18} />
              <span>AI Assistant</span>
            </button>
          </nav>
        )}
      </div>

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Submit Event Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowSubmitModal(false)}
          />
          <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700/50">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-100">Submit Your Event</h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 70px)' }}>
              <div
                data-youform-embed
                data-form="symq8qwz"
                data-width="100%"
                data-height="700"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
