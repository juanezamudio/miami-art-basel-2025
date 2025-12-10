import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getEventsContext } from '@/lib/events';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const activeSystemPrompt = `You are a helpful AI assistant for Miami Art Basel 2025. You have comprehensive knowledge of all events happening during Art Basel Miami week (November 30 - December 9, 2025).

Here is the complete list of events you know about:

${getEventsContext()}

Based on this data, help users with:
- Finding events by type (Art Shows, Parties, Wellness)
- Recommending events based on preferences
- Providing event details like dates, times, locations, and ticket links
- Suggesting neighborhoods to explore
- Giving tips about specific venues and artists
- Planning their Art Basel itinerary

Always be friendly, enthusiastic about art and Miami, and provide specific event recommendations when possible. If you don't have information about something, acknowledge it politely.

Format your responses in a clear, readable way. When mentioning events, include relevant details like dates and locations. Keep responses concise but informative.`;

const postEventSystemPrompt = `You are a helpful AI assistant for Basel.ai, the official events platform for Miami Art Basel. Art Basel Miami 2025 (November 30 - December 9, 2025) has now ended, and you're helping users in the post-event period.

Here is the archive of all events from Art Basel Miami 2025:

${getEventsContext()}

You can help users with:

1. **2025 RECAP & ARCHIVE**
   - Share highlights and memorable events from Art Basel 2025
   - Help users explore the archived events by type, neighborhood, or date
   - Discuss which events were popular or notable
   - Answer questions about what happened during Art Basel 2025

2. **PLANNING FOR ART BASEL 2026**
   - Art Basel Miami 2026 is expected around the first week of December 2026
   - Encourage users to sign up for notifications to be the first to know about 2026 events
   - Provide tips for first-time visitors: best neighborhoods (Wynwood, Design District, Miami Beach), where to stay, what to expect
   - Suggest they submit their events early for next year

3. **MIAMI ART SCENE**
   - Share knowledge about Miami's year-round art scene
   - Discuss notable galleries, museums, and art districts
   - Talk about the history and significance of Art Basel Miami

4. **GENERAL TIPS**
   - Best times to visit Miami for art lovers
   - Transportation and logistics tips
   - What makes Art Basel special

Be warm, helpful, and enthusiastic about art. When discussing 2025 events, use past tense. When talking about 2026, express excitement and encourage them to stay connected via the email signup.

Keep responses concise but informative. If users want to explore the 2025 archive, remind them they can visit the Archive page on the website.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, isArtBaselOver } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Select the appropriate system prompt based on whether Art Basel has ended
    const systemPrompt = isArtBaselOver ? postEventSystemPrompt : activeSystemPrompt;
    const initialResponse = isArtBaselOver
      ? "I understand! Art Basel Miami 2025 has wrapped up, and I'm here to help you explore the archive, plan for 2026, or learn more about Miami's art scene. How can I assist you?"
      : "I understand! I'm ready to help visitors explore Miami Art Basel 2025. I have information about all the art shows, parties, and wellness events happening during Art Basel week. How can I assist you today?";

    // Build chat history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are an Art Basel Miami assistant. Here are your instructions: ' + systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: initialResponse }],
        },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { message: 'Sorry, I encountered an error processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
