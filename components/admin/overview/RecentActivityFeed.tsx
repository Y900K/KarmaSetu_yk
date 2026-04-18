import Link from 'next/link';
import { useGlobalStats } from '@/context/GlobalStatsContext';

type ActivityItem = {
  icon: string;
  text: string;
  time: string;
  color?: 'green' | 'blue' | 'yellow' | string;
  score?: number;
};

import { useLanguage } from '@/context/LanguageContext';

export default function RecentActivityFeed() {
  const { t } = useLanguage();
  const { recentActivity: activity, isLoading } = useGlobalStats();
  const visibleActivity = activity.slice(0, 4);

  if (isLoading && activity.length === 0) {
    return <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 h-64 animate-pulse" />;
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      {/* Background glow for the card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>      
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        {t('admin.overview.recent_activity')}
      </h3>
      <div className="space-y-4 relative z-10">
        {visibleActivity.length === 0 && <p className="text-xs text-slate-500">{t('admin.overview.no_activity')}</p>}
        {visibleActivity.map((item, i) => {
          const borderClass = item.color === 'green' ? 'border-l-emerald-500/80 bg-emerald-500/5' : item.color === 'blue' ? 'border-l-blue-500/80 bg-blue-500/5' : item.color === 'yellow' ? 'border-l-amber-500/80 bg-amber-500/5' : 'border-l-slate-500/80 bg-slate-500/5';
          return (
            <div key={i} className={`flex gap-3 py-3 border-l-[3px] rounded-r-lg ${borderClass} pl-4 relative hover:bg-slate-800/40 transition-colors`}>
              <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-200 leading-snug">{item.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.time}</span>
                  {item.score && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400">{item.score} SCORE</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link href="/admin/reports" className="mt-6 relative z-10 w-full py-2.5 rounded-lg border border-slate-700/50 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-cyan-500/30 transition-all uppercase tracking-wider inline-flex items-center justify-center">
        {t('admin.overview.view_all_activity')}
      </Link>
    </div>
  );
}
