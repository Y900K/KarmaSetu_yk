'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, ArrowRight, Inbox, AlertCircle } from 'lucide-react';
import { useAPI } from '@/lib/hooks/useAPI';

type FeedbackSnapshotRow = {
  id: string;
  userName: string;
  category: 'suggestion' | 'issue' | 'feature' | 'general';
  message: string;
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
};

type FeedbackSnapshotResponse = {
  ok: boolean;
  stats?: {
    open: number;
    reviewing: number;
    resolved: number;
    total: number;
  };
  feedback?: FeedbackSnapshotRow[];
};

const statusClass: Record<FeedbackSnapshotRow['status'], string> = {
  open: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  reviewing: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function FeedbackSnapshot() {
  const { t } = useLanguage();
  const [filterMode, setFilterMode] = useState<'all' | 'pending'>('all');
  const { data, error, isLoading } = useAPI<FeedbackSnapshotResponse>('/api/admin/feedback?limit=15');
  const stats = data?.stats;

  const feedback = useMemo(() => {
    const raw = Array.isArray(data?.feedback) ? data.feedback : [];
    if (filterMode === 'all') return raw.slice(0, 3);
    return raw.filter(item => item.status === 'open' || item.status === 'reviewing').slice(0, 3);
  }, [data, filterMode]);

  return (
    <section className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{t('admin.dashboard.feedback_inbox')}</h3>
            <p className="text-xs text-slate-400">{t('admin.dashboard.feedback_desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode(filterMode === 'all' ? 'pending' : 'all')}
            title={filterMode === 'all' ? 'Show Pending Only' : 'Show All Feedback'}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
              filterMode === 'pending' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' 
                : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            {filterMode === 'all' ? <Inbox className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{filterMode === 'all' ? t('admin.dashboard.all_events') : t('admin.dashboard.pending_feedback')}</span>
          </button>
          <Link
            href="/admin/feedback"
            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 ml-2"
          >
            {t('nav.open')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-[#020817] border border-[#1e293b] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Open</div>
          <div className="text-lg font-bold text-amber-400">{stats?.open ?? 0}</div>
        </div>
        <div className="rounded-xl bg-[#020817] border border-[#1e293b] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Reviewing</div>
          <div className="text-lg font-bold text-sky-400">{stats?.reviewing ?? 0}</div>
        </div>
        <div className="rounded-xl bg-[#020817] border border-[#1e293b] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Resolved</div>
          <div className="text-lg font-bold text-emerald-400">{stats?.resolved ?? 0}</div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading feedback snapshot...</p>
      ) : error ? (
        <p className="text-sm text-red-300">{error.message || 'Failed to load feedback snapshot.'}</p>
      ) : feedback.length === 0 ? (
        <p className="text-sm text-slate-500">No trainee feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {feedback.map((row) => (
            <div key={row.id} className="rounded-xl bg-[#020817] border border-[#1e293b] p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{row.userName}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">{row.category}</p>
                </div>
                <span className={`text-[10px] uppercase px-2 py-1 rounded-full border ${statusClass[row.status]}`}>
                  {row.status}
                </span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">{row.message}</p>
              <p className="text-[11px] text-slate-500 mt-2">
                {new Date(row.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
