'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChatbot, Message } from '@/context/ChatbotContext';
import { useLanguage } from '@/context/LanguageContext';
import TextToSpeech from './TextToSpeech';
import { cleanResponse } from '@/utils/cleanResponse';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { language } = useLanguage();
  const { buddyLanguage } = useChatbot();
  const displayText = cleanResponse(message.content);

  const isUser = message.role === 'user';
  const isError = message.isError;
  const shouldAutoPlayVoice = !isUser && !isError && Boolean(message.autoPlayTts);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 250, damping: 25 }}
        className="flex justify-end mb-4"
      >
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tl-[20px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[4px] px-4 py-3 text-[14px] leading-relaxed shadow-[0_4px_16px_rgba(6,182,212,0.3)] break-words whitespace-pre-line w-full border border-white/10">
            {displayText}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 mr-1">{formatTime(message.timestamp)}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 250, damping: 25 }}
      className="flex justify-start gap-3 mb-4"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(6,182,212,0.3)] mt-1 border border-white/10">
        <span className="text-[9px] font-black tracking-wide text-white">AI</span>
      </div>

      <div className="flex flex-col max-w-[85%]">
        <div
          className={`px-4 py-3 text-[14px] leading-relaxed rounded-tl-[4px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] break-words whitespace-pre-line shadow-sm ${
            isError
              ? 'bg-red-500/15 backdrop-blur-lg border border-red-500/30 text-red-200'
              : 'bg-[#1e293b]/70 backdrop-blur-xl border border-white/5 text-slate-100'
          }`}
        >
          {isError && <span className="mr-1 font-semibold">Warning:</span>}
          {displayText}

          {!isError && (
            <div className="bg-amber-500/[0.08] border border-amber-500/[0.15] rounded-lg px-2 py-1 mt-2 flex items-start gap-1 text-[8px] text-amber-500/70">
              <span className="text-amber-400 text-[7px] shrink-0 mt-[2px] font-semibold">Note</span>
              <span className="leading-tight">
                {language === 'HINGLISH' ? (
                  <>AI galti kar sakta hai. Safety Officer se confirm kar lo.</>
                ) : (
                  <>AI can make mistakes. Consult your Safety Officer.</>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 ml-1">
          <span className="text-[10px] text-slate-500">{formatTime(message.timestamp)}</span>
          {!isError && (
            <TextToSpeech
              text={displayText}
              language={buddyLanguage === 'hinglish' ? 'HINGLISH' : 'EN'}
              messageId={message.id}
              autoPlay={shouldAutoPlayVoice}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
