'use client';

import React, { useEffect, useRef } from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatbotErrorState from './ChatbotErrorState';

export default function ChatbotMessages() {
  const { messages, isTyping, addMessage, buddyLanguage } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      const timer = setTimeout(() => {
        addMessage({
          role: 'bot',
          content:
            buddyLanguage === 'hinglish'
              ? `नमस्ते! मैं आपका Buddy AI Assistant हूँ। मैं आपके plant में industrial safety और training support में मदद करता हूँ।`
              : `Welcome back! I'm Buddy AI Assistant. I specialize in industrial safety and training support for your plant.`,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages.length, buddyLanguage, addMessage, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-transparent flex flex-col gap-3">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {messages.length > 0 && messages[messages.length - 1].isError && <ChatbotErrorState />}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
