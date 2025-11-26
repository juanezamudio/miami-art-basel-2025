'use client';

import { Search, X } from 'lucide-react';

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  eventTypes: string[];
  neighborhoods: string[];
  onClearFilters: () => void;
}

export default function EventFilters({
  search,
  onSearchChange,
  eventType,
  onEventTypeChange,
  neighborhood,
  onNeighborhoodChange,
  date,
  onDateChange,
  eventTypes,
  neighborhoods,
  onClearFilters,
}: EventFiltersProps) {
  const hasActiveFilters = search || eventType !== 'All' || neighborhood !== 'All' || date;

  const selectClasses = "w-full lg:w-auto pl-4 pr-10 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#0a0a0f] text-gray-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat";

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-4 mb-6 border border-gray-700/50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search events, venues, artists..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 placeholder-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3">
          <select
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className={selectClasses}
          >
            <option value="All">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={neighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            className={selectClasses}
          >
            <option value="All">All Neighborhoods</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            min="2025-11-30"
            max="2025-12-09"
            className="w-full lg:w-auto px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#0a0a0f] text-gray-200"
          />

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full lg:w-auto flex items-center justify-center gap-1 px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
