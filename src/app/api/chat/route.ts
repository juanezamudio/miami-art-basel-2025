import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getEventsContext } from '@/lib/events';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const systemPrompt = `You are a helpful AI assistant for Miami Art Basel 2025. You have comprehensive knowledge of all events happening during Art Basel Miami week (November 30 - December 9, 2025).

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

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build chat history
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are an Art Basel Miami 2025 assistant. Here are your instructions: ' + systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "I understand! I'm ready to help visitors explore Miami Art Basel 2025. I have information about all the art shows, parties, and wellness events happening during Art Basel week. How can I assist you today?" }],
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
