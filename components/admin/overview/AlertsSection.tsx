import React, { useState } from 'react';
import { Bell, AlertCircle, Info as InfoIcon, ShieldAlert, X, ChevronRight } from 'lucide-react';

import { useAPI } from '@/lib/hooks/useAPI';

type AlertLevel = 'HIGH' | 'MEDIUM' | 'INFO';

type AlertItem = {
  id: string;
  level: AlertLevel;
  color: 'red' | 'yellow' | 'blue';
  icon: string;
  title: string;
  desc: string;
  action: string;
  createdAt: string;
};

const borderColors: Record<'red' | 'yellow' | 'blue', string> = {
  red: 'border-l-red-500',
  yellow: 'border-l-amber-500',
  blue: 'border-l-blue-500',
};
const badgeStyles: Record<AlertLevel, string> = {
  HIGH: 'bg-red-500/15 text-red-400 border-red-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  INFO: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const iconMap: Record<AlertLevel, React.ReactNode> = {
  HIGH: <ShieldAlert className="h-5 w-5 text-red-500" />,
  MEDIUM: <AlertCircle className="h-5 w-5 text-amber-500" />,
  INFO: <InfoIcon className="h-5 w-5 text-blue-500" />,
};

import { useLanguage } from '@/context/LanguageContext';

export default function AlertsSection() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { data, isLoading } = useAPI<{ ok: boolean; alerts: AlertItem[] }>('/api/admin/alerts?limit=5');
  
  const alerts = data?.ok ? data.alerts : [];
  const visible = alerts.filter((a) => !dismissed.includes(a.id));

  if (isLoading) {
    return <div className="mt-6 h-32 bg-[#1e293b] animate-pulse rounded-xl" />;
  }

  if (visible.length === 0) return null;
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-400" />
          {t('admin.overview.alerts')}
        </h3>    
      </div>
      <div className="space-y-3">
        {visible.map((alert) => (
          <div key={alert.id} className={`bg-[#0f172a]/80 backdrop-blur-md border border-[#1e293b]/60 border-l-4 rounded-xl p-4 flex items-start gap-4 transition-all duration-300 hover:bg-[#1e293b]/50 hover:-translate-y-0.5 shadow-lg ${borderColors[alert.color] ?? 'border-l-slate-500'}`}>
            <div className="flex-shrink-0 mt-0.5">
              {iconMap[alert.level]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${badgeStyles[alert.level]}`}>{alert.level}</span>
                <span className="text-sm font-bold text-white">{alert.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{alert.desc}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button 
                onClick={() => setDismissed((p) => [...p, alert.id])} 
                title={t('admin.overview.dismiss_alert')}
                className="text-slate-600 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button 
                title={alert.action} 
                className="text-[10px] uppercase font-black tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group transition-all"
              >
                {alert.action}
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
