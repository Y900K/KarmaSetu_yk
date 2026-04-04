import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'amber' | 'green' | 'blue' | 'red';
  className?: string;
}

export default function Badge({ children, variant = 'cyan', className = '' }: BadgeProps) {
  const colorStyles = {
    cyan: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
    purple: 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple',
    amber: 'border-warning/40 bg-warning/10 text-warning',
    green: 'border-success/40 bg-success/10 text-success',
    blue: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue',
    red: 'border-danger/40 bg-danger/10 text-danger',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${colorStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
