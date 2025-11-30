'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, ThermometerSun } from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    weatherCode: number;
    windSpeed: number;
  };
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipitationProbability: number;
  }>;
  description: string;
}

function getWeatherIcon(code: number, size: number = 24) {
  // Clear
  if (code === 0 || code === 1) {
    return <Sun size={size} className="text-yellow-400" />;
  }
  // Cloudy
  if (code === 2 || code === 3 || code === 45 || code === 48) {
    return <Cloud size={size} className="text-gray-400" />;
  }
  // Rain/Drizzle
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain size={size} className="text-blue-400" />;
  }
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return <CloudSnow size={size} className="text-blue-200" />;
  }
  // Thunderstorm
  if (code >= 95) {
    return <CloudLightning size={size} className="text-yellow-500" />;
  }
  return <Sun size={size} className="text-yellow-400" />;
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/20 p-4 mb-8 animate-pulse">
        <div className="h-20 bg-gray-700/30 rounded-lg"></div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/20 p-4 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Current Weather */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center justify-center w-14 h-14 bg-blue-500/10 rounded-xl">
            {getWeatherIcon(weather.current.weatherCode, 32)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{weather.current.temperature}°F</span>
              <span className="text-gray-400 text-sm">Miami</span>
            </div>
            <p className="text-gray-300 text-sm">{weather.description}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ThermometerSun size={12} />
                Feels {weather.current.feelsLike}°
              </span>
              <span className="flex items-center gap-1">
                <Droplets size={12} />
                {weather.current.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind size={12} />
                {weather.current.windSpeed} mph
              </span>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="grid grid-cols-5 gap-2 flex-1">
          {weather.daily.slice(0, 5).map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center p-2 sm:p-3 bg-white/5 rounded-lg"
            >
              <span className="text-xs text-gray-400">{formatDay(day.date)}</span>
              <div className="my-1">{getWeatherIcon(day.weatherCode, 20)}</div>
              <div className="text-xs">
                <span className="text-white font-medium">{day.tempMax}°</span>
                <span className="text-gray-500 ml-1">{day.tempMin}°</span>
              </div>
              {day.precipitationProbability > 20 && (
                <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                  <Droplets size={8} />
                  {day.precipitationProbability}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
