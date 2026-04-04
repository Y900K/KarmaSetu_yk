'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
  preserveScrollKey?: string;
  children: React.ReactNode;
}

const modalScrollMemory = new Map<string, number>();

export default function Modal({ isOpen, onClose, title, maxWidth = 'max-w-lg', preserveScrollKey, children }: ModalProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  React.useLayoutEffect(() => {
    if (!isOpen || !preserveScrollKey || !scrollRef.current) {
      return;
    }

    const saved = modalScrollMemory.get(preserveScrollKey) || 0;
    scrollRef.current.scrollTop = saved;
  }, [isOpen, preserveScrollKey]);

  const handleScroll = React.useCallback(() => {
    if (!preserveScrollKey || !scrollRef.current) {
      return;
    }

    modalScrollMemory.set(preserveScrollKey, scrollRef.current.scrollTop);
  }, [preserveScrollKey]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-none p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div ref={scrollRef} onScroll={handleScroll} onClick={(e) => e.stopPropagation()} className={`relative mx-auto mt-4 ${maxWidth} w-full max-h-[90vh] overflow-y-auto overscroll-contain bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl
        sm:rounded-2xl max-sm:min-h-screen max-sm:rounded-none max-sm:max-h-screen`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h3>
            <button type="button" title={t('admin.modal.close')} aria-label={t('admin.modal.close')} onClick={onClose} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
