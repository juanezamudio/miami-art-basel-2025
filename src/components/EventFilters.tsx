'use client';

import { Search, X, Sparkles } from 'lucide-react';

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  eventTypes: string[];
  neighborhoods: string[];
  onClearFilters: () => void;
  onPlanMyDay: () => void;
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
  priceRange,
  onPriceRangeChange,
  eventTypes,
  neighborhoods,
  onClearFilters,
  onPlanMyDay,
}: EventFiltersProps) {
  const hasActiveFilters = search || eventType !== 'All' || neighborhood !== 'All' || date || priceRange;

  const selectClasses = "w-full lg:w-auto pl-4 pr-10 py-2 border border-gray-700 rounded-lg focus:outline-none bg-[#0a0a0f] text-gray-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat";

  const buttonClasses = "w-full py-2 border border-gray-700 rounded-lg focus:outline-none bg-[#0a0a0f] text-gray-200 text-center";

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-4 mb-6 border border-gray-700/50">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search events, venues, artists..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 placeholder-gray-500"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${hasActiveFilters ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
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
            <option value="All">All Areas</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">All Dates</option>
            <option value="2025-11-30">Nov 30</option>
            <option value="2025-12-01">Dec 1</option>
            <option value="2025-12-02">Dec 2</option>
            <option value="2025-12-03">Dec 3</option>
            <option value="2025-12-04">Dec 4</option>
            <option value="2025-12-05">Dec 5</option>
            <option value="2025-12-06">Dec 6</option>
            <option value="2025-12-07">Dec 7</option>
            <option value="2025-12-08">Dec 8</option>
            <option value="2025-12-09">Dec 9</option>
            <option value="tba">Date TBA</option>
          </select>

          <select
            value={priceRange}
            onChange={(e) => onPriceRangeChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">All Prices</option>
            <option value="free">Free</option>
            <option value="0-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100+">$100+</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className={`${buttonClasses} col-span-2 sm:col-span-1 flex items-center justify-center gap-1 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors`}
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={onPlanMyDay}
            className="col-span-2 sm:col-span-1 w-full py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            <Sparkles size={16} />
            <span>Plan My Day</span>
          </button>
        </div>
      </div>
    </div>
  );
}
