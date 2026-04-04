'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Bot } from 'lucide-react';
import { useAdminIdentity } from '@/context/AdminIdentityContext';
import { useChatbot } from '@/context/ChatbotContext';
import { useLanguage } from '@/context/LanguageContext';

const navItems = [
  { labelKey: 'admin.sidebar.group.main', items: [
    { nameKey: 'admin.sidebar.overview', href: '/admin/dashboard', icon: '📊' },
    { nameKey: 'admin.sidebar.users', href: '/admin/users', icon: '👥' },
    { nameKey: 'admin.sidebar.courses', href: '/admin/courses', icon: '🎓' },
    { nameKey: 'admin.sidebar.certificates', href: '/admin/certificates', icon: '🏅' },
    { nameKey: 'admin.sidebar.compliance', href: '/admin/compliance', icon: '🛡️' },
    { nameKey: 'admin.sidebar.feedback', href: '/admin/feedback', icon: '💬' },
    { nameKey: 'admin.sidebar.announcements', href: '/admin/announcements', icon: '📢' },
    { nameKey: 'admin.sidebar.reports', href: '/admin/reports', icon: '📈' },
    { nameKey: 'admin.sidebar.profile', href: '/admin/profile', icon: '👤' },
  ]},
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const { admin } = useAdminIdentity();
  const { isBuddyVisible, setIsBuddyVisible } = useChatbot();
  const { t } = useLanguage();

  const sidebar = (
    <div className="flex flex-col h-full w-[250px] bg-[#0f172a] border-r border-[#1e293b]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="KarmaSetu Logo" width={36} height={36} className="h-9 w-9 object-contain" />
          <div>
            <div className="font-black text-white text-sm tracking-wide">KARMASETU</div>
            <div className="text-[9px] text-cyan-400 tracking-wider leading-none">AI INTEGRATED INDUSTRIAL<br/>TRAINING PORTAL</div>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white cursor-pointer" aria-label={t('admin.sidebar.close_menu')}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((group) => (
          <div key={group.labelKey}>
            <div className="px-3 mb-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t(group.labelKey)}</div>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 text-sm rounded-r-lg mb-0.5 transition-colors ${
                    active
                      ? 'bg-cyan-500/10 border-l-[3px] border-cyan-500 text-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-[#1e293b] border-l-[3px] border-transparent'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Buddy AI Toggle */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setIsBuddyVisible(!isBuddyVisible)}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 border ${
            isBuddyVisible
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-900/20'
              : 'bg-[#1e293b] border-[#334155]/30 text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bot className={`h-4 w-4 transition-all duration-300 ${isBuddyVisible ? 'scale-110 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`} />
            <span>{t('admin.sidebar.buddy_assistant')}</span>
          </div>
          <div className={`h-4 w-8 rounded-full p-0.5 transition-all duration-300 ${isBuddyVisible ? 'bg-cyan-500 shadow-inner' : 'bg-slate-700'}`}>
            <div className={`h-3 w-3 rounded-full bg-white transition-all duration-300 ${isBuddyVisible ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Admin Card */}
      <div className="border-t border-[#1e293b] p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-cyan-500 flex items-center justify-center text-sm font-bold text-slate-900">{admin.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{admin.name}</div>
            <div className="text-xs text-slate-400">{admin.title}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">{sidebar}</div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}
    </>
  );
}
