'use client';

import { useState } from 'react';
import { Mail, Check, Loader2, Bell } from 'lucide-react';

export default function NotifyMe2026() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/subscribe-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tags: { notify_2026: 'true' }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <Check size={24} />
            <span className="font-semibold text-lg">You&apos;re on the list!</span>
          </div>
          <p className="text-gray-400 text-sm">
            We&apos;ll notify you when Art Basel Miami 2026 details are announced.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center gap-2 text-purple-300 mb-3">
          <Bell size={20} />
          <span className="font-semibold">Get Notified for 2026</span>
        </div>
        <p className="text-gray-400 text-sm text-center mb-4">
          Be the first to know when we announce Art Basel Miami 2026 events.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              disabled={status === 'loading'}
            />
          </div>

          {status === 'error' && errorMessage && (
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <span>Notify Me</span>
            )}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-3">
          No spam, just Art Basel updates. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
