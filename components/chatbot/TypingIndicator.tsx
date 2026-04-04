'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="flex justify-start gap-2.5 mb-3"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[9px] font-black tracking-wide text-white">AI</span>
        </div>
        <div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-tl-sm rounded-tr-[18px] rounded-br-[18px] rounded-bl-[18px] px-4 py-3 w-fit">
            <div className="flex gap-1.5 items-center justify-center h-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot [animation-delay:-0.4s]" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot [animation-delay:-0.2s]" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing-dot" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 ml-1">Buddy is typing...</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
