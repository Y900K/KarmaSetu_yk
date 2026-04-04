'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Admin-level error boundary (Next.js error.tsx convention).
 * Catches unhandled errors in any admin page and shows a retry card
 * instead of crashing the entire app.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="bg-[#1e293b] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t('admin.error.title')}</h2>
        <p className="text-sm text-slate-400 mb-1">
          {t('admin.error.subtitle')}
        </p>
        <p className="text-xs text-red-400/80 mb-6 font-mono break-all">
          {error.message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm rounded-xl cursor-pointer transition-colors"
          >
            🔄 {t('admin.error.try_again')}
          </button>
          <a
            href="/admin/dashboard"
            className="px-6 py-2.5 bg-[#0f172a] border border-[#334155] text-white font-semibold text-sm rounded-xl hover:border-cyan-500/40 transition-colors"
          >
            🏠 {t('admin.error.dashboard')}
          </a>
        </div>
      </div>
    </div>
  );
}
