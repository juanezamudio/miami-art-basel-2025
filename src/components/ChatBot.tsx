'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';

// Art Basel 2025 end date
const EVENT_END_DATE = new Date('2025-12-09T23:59:59');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Format response for clean, readable plain text display
function formatResponse(text: string): string {
  let formatted = text
    // Remove code blocks first
    .replace(/```[^`]*```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers but add newline before
    .replace(/^#{1,6}\s+(.+)$/gm, '\n$1\n')
    // Convert bullet points to a clean indent format
    .replace(/^\*\s+/gm, '\n   ')
    .replace(/^-\s+/gm, '\n   ')
    // Convert numbered lists with spacing
    .replace(/^(\d+)\.\s+/gm, '\n   $1. ')
    // Now remove bold/italic markers (after bullet conversion)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Add spacing after colons that start a list
    .replace(/:\s*\n/g, ':\n')
    // Clean up multiple newlines but keep paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Add line breaks between sentences for better readability in long paragraphs
  const lines = formatted.split('\n');
  formatted = lines.map(line => {
    if (line.length > 200 && !line.startsWith('   ')) {
      return line.replace(/\. ([A-Z])/g, '.\n\n$1');
    }
    return line;
  }).join('\n');

  return formatted;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatBot({ isOpen, onToggle }: ChatBotProps) {
  const [isArtBaselOver, setIsArtBaselOver] = useState(false);

  // Check if Art Basel has ended
  useEffect(() => {
    const checkIfOver = () => {
      setIsArtBaselOver(new Date() > EVENT_END_DATE);
    };
    checkIfOver();
  }, []);

  const getInitialMessage = () => {
    if (isArtBaselOver) {
      return "Hi! I'm your Art Basel Miami assistant.\n\nArt Basel 2025 has wrapped up, but I can help you:\n\n   Explore the 2025 archive\n   Plan for Art Basel 2026\n   Learn about Miami's art scene\n   Get tips for next year's visit\n\nWhat would you like to know?";
    }
    return "Hi! I'm your Miami Art Basel 2025 assistant.\n\nAsk me anything about events, parties, art shows, wellness activities, or recommendations for your visit!";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getInitialMessage(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message when isArtBaselOver changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: getInitialMessage() }]);
  }, [isArtBaselOver]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          isArtBaselOver,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const formattedMessage = formatResponse(data.message);
      setMessages((prev) => [...prev, { role: 'assistant', content: formattedMessage }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure the Gemini API key is configured correctly.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button - always visible when chat is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center z-[9999] hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window - full screen on mobile, floating modal on desktop */}
      {isOpen && (
        <div className="fixed inset-0 h-[100dvh] w-screen md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] md:max-h-[calc(100vh-6rem)] bg-white md:rounded-2xl shadow-2xl flex flex-col z-[9999] border-0 md:border md:border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white md:rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-semibold">Art Basel Assistant</h3>
                <p className="text-xs text-purple-200">Powered by Gemini AI</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-2xl min-w-0 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md max-w-[75%]'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md max-w-[calc(100%-3rem)]'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words leading-6">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <Loader2 size={16} className="animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isArtBaselOver ? "Ask about 2025 highlights, 2026 planning..." : "Ask about events, parties, art shows..."}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0 text-base md:text-sm text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
