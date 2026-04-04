'use client';

import React, { useEffect, useState } from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import { useLanguage } from '@/context/LanguageContext';
import { SUGGESTED_QUESTIONS } from '@/data/suggestedQuestions';

export default function SuggestedQuestions() {
  const { messages, isTyping, activeCourseId, addMessage, setIsTyping, isListening, buddyLanguage } = useChatbot();
  const { language } = useLanguage();
  const [shown, setShown] = useState<string[]>([]);

  const lastMessage = messages[messages.length - 1];
  const isErrOrLowConfidence = lastMessage?.role === 'bot' && (lastMessage.isError || lastMessage.isLowConfidence);

  useEffect(() => {
    const questionLanguage = buddyLanguage === 'hinglish' ? 'HINGLISH' : 'EN';
    const questionsSet = activeCourseId
      ? SUGGESTED_QUESTIONS[activeCourseId]?.[questionLanguage] ?? SUGGESTED_QUESTIONS.default[questionLanguage]
      : SUGGESTED_QUESTIONS.default[questionLanguage];

    const shuffled = [...questionsSet].sort(() => Math.random() - 0.5);
    const count = isErrOrLowConfidence ? Math.min(4, shuffled.length) : 2;
    setShown(shuffled.slice(0, count));
  }, [messages.length, activeCourseId, buddyLanguage, isErrOrLowConfidence]);

  if (messages.length === 0 || isTyping || isListening) return null;

  const handleSuggestedSend = async (question: string) => {
    if (isTyping || isListening) return;

    addMessage({ role: 'user', content: question });
    setIsTyping(true);

    try {
      const sarvamMessages: { role: string; content: string }[] = [
        { role: 'system', content: `[LANGUAGE_MODE: ${buddyLanguage === 'hinglish' ? 'HINGLISH' : 'ENGLISH'}]` },
      ];

      messages.forEach((message) => {
        sarvamMessages.push({
          role: message.role === 'bot' ? 'assistant' : message.role,
          content: message.content,
        });
      });

      sarvamMessages.push({ role: 'user', content: question });

      const { chatCompletion } = await import('@/utils/sarvamAI');
      const responseText = await chatCompletion(sarvamMessages);
      
      const isFallback = responseText === 'My live AI connection is slow right now, but I can still help with quick safety guidance. Ask in one line with the task, hazard, or chemical name, for example: "chemical spill emergency procedure."'
          || responseText === 'मेरा live AI connection अभी slow है, लेकिन मैं quick safety help दे सकता हूं. एक line में task, hazard, या chemical का नाम लिखो, जैसे: "chemical spill emergency procedure".'
          || responseText.includes('I don\'t understand')
          || responseText.includes('mujhe samajh');

      addMessage({ 
        role: 'bot', 
        content: responseText, 
        autoPlayTts: false,
        isLowConfidence: isFallback 
      });
    } catch {
      addMessage({
        role: 'bot',
        content:
          language === 'HINGLISH'
            ? 'Network error aa gayi. Internet connection check karo aur phir se try karo.'
            : 'Network error. Please check your connection and try again.',
        isError: true,
        isLowConfidence: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pl-4 pr-1 mb-2">
      <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
        <span className="font-semibold">{language === 'HINGLISH' ? 'Aur pucho' : 'Ask More'}</span>
      </div>
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 no-scrollbar">
        {shown.map((question, idx) => (
          <button
            key={idx}
            onClick={() => void handleSuggestedSend(question)}
            className="shrink-0 bg-[#1e293b] border border-[#334155] rounded-full px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5 cursor-pointer max-w-[180px] truncate transition-all duration-150"
            title={question}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
