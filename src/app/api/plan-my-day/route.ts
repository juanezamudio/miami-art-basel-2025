import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getEventsContext } from '@/lib/events';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PlanRequest {
  date: string;
  interests: string[];
  pace: 'relaxed' | 'moderate' | 'packed';
  neighborhoods: string[];
  budget: 'free' | 'budget' | 'moderate' | 'any';
  startTime: string;
  endTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { date, interests, pace, neighborhoods, budget, startTime, endTime } = body;

    const paceDescription = {
      relaxed: '2-3 events with plenty of time to enjoy each one and rest in between',
      moderate: '3-4 events with reasonable breaks',
      packed: '5+ events to maximize the Art Basel experience',
    };

    const budgetDescription = {
      free: 'only free events',
      budget: 'mostly free events with some under $50',
      moderate: 'mix of free and paid events up to $100',
      any: 'any price range including premium experiences',
    };

    const systemPrompt = `You are an expert Art Basel Miami itinerary planner. Create a personalized day plan based on the user's preferences.

Here is the complete list of events:

${getEventsContext()}

User Preferences:
- Date: ${date}
- Interests: ${interests.join(', ')}
- Pace: ${pace} (${paceDescription[pace]})
- Preferred neighborhoods: ${neighborhoods.length > 0 ? neighborhoods.join(', ') : 'Any'}
- Budget: ${budgetDescription[budget]}
- Available from: ${startTime} to ${endTime}

Create a detailed day itinerary that:
1. Only includes events happening on the specified date
2. Matches their interests and preferred event types
3. Respects their pace preference
4. Prioritizes their preferred neighborhoods when possible
5. Stays within their budget
6. Fits within their available time window
7. Includes realistic travel time between venues (15-30 mins in Miami traffic)

Format the response as a JSON object with this structure:
{
  "title": "A catchy title for their day",
  "summary": "A brief 1-2 sentence overview of the day",
  "events": [
    {
      "time": "10:00 AM",
      "eventName": "Event name exactly as listed",
      "venue": "Venue/neighborhood",
      "duration": "Suggested time to spend",
      "description": "Why this fits their interests",
      "tip": "Insider tip or what to look for"
    }
  ],
  "tips": ["General tips for the day"],
  "totalEvents": 3
}

If no events match the criteria, return:
{
  "title": "No Events Found",
  "summary": "Explanation of why no events match",
  "events": [],
  "tips": ["Suggestions for adjusting preferences"],
  "totalEvents": 0
}

Return ONLY the JSON object, no additional text or markdown formatting.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to ensure it's valid JSON
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to extract JSON if there's extra text before/after
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    try {
      const plan = JSON.parse(text);
      return NextResponse.json(plan);
    } catch {
      // If JSON parsing fails, return the raw text in a structured format
      return NextResponse.json({
        title: 'Your Art Basel Day',
        summary: text,
        events: [],
        tips: [],
        totalEvents: 0,
        raw: true,
      });
    }
  } catch (error) {
    console.error('Plan My Day API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate day plan. Please try again.' },
      { status: 500 }
    );
  }
}
