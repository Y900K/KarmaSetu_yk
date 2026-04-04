'use client';

import React from 'react';

/**
 * Trainee-level error boundary (Next.js error.tsx convention).
 * Catches unhandled errors in any trainee page and shows a retry card
 * instead of crashing the entire app.
 */
export default function TraineeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="bg-[#1e293b] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-1">
          We couldn&apos;t load this page. Please try again.
        </p>
        <p className="text-xs text-red-400/80 mb-6 font-mono break-all">
          {error.message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm rounded-xl cursor-pointer transition-colors"
          >
            🔄 Try Again
          </button>
          <a
            href="/trainee/dashboard"
            className="px-6 py-2.5 bg-[#0f172a] border border-[#334155] text-white font-semibold text-sm rounded-xl hover:border-cyan-500/40 transition-colors"
          >
            🏠 Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
