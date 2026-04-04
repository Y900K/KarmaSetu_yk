'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function AccordionItem({
  question,
  answer,
  isOpen = false,
  onToggle,
}: AccordionItemProps) {
  const [isLocalOpen, setIsLocalOpen] = useState(false);
  const open = onToggle ? isOpen : isLocalOpen;
  const toggle = onToggle || (() => setIsLocalOpen(!isLocalOpen));

  return (
    <div className="border border-[#1e293b] rounded-xl overflow-hidden mb-3">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left bg-[#0f172a]
          transition-colors hover:bg-cyan-500/[0.05] cursor-pointer"
      >
        <span className="text-base font-semibold text-white pr-4">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-cyan-400 text-xl font-light"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-3 bg-cyan-500/[0.03] border-t border-[#1e293b]">
              <p className="text-slate-400 text-base leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
