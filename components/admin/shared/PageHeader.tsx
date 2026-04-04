import React from 'react';

interface PageHeaderProps {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, sub, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 mt-2 lg:mb-10 relative">
      <div className="relative">
        {/* Background glow for header */}
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent relative z-10">
          {title}
        </h1>
        {sub && (
          <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-2 relative z-10 tracking-wide">
            <span className="w-8 h-px bg-slate-700 hidden sm:block"></span>
            {sub}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 animate-in slide-in-from-right-4 fade-in duration-500 z-10">
          {action}
        </div>
      )}
    </div>
  );
}
