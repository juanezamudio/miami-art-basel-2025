import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/events';
import { sendEventNotification } from '@/lib/onesignal';

// Verify the request is authorized
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is set, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development';
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Also check X-Cron-Secret header (easier for cron-job.org)
  const cronHeader = request.headers.get('x-cron-secret');
  if (cronHeader === cronSecret) {
    return true;
  }

  // Also check query parameter as fallback
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret === cronSecret) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = getEvents();
    const now = new Date();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://miami-art-basel-2025.vercel.app';

    // Track notifications sent
    const notificationsSent: string[] = [];
    const skippedEvents: string[] = [];

    // Notification window: 15-45 minutes from now
    // This works well with 15-min cron intervals
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const fortyFiveMinutesFromNow = new Date(now.getTime() + 45 * 60 * 1000);

    for (const event of events) {
      // Skip events without schedule
      if (!event.schedule) {
        continue;
      }

      // Check if event is active today (handles multi-day events)
      if (!event.startDate) continue;

      const isActiveToday = isEventActiveToday(
        event.startDate,
        event.endDate || null,
        now
      );

      if (!isActiveToday) {
        continue;
      }

      // Get the event start time for today
      const eventStartTime = getEventStartTimeToday(event.schedule, now);
      if (!eventStartTime) {
        skippedEvents.push(`${event.event} (no parseable time)`);
        continue;
      }

      // Check if event starts within our notification window (15-45 min from now)
      if (eventStartTime >= fifteenMinutesFromNow && eventStartTime < fortyFiveMinutesFromNow) {
        // Format time for notification
        const timeStr = eventStartTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const result = await sendEventNotification(
          event.event,
          timeStr,
          event.neighborhood || 'Miami',
          event.id,
          baseUrl
        );

        if (result) {
          notificationsSent.push(event.event);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      localTime: now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
      notificationWindow: {
        from: fifteenMinutesFromNow.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        to: fortyFiveMinutesFromNow.toLocaleString('en-US', { timeZone: 'America/New_York' }),
      },
      notificationsSent: notificationsSent.length,
      events: notificationsSent,
      skipped: skippedEvents.length > 0 ? skippedEvents : undefined,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process event reminders' },
      { status: 500 }
    );
  }
}

// Parse date string in various formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try MM/DD/YYYY format
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1; // 0-indexed
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    return new Date(year, month, day);
  }

  // Try YYYY-MM-DD format
  const ymdMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  // Fallback to Date constructor
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Parse time from schedule string
function parseTime(schedule: string): { hours: number; minutes: number } | null {
  if (!schedule) return null;

  const lower = schedule.toLowerCase();
  if (lower.includes('all day') || lower.includes('varies')) {
    // For all-day or variable schedule events, use 9 AM as default
    return { hours: 9, minutes: 0 };
  }

  // Try various time formats: "7:00 PM", "7PM", "7 PM", "10:30AM", "7pm - 3am"
  const timeMatch = schedule.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const isPM = timeMatch[3].toUpperCase() === 'PM';

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  return null;
}

// Check if today falls within the event's date range
function isEventActiveToday(startDateStr: string, endDateStr: string | null, today: Date): boolean {
  const startDate = parseDate(startDateStr);
  if (!startDate) return false;

  // Normalize dates to compare just the date portion
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  if (endDateStr) {
    const endDate = parseDate(endDateStr);
    if (endDate) {
      const eventEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return todayStart >= eventStart && todayStart <= eventEnd;
    }
  }

  // Single day event
  return todayStart.getTime() === eventStart.getTime();
}

// Get event start time for today
function getEventStartTimeToday(schedule: string, today: Date): Date | null {
  const time = parseTime(schedule);
  if (!time) return null;

  const eventTime = new Date(today);
  eventTime.setHours(time.hours, time.minutes, 0, 0);
  return eventTime;
}
