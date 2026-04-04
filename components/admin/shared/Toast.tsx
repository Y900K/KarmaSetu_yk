'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'warning' | 'info'; }

interface ToastContextType { showToast: (message: string, type?: ToastItem['type']) => void; }

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const COLORS: Record<string, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};
const ICONS: Record<string, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl animate-[slideIn_0.3s_ease] bg-[#1e293b] border-l-4 ${COLORS[toast.type] ?? 'border-l-slate-500'}`}
          >
            <span>{ICONS[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
      `}</style>
    </ToastContext.Provider>
  );
}
