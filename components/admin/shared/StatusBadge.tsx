import React from 'react';

interface StatusBadgeProps { status: string; }

const styles: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Valid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Compliant: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
  Expired: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Inactive: 'bg-slate-600/30 text-slate-400 border-slate-600/50',
  Revoked: 'bg-red-500/15 text-red-400 border-red-500/30',
  Draft: 'bg-slate-600/30 text-slate-400 border-slate-600/50',
  'At Risk': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Non-Compliant': 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = styles[status] || 'bg-slate-600/30 text-slate-400 border-slate-600/50';
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cls}`}>{status}</span>
  );
}
