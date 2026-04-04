'use client';

import React from 'react';
import { useChatbot } from '@/context/ChatbotContext';
import { RotateCcw, X } from 'lucide-react';

export default function ChatbotHeader() {
  const {
    isOpen,
    setIsOpen,
    clearMessages,
    buddyLanguage,
    setBuddyLanguage,
  } = useChatbot();

  if (!isOpen) return null;

  return (
    <div className="h-16 shrink-0 bg-[#1e293b] border-b border-[#334155] px-4 flex items-center justify-between shadow-lg z-10">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            🤖
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1e293b] rounded-full" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white leading-none tracking-tight">BUDDY AI <span className="text-cyan-400">ASSISTANT</span></h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            Industrial Safety Expert
          </p>
        </div>
      </div>

      {/* Right section: Language, Restart, & Close */}
      <div className="flex items-center gap-2">
        {/* Language Controls */}
        <div className="flex items-center bg-[#0f172a] rounded-lg p-0.5 border border-white/5 h-8">
          <button
            type="button"
            onClick={() => setBuddyLanguage('english')}
            className={`px-2.5 py-1 rounded-[6px] text-[10px] font-black transition-all ${
              buddyLanguage === 'english'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Switch Buddy language to English"
            aria-label="Switch Buddy language to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setBuddyLanguage('hinglish')}
            className={`px-2.5 py-1 rounded-[6px] text-[10px] font-black transition-all ${
              buddyLanguage === 'hinglish'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Switch Buddy language to Hinglish"
            aria-label="Switch Buddy language to Hinglish"
          >
            हि
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 border-l border-white/10 ml-1 pl-2">
          <button
            type="button"
            onClick={() => clearMessages()}
            className="w-8 h-8 rounded-lg transition-all flex items-center justify-center bg-slate-800/30 border border-white/5 text-slate-400 hover:bg-slate-700/50 hover:text-white"
            title="Restart Session"
            aria-label="Restart Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer group"
            title="Close Buddy AI"
            aria-label="Close Buddy AI"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
