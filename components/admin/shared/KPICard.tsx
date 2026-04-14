'use client';

import React from 'react';
import Link from 'next/link';

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  sub?: string;
  href?: string;
  themeColor: 'cyan' | 'amber' | 'blue' | 'emerald' | 'purple' | 'red' | 'indigo';
  valueColor?: string;
  subColor?: string;
  delay?: number;
}

const themeStyles = {
  cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500/40', bgGradient: 'from-cyan-500/20 to-transparent' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-500/40', bgGradient: 'from-amber-500/20 to-transparent' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-500/40', bgGradient: 'from-blue-500/20 to-transparent' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500/40', bgGradient: 'from-emerald-500/20 to-transparent' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-500/40', bgGradient: 'from-purple-500/20 to-transparent' },
  red: { bg: 'bg-red-500', border: 'border-red-500/40', bgGradient: 'from-red-500/20 to-transparent' },
  indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500/40', bgGradient: 'from-indigo-500/20 to-transparent' },
};

export default function KPICard({ label, value, icon, sub, href, themeColor, valueColor = 'text-white', subColor = 'text-slate-400', delay = 0 }: KPICardProps) {    
  const theme = themeStyles[themeColor] || themeStyles.cyan;
  const delayClass = delay === 200 ? '![animation-delay:200ms]' : delay === 400 ? '![animation-delay:400ms]' : delay === 600 ? '![animation-delay:600ms]' : '';
  
  const content = (
    <>
      {/* Glow effect matching theme */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl pointer-events-none ${theme.bg}`}
      ></div>
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 w-full h-[2px] opacity-70 group-hover:opacity-100 transition-opacity ${theme.bg}`}
      ></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            {label}
            {href && <div className={`w-3 h-3 rounded-full flex items-center justify-center border border-current text-[8px] animate-pulse`}>→</div>}
          </div>
          <div className={`text-3xl font-black tracking-tighter ${valueColor}`}>{value}</div>
          {sub && <div className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${subColor} flex items-center gap-1.5`}>{sub}</div>}
        </div>
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-inner transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br ${theme.bgGradient} border ${theme.border}`}
        >
          {icon}
        </div>
      </div>
    </>
  );

  const containerClass = `group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both ${delayClass} ${href ? 'cursor-pointer' : ''}`;

  if (href) {
    return (
      <Link href={href} className={containerClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={containerClass}>
      {content}
    </div>
  );
}
