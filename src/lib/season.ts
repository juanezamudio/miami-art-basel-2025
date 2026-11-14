import season from '@/data/season.json';
import { eventDateKey, parseEventDate } from './event-dates';

export const CURRENT_SEASON = season;
export const EVENT_START_DATE = new Date(season.startsAt);
export const EVENT_END_DATE = new Date(season.endsAt);

export function getSeasonPhase(now = new Date()): 'before' | 'during' | 'after' {
  return now < EVENT_START_DATE ? 'before' : now > EVENT_END_DATE ? 'after' : 'during';
}

export function getSeasonDates() {
  const dates: { value: string; label: string; date: Date }[] = [];
  const date = parseEventDate(season.startDate)!;
  const end = parseEventDate(season.endDate)!;
  while (date <= end) {
    dates.push({
      value: eventDateKey(date)!,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      date: new Date(date),
    });
    date.setDate(date.getDate() + 1);
  }
  return dates;
}
