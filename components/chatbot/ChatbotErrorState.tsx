'use client';

import React from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ChatbotErrorState() {
  const { messages, isTyping } = useChatbot();
  const { language } = useLanguage();

  if (isTyping) return null;

  const lastUserMessage = messages.filter((message) => message.role === 'user').at(-1);

  const handleRetry = () => {
    if (!lastUserMessage) return;

    window.dispatchEvent(new CustomEvent('ks_chatbot_retry', { detail: lastUserMessage.content }));
  };

  return (
    <div className="flex justify-start ml-8.5 mb-3">
      <button
        onClick={handleRetry}
        className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs px-3 py-1 rounded-lg cursor-pointer hover:bg-red-500/25 transition-colors flex items-center gap-1.5"
      >
        <span className="text-sm font-semibold">Retry</span>
        {language === 'HINGLISH' ? 'phir se bhejo' : 'Send again'}
      </button>
    </div>
  );
}
