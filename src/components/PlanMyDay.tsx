'use client';

import { useState } from 'react';
import { X, Sparkles, Calendar, Clock, MapPin, DollarSign, Zap, Loader2, Heart, Lightbulb } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getEvents } from '@/lib/events';

interface PlanEvent {
  time: string;
  eventName: string;
  venue: string;
  duration: string;
  description: string;
  tip: string;
}

interface DayPlan {
  title: string;
  summary: string;
  events: PlanEvent[];
  tips: string[];
  totalEvents: number;
  raw?: boolean;
}

interface PlanMyDayProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: string[];
}

const EVENT_TYPES = [
  { id: 'Art Show', label: 'Art Shows', emoji: '🎨' },
  { id: 'Party', label: 'Parties', emoji: '🎉' },
  { id: 'Wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'Conference', label: 'Conferences', emoji: '🎤' },
  { id: 'Networking', label: 'Networking', emoji: '🤝' },
  { id: 'Pop Up', label: 'Pop Ups', emoji: '✨' },
];

const DATES = [
  { value: '2025-11-30', label: 'Nov 30 (Sun)' },
  { value: '2025-12-01', label: 'Dec 1 (Mon)' },
  { value: '2025-12-02', label: 'Dec 2 (Tue)' },
  { value: '2025-12-03', label: 'Dec 3 (Wed)' },
  { value: '2025-12-04', label: 'Dec 4 (Thu)' },
  { value: '2025-12-05', label: 'Dec 5 (Fri)' },
  { value: '2025-12-06', label: 'Dec 6 (Sat)' },
  { value: '2025-12-07', label: 'Dec 7 (Sun)' },
  { value: '2025-12-08', label: 'Dec 8 (Mon)' },
  { value: '2025-12-09', label: 'Dec 9 (Tue)' },
];

export default function PlanMyDay({ isOpen, onClose, neighborhoods }: PlanMyDayProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const allEvents = getEvents();

  // Form state
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Art Show', 'Party']);
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'packed'>('moderate');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [budget, setBudget] = useState<'free' | 'budget' | 'moderate' | 'any'>('any');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('23:00');

  // Find event ID by name for saving to favorites
  const findEventId = (eventName: string): string | null => {
    // Normalize the event name for comparison
    const normalizedName = eventName.toLowerCase().trim();

    // Try exact match first
    let event = allEvents.find(
      (e) => e.event.toLowerCase().trim() === normalizedName
    );

    // If no exact match, try partial match (event name contains search or vice versa)
    if (!event) {
      event = allEvents.find(
        (e) => e.event.toLowerCase().includes(normalizedName) ||
               normalizedName.includes(e.event.toLowerCase())
      );
    }

    return event ? String(event.id) : null;
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods((prev) =>
      prev.includes(neighborhood) ? prev.filter((n) => n !== neighborhood) : [...prev, neighborhood]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setError(null);
    setStep('loading');

    try {
      const response = await fetch('/api/plan-my-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          interests: selectedInterests,
          pace,
          neighborhoods: selectedNeighborhoods,
          budget,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      setPlan(data);
      setStep('result');
    } catch {
      setError('Failed to generate your day plan. Please try again.');
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setPlan(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('form');
      setPlan(null);
      setError(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">AI Plan My Day</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {step === 'form' && (
            <div className="p-4 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Calendar size={16} />
                  Which day are you planning?
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                >
                  {DATES.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Sparkles size={16} />
                  What are you interested in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleInterest(type.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedInterests.includes(type.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Zap size={16} />
                  What's your ideal pace?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['relaxed', 'moderate', 'packed'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        pace === p
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {p === 'relaxed' && '🐢 '}
                      {p === 'moderate' && '🚶 '}
                      {p === 'packed' && '🏃 '}
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Clock size={16} />
                  When are you available?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <DollarSign size={16} />
                  What's your budget?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { id: 'free', label: 'Free Only' },
                    { id: 'budget', label: 'Under $50' },
                    { id: 'moderate', label: 'Up to $100' },
                    { id: 'any', label: 'Any Price' },
                  ] as const).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBudget(b.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        budget === b.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhoods */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <MapPin size={16} />
                  Preferred areas (optional)
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {neighborhoods.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleNeighborhood(n)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                        selectedNeighborhoods.includes(n)
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-purple-500" />
                <Sparkles size={20} className="absolute -top-1 -right-1 text-pink-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Planning your perfect day...</p>
                <p className="text-gray-400 text-sm mt-1">Our AI is curating the best events for you</p>
              </div>
            </div>
          )}

          {step === 'result' && plan && (
            <div className="p-4 space-y-4">
              {/* Plan Header */}
              <div className="text-center pb-4 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.summary}</p>
                <p className="text-purple-400 text-sm mt-2">
                  {plan.totalEvents} event{plan.totalEvents !== 1 ? 's' : ''} planned
                </p>
              </div>

              {/* Events Timeline */}
              {plan.events.length > 0 ? (
                <div className="space-y-3">
                  {plan.events.map((event, index) => {
                    const eventId = findEventId(event.eventName);
                    const isSaved = eventId ? isFavorite(eventId) : false;

                    return (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-purple-500"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-purple-400 mb-1">
                              <Clock size={14} />
                              <span>{event.time}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-500">{event.duration}</span>
                            </div>
                            <h4 className="font-semibold text-white">{event.eventName}</h4>
                            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                              <MapPin size={12} />
                              {event.venue}
                            </p>
                            <p className="text-gray-300 text-sm mt-2">{event.description}</p>
                            {event.tip && (
                              <p className="text-pink-400 text-xs mt-2 flex items-start gap-1">
                                <Lightbulb size={12} className="mt-0.5 shrink-0" />
                                {event.tip}
                              </p>
                            )}
                          </div>
                          {eventId && (
                            <button
                              onClick={() => toggleFavorite(eventId)}
                              className={`p-2 rounded-lg transition-colors shrink-0 ${
                                isSaved
                                  ? 'text-pink-500 hover:text-pink-400 hover:bg-pink-500/10'
                                  : 'text-gray-500 hover:text-pink-400 hover:bg-gray-700/50'
                              }`}
                              title={isSaved ? 'Remove from My Schedule' : 'Add to My Schedule'}
                            >
                              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No events found matching your criteria.</p>
                  <p className="text-sm mt-1">Try adjusting your preferences.</p>
                </div>
              )}

              {/* Tips */}
              {plan.tips && plan.tips.length > 0 && (
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Tips for your day
                  </h4>
                  <ul className="space-y-1">
                    {plan.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 bg-[#0a0a0f]/50">
          {step === 'form' && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Generate My Day Plan
            </button>
          )}
          {step === 'result' && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Plan Another Day
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
