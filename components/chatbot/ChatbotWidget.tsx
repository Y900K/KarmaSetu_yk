'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import ChatbotHeader from './ChatbotHeader';
import ChatbotMessages from './ChatbotMessages';
import SuggestedQuestions from './SuggestedQuestions';
import ChatbotInput from './ChatbotInput';

export default function ChatbotWidget() {
  const { isOpen, setIsOpen, messages, isBuddyVisible, setIsBuddyVisible } = useChatbot();
  const constraintsRef = React.useRef(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const hasMessages = messages.length > 0;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isBuddyVisible) return null;

  return (
    <>
      {/* Draggable boundary constraint for the widget */}
      <div className="fixed inset-0 pointer-events-none z-[40]" ref={constraintsRef} />

      {/* TRIGGER BUTTON (when closed) */}
      {!isOpen && (
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          onClick={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          role="button"
          tabIndex={0}
          className="fixed z-50 bottom-6 right-6 md:bottom-6 md:right-6 w-32 h-32 flex items-center justify-center transition-all duration-200 cursor-grab group"
          aria-label="Open Buddy AI Assistant chatbot"
        >
          <div className="relative w-full h-full flex items-center justify-center isolate">
            {/* Quick Hide Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsBuddyVisible(false);
              }}
              aria-label="Hide Buddy AI"
              className="absolute -top-1 -right-1 z-30 h-6 w-6 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 shadow-lg md:flex hidden"
              title="Hide Buddy AI"
            >
              <X className="h-3 w-3" />
            </button>
            
            {/* Mobile Quick Hide - always visible on mobile if needed, or just keep group hover for now. 
                Actually, for mobile, it's better to have it always visible if small. */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsBuddyVisible(false);
              }}
              aria-label="Hide Buddy AI"
              className="absolute -top-1 -right-1 z-30 h-7 w-7 rounded-full bg-slate-900 border-2 border-white/20 flex items-center justify-center text-white md:hidden shadow-xl active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>

            {/* The image is now natively transparent via Node.js processing */}
            <Image
              src="/yk_mascot.png" 
              alt="Buddy AI Assistant Mascot" 
              fill
              sizes="128px"
              className="w-full h-full object-contain object-center scale-[1.6] group-hover:-translate-y-2 group-hover:rotate-3 transition-all duration-300 z-0 drop-shadow-[0_10px_20px_rgba(6,182,212,0.6)]" 
            />
          </div>
          
          {hasMessages && (
            <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#020817] z-20" />
          )}
        </motion.div>
      )}

      {/* CHAT WINDOW (when open) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay - only visible on < 768px in responsive flow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[99] md:hidden cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: '20px', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '20px', scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed z-[100] bottom-0 left-0 right-0 h-[85vh] md:h-[720px] md:w-[480px] md:bottom-24 md:right-6 md:left-auto bg-[#020817]/85 backdrop-blur-2xl md:rounded-2xl rounded-t-2xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              {/* Mobile grab handle */}
              <div 
                className="w-full flex justify-center pt-3 pb-1 md:hidden bg-[#1e293b] cursor-grab active:cursor-grabbing"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-10 h-1 bg-[#334155] rounded-full" />
              </div>

              <ChatbotHeader />
              <ChatbotMessages />
              <SuggestedQuestions />
              <ChatbotInput />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
