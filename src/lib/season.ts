import season from '@/data/season.json';
import events from '@/data/events.json';
import { getCatalogDateKeys, parseEventDate } from './event-dates';

export const CURRENT_SEASON = season;
export const EVENT_START_DATE = new Date(season.startsAt);
export const EVENT_END_DATE = new Date(season.endsAt);

export function getSeasonPhase(now = new Date()): 'before' | 'during' | 'after' {
  return now < EVENT_START_DATE ? 'before' : now > EVENT_END_DATE ? 'after' : 'during';
}

export function getSeasonDates() {
  return getCatalogDateKeys(season, events).map(value => {
    const date = parseEventDate(value)!;
    return {
      value,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      date,
    };
  });
}
