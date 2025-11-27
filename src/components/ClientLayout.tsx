'use client';

import { useState } from 'react';
import Header from './Header';
import ChatBot from './ChatBot';
import { Web3Provider } from './Web3Provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  const toggleChat = () => setChatOpen(!chatOpen);

  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
        <Header onChatToggle={toggleChat} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <ChatBot isOpen={chatOpen} onToggle={toggleChat} />
      </div>
    </Web3Provider>
  );
}
