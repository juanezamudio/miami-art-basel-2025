const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;

interface NotificationPayload {
  headings: { en: string };
  contents: { en: string };
  url?: string;
  // Send to all subscribers
  included_segments?: string[];
  // Or send to specific users by external_id
  include_external_user_ids?: string[];
  // Or send to users with specific tags
  filters?: Array<{ field: string; key?: string; relation: string; value: string }>;
}

export async function sendNotification(payload: NotificationPayload) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error('OneSignal credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        ...payload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
}

// Send notification to all subscribers
export async function sendToAll(heading: string, message: string, url?: string) {
  return sendNotification({
    headings: { en: heading },
    contents: { en: message },
    url,
    included_segments: ['All'],
  });
}

// Send notification about an event to all subscribers
export async function sendEventNotification(
  eventName: string,
  eventTime: string,
  eventLocation: string,
  eventId: number | string,
  baseUrl: string
) {
  return sendNotification({
    headings: { en: `🎨 Starting Soon: ${eventName}` },
    contents: { en: `${eventTime} at ${eventLocation}` },
    url: `${baseUrl}/event/${eventId}`,
    included_segments: ['All'],
  });
}
