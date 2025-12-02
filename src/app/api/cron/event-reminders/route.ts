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

    // Get events starting in the next 30-60 minutes
    // This window ensures we catch events even with 30-min cron intervals
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const sixtyMinutesFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    for (const event of events) {
      if (!event.startDate || !event.schedule) continue;

      // Parse the event start time
      const eventDateTime = parseEventDateTime(event.startDate, event.schedule);
      if (!eventDateTime) continue;

      // Check if event starts within our notification window (30-60 min from now)
      if (eventDateTime >= thirtyMinutesFromNow && eventDateTime < sixtyMinutesFromNow) {
        // Format time for notification
        const timeStr = eventDateTime.toLocaleTimeString('en-US', {
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
      notificationsSent: notificationsSent.length,
      events: notificationsSent,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process event reminders' },
      { status: 500 }
    );
  }
}

// Parse event date and schedule into a Date object
function parseEventDateTime(dateStr: string, schedule: string): Date | null {
  try {
    // dateStr is like "2024-12-05"
    // schedule might be like "7:00 PM - 11:00 PM" or "10:00 AM" or "All Day"

    if (schedule.toLowerCase().includes('all day')) {
      // For all-day events, set to 9 AM
      const date = new Date(dateStr);
      date.setHours(9, 0, 0, 0);
      return date;
    }

    // Extract start time from schedule
    const timeMatch = schedule.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const isPM = timeMatch[3].toUpperCase() === 'PM';

    // Convert to 24-hour format
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);

    return date;
  } catch {
    return null;
  }
}
