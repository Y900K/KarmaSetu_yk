'use client';

import React from 'react';

export default function CourseSidebar({ children, isOpen, onToggle }: { children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
  return (
    <div className={`hidden lg:block shrink-0 h-[calc(100vh-52px)] fixed top-[52px] right-0 bg-[#0d1b2a] border-l border-[#1e2d3d] z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-[350px] translate-x-0' : 'w-[0px] translate-x-full'}`}>
      
      {/* Toggle Tab */}
      <button
        onClick={onToggle}
        className="absolute -left-8 top-12 w-8 h-16 bg-[#1e2d3d] border-y border-l border-[#334155] rounded-l-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#334155] cursor-pointer transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.2)]"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="text-xl leading-none">{isOpen ? '›' : '‹'}</span>
      </button>

      <div className="w-[350px] h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
