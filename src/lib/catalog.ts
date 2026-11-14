import { getEvents } from './events';
import { getArchiveEvents, getArchiveYears } from './archive';

// IDs are permanent across editions, keeping old shared links and saved
// schedules working when the live catalog switches to a new year.
export function getAllEvents() {
  return [...getEvents(), ...getArchiveYears().flatMap(getArchiveEvents)];
}
