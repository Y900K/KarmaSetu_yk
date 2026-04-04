import React from 'react';

interface ProgressBarProps { value: number; height?: string; className?: string; color?: string; }

export default function ProgressBar({ value, height = 'h-1.5', className = '', color }: ProgressBarProps) {
  const barColor = color || (value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500');
  const clamped = Math.max(0, Math.min(100, value));
  const snapped = Math.round(clamped / 5) * 5;
  const widthClass = `ks-progress-${snapped}`;
  return (
    <div className={`${height} rounded-full bg-[#0f172a]/50 w-full ${className} border border-white/5`}>
      <div className={`${height} rounded-full ${barColor} ${widthClass} transition-all duration-700`} />
    </div>
  );
}
