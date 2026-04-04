'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Expand, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PlayerTopBarProps {
  courseTitle: string;
  instructor?: string;
  category?: string;
  completedLessons: number;
  totalLessons: number;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export default function PlayerTopBar({
  courseTitle,
  instructor,
  category,
  completedLessons,
  totalLessons,
  isFullscreen,
  toggleFullscreen,
}: PlayerTopBarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleExit = () => {
    router.push('/trainee/dashboard');
  };

  return (
    <div className="h-[52px] fixed top-0 left-0 right-0 bg-[#0d1b2a] border-b border-[#1e2d3d] flex items-center justify-between px-2 sm:px-4 z-50 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors h-8 px-2 rounded-xl hover:bg-white/5 whitespace-nowrap"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">{t('player.exit')}</span>
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="flex items-center gap-2 max-w-full">
          {category && (
            <span className="hidden md:inline-block text-[9px] font-black text-cyan-500 border border-cyan-500/30 px-1.5 py-0.5 rounded-md uppercase tracking-tighter shrink-0 bg-cyan-500/5">
              {category}
            </span>
          )}
          <h1 className="text-white font-bold text-[13px] sm:text-[14px] truncate">{courseTitle}</h1>
        </div>
        {instructor && (
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5 text-[#64748b] text-[10px] font-medium italic">
            <span className="not-italic opacity-60">with</span>
            <span className="text-slate-400 font-semibold">{instructor}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 w-1/4 min-w-0">
        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 group transition-colors hover:border-cyan-500/30">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            {completedLessons} / {totalLessons}
          </span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="flex text-slate-400 hover:text-white transition-colors h-8 px-2 rounded-xl hover:bg-white/5 items-center gap-2"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
          <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">Focus</span>
        </button>
      </div>
    </div>
  );
}

