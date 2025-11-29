import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface IssueWithDetail {
  type: string;
  detail: string;
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventName, issues } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return NextResponse.json(
        { error: 'Notification service not configured' },
        { status: 500 }
      );
    }

    // Format the issues with their details
    const issueList = (issues as IssueWithDetail[]).map((issue) => {
      if (issue.detail) {
        return `• *${issue.type}*\n  → ${issue.detail}`;
      }
      return `• *${issue.type}*`;
    }).join('\n\n');

    const message = `
🚨 *Issue Report*

*Event:* ${eventName}
*Event ID:* ${eventId}

*Issues Reported:*

${issueList}

---
_Reported from Miami Art Basel 2025_
    `.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report issue error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
