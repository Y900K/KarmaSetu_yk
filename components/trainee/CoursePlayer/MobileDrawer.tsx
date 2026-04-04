'use client';

import React from 'react';

export default function MobileDrawer({ children, isOpen, onClose }: { children: React.ReactNode, isOpen: boolean, onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[80] h-[75vh] sm:h-[65vh] bg-[#0d1b2a] rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-out flex flex-col overflow-hidden lg:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Pull Handle */}
        <div 
          className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 bg-[#1e2d3d] border-b border-black/20"
          onClick={onClose}
          onTouchStart={() => { /* Optional: add gesture down to dismiss */ }}
        >
          <div className="w-12 h-1.5 bg-[#475569] rounded-full" />
        </div>

        <div className="flex-1 w-full overflow-hidden bg-[#0d1b2a]">
          {children}
        </div>
      </div>
    </>
  );
}
