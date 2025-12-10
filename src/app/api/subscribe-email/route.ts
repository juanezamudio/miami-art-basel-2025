import { NextRequest, NextResponse } from 'next/server';

const CONVERTKIT_API_SECRET = process.env.CONVERTKIT_API_SECRET!;
const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID!;

export async function POST(request: NextRequest) {
  try {
    const { email, tags } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!CONVERTKIT_API_SECRET || !CONVERTKIT_FORM_ID) {
      console.error('ConvertKit credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Subscribe email to ConvertKit form using v3 API
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_secret: CONVERTKIT_API_SECRET,
          email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('ConvertKit API error:', data);
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to subscribe. Please try again.' },
        { status: response.status }
      );
    }

    // ConvertKit returns subscription info on success
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
    });
  } catch (error) {
    console.error('Subscribe email error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
