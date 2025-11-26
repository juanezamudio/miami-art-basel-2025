'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Calendar, List, Map, MessageCircle } from 'lucide-react';

interface HeaderProps {
  onChatToggle: () => void;
}

export default function Header({ onChatToggle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-900 via-pink-800 to-orange-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg sm:text-2xl font-bold tracking-tight">Miami Art Basel 2025</span>
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
    </header>
  );
}
