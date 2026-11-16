// Event dates are calendar days in Miami, not UTC timestamps. Parse explicitly
// so an ISO date does not become the previous evening in an American timezone.
export function parseEventDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const input = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const legacy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  if (!iso && !legacy) return null;

  const year = Number(iso ? iso[1] : legacy![3]);
  const month = Number(iso ? iso[2] : legacy![1]);
  const day = Number(iso ? iso[3] : legacy![2]);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  // Date constructors silently roll impossible dates into the next month.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

export function eventDateKey(value: string | Date | null | undefined): string | null {
  const date = value instanceof Date ? value : parseEventDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function miamiDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function isEventOnDate(
  event: { startDate: string | null; endDate: string | null },
  date: string | Date,
): boolean {
  const selected = eventDateKey(date);
  const start = eventDateKey(event.startDate);
  const end = event.endDate ? eventDateKey(event.endDate) : start;
  return !!(selected && start && end && selected >= start && selected <= end);
}

// Keep the official week visible, while including published opening nights and
// adjacent programs in the same date controls as the rest of the catalog.
export function getCatalogDateKeys(
  season: { startDate: string; endDate: string },
  events: { startDate: string | null; endDate: string | null }[],
): string[] {
  const start = parseEventDate(season.startDate);
  const end = parseEventDate(season.endDate);
  if (!start || !end || end < start) return [];
  for (const event of events) {
    const first = parseEventDate(event.startDate);
    const last = event.endDate ? parseEventDate(event.endDate) : first;
    if (!first || !last || last < first) continue;
    if (first < start) start.setTime(first.getTime());
    if (last > end) end.setTime(last.getTime());
  }
  const dates: string[] = [];
  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(eventDateKey(date)!);
  }
  return dates;
}
