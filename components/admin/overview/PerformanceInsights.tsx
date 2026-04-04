import { useGlobalStats } from '@/context/GlobalStatsContext';

type PerformanceMetric = {
  value: string;
  label: string;
  color: string;
};

export default function PerformanceInsights() {
  const { adminStats, isLoading } = useGlobalStats();

  const metrics: PerformanceMetric[] = adminStats?.performanceInsights || [
    { value: '0%', label: 'OVERALL PASS RATE', color: '#f59e0b' },
    { value: '0', label: 'ACTIVE COURSES', color: '#06b6d4' },
    { value: '0', label: 'AVG MODULES/COURSE', color: '#f8fafc' },
    { value: '0%', label: 'CERTIFICATION RATE', color: '#10b981' },
  ];

  if (isLoading) {
    return <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-48 animate-pulse" />;
  }

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-3">✨ Performance Insights</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const textColor = m.color === '#f59e0b' ? 'text-amber-500' : m.color === '#06b6d4' ? 'text-blue-400' : m.color === '#10b981' ? 'text-emerald-400' : 'text-slate-200';
          return (
            <div key={m.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{m.value}</div>
              <div className="text-[10px] text-slate-400 uppercase mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
