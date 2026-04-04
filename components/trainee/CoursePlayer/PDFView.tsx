'use client';

import React, { useState, useEffect } from 'react';
import { getEmbeddableUrl } from '@/utils/resourceParser';
import { Document } from '@/data/coursePlayerDummyData';
import { AnimatePresence, motion } from 'framer-motion';

interface PDFViewProps {
  document: Document;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLastDoc: boolean;
  language: 'HINGLISH' | 'EN';
}

export default function PDFView({ 
  document,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isLastDoc,
  language,
}: PDFViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const embedUrl = getEmbeddableUrl(document.driveURL);
  const [viewMode, setViewMode] = useState<'themed' | 'original'>(() => (embedUrl ? 'original' : 'themed'));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const renderHandbookPreview = () => {
    const isForklift = document.title.toLowerCase().includes('forklift');
    const isFire = document.title.toLowerCase().includes('fire');
    
    const getIcon = () => {
      if (isForklift) return '🚜';
      if (isFire) return '🔥';
      return '🧪';
    };

    const getTitle = () => {
      if (isForklift) return <>FORKLIFT SAFETY <br className="hidden sm:block" /> & OPERATIONS</>;
      if (isFire) return <>FIRE SAFETY <br className="hidden sm:block" /> & EMERGENCY</>;
      return <>CHEMICAL SAFETY <br className="hidden sm:block" /> HANDBOOK</>;
    };

    const getChapters = () => {
      if (isForklift) return [
        { title: "Chapter 1: Pre-Op Inspection", content: "Operators must perform a pre-shift inspection of tires, fluid levels, forks, and the lifting mechanism before any movement.", tip: "A defective forklift is a lethal weapon — never operate with minor faults." },
        { title: "Chapter 2: Load Management", content: "Always ensure the load is centered and stable. Tilting the mast back slightly helps secure the load during transport.", tip: "Never exceed the rated capacity shown on the data plate." }
      ];
      if (isFire) return [
        { title: "Chapter 1: Prevention First", content: "Identify potential ignition sources and combustible materials. Maintain a minimum 3-foot clearance around electrical panels.", tip: "Prevention is the most effective form of fire protection." },
        { title: "Chapter 2: PASS Protocol", content: "In case of fire, remember: Pull the pin, Aim at base, Squeeze lever, Sweep side-to-side.", tip: "Ensure you have the correct extinguisher type for the fire class." }
      ];
      return [
        { title: "Chapter 1: Risk Assessment", content: "Prior to initiating any chemical handling procedure, a comprehensive risk assessment must be performed using SDS documentation.", tip: "Never interact with a substance whose SDS has not been reviewed." },
        { title: "Chapter 2: PPE Selection", content: "Utilize nitrile gloves, full-face shields, and acid-resistant boots as defined in the specific material safety protocols.", tip: "PPE is your last line of defense — inspect it before every use." }
      ];
    };

    const chapters = getChapters();

    return (
      <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-[#0d1b2a] scrollbar-thin scrollbar-thumb-cyan-500/20">
        <div className="max-w-3xl mx-auto">
          {/* Handbook Header */}
          <div className="border-b-2 border-cyan-500/30 pb-8 mb-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-32 bg-cyan-500/10 border-2 border-cyan-500/40 rounded-lg flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              {getIcon()}
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-cyan-500 text-[#0d1b2a] text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                Official Revision 2026
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
                {getTitle()}
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                Industrial Compliance Standard • Level-2
              </p>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-12">
            {chapters.map((ch, idx) => (
              <section key={idx} className="relative pl-6 border-l-2 border-cyan-500/20">
                <span className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-cyan-500" />
                <h3 className="text-cyan-400 font-black uppercase tracking-widest text-xs mb-4">{ch.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{ch.content}</p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic text-[13px] text-slate-400">
                  &ldquo;{ch.tip}&rdquo;
                </div>
              </section>
            ))}

            <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                 <span className="w-2 h-2 rounded-full bg-emerald-500" /> Secure View Active
              </div>
              <button 
                onClick={() => setViewMode('original')}
                className="px-8 py-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-3 active:scale-95 text-center"
              >
                Switch to Original Document View ➞
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewerContent = (className = '') => (
    <div className={`flex flex-col bg-[#1e2d3d] overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="h-16 bg-[#0a121d] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl shadow-inner">📄</div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest truncate max-w-[140px] sm:max-w-md leading-none">
              {document.title}
            </h4>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1 block italic opacity-60">Verified Document Layer • 2026 r2</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* View Toggle */}
          <div className="hidden lg:flex p-1 bg-white/5 rounded-xl border border-white/5 mr-2">
            <button 
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'original' ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              ORIGINAL
            </button>
            <button 
              onClick={() => setViewMode('themed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'themed' ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              PREMIUM
            </button>
          </div>

          {!isFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 w-10 h-10 sm:w-auto sm:px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest border border-white/5"
            >
              <span className="text-lg leading-none">⛶</span>
              <span className="hidden sm:inline">Maximize</span>
            </button>
          )}
          <a
            href={document.driveURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0d1b2a] bg-cyan-500 hover:bg-cyan-400 w-10 h-10 sm:w-auto sm:px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.1em] shadow-[0_5px_15px_-3px_rgba(6,182,212,0.4)] active:scale-95"
          >
            <span className="hidden sm:inline">Link</span>
            <span className="text-lg leading-none mt-[-2px]">↗</span>
          </a>
        </div>
      </div>

      <div className="flex-1 bg-black/20 w-full h-full relative flex flex-col">
        {viewMode === 'themed' ? (
          renderHandbookPreview()
        ) : embedUrl ? (
          <div className="w-full h-full relative bg-slate-900">
            <iframe 
              src={embedUrl} 
              className="w-full h-full border-none"
              title={document.title}
              allow="autoplay"
            />
            {/* Fallback overlay (only visible if iframe doesn't cover it, or for styled loading) */}
            <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Synthesizing Document Stream...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm font-semibold text-slate-300">Unable to embed this document preview.</p>
            <a
              href={document.driveURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2 text-xs font-black uppercase tracking-wide text-cyan-300 hover:bg-cyan-500/20"
            >
              Open Document Link ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={document.id}
        className="max-w-5xl mx-auto w-full h-[70vh] md:h-[calc(100vh-280px)] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5"
      >
        {renderViewerContent('w-full h-full')}
      </motion.div>

      {/* Navigation Footer */}
      <div className="max-w-5xl mx-auto w-full mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pb-12">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl border border-[#334155] text-slate-300 font-medium hover:bg-white/5 hover:text-white disabled:opacity-30 transition-all flex items-center justify-center gap-2 group/prev"
        >
          <span className="group-hover/prev:-translate-x-1 transition-transform">←</span>
          {language === 'HINGLISH' ? 'पिछला' : 'Previous'}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Reading Material Progress: <span className="text-cyan-400">Stable</span>
        </div>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="w-full sm:w-auto min-h-[48px] px-8 py-2.5 rounded-xl bg-cyan-500 text-[#0d1b2a] font-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_-5px_rgba(6,182,212,0.3)] group/next"
        >
          {isLastDoc 
            ? (language === 'HINGLISH' ? 'परीक्षा शुरू करें' : 'Start Assessment')
            : (language === 'HINGLISH' ? 'अगला' : 'Next Material')
          }
          <span className="group-hover/next:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#0d1b2a] flex flex-col"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-[100] w-12 h-12 bg-black/50 hover:bg-red-500/80 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-white/10"
              aria-label="Close full view"
            >
              <span className="text-2xl leading-none">✕</span>
            </button>
            {renderViewerContent('w-full h-full')}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
