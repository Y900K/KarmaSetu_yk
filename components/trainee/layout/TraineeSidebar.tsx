'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Trophy,
  User,
  X,
  Bot,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTraineeIdentity } from '@/context/TraineeIdentityContext';
import { useChatbot } from '@/context/ChatbotContext';

const navSections = [
  {
    label: 'Learn',
    items: [
      { key: 'nav.dashboard', href: '/trainee/dashboard', icon: LayoutDashboard },
      { key: 'nav.training', href: '/trainee/training', icon: GraduationCap },
      { key: 'nav.practice_quiz', href: '/trainee/practice-quiz', icon: Brain },
    ],
  },
  {
    label: 'Compete',
    items: [
      { key: 'nav.certificates', href: '/trainee/certificates', icon: BadgeCheck },
      { key: 'nav.leaderboard', href: '/trainee/leaderboard', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [
      { key: 'nav.feedback', href: '/trainee/feedback', icon: MessageSquare },
      { key: 'nav.profile', href: '/trainee/profile', icon: User },
    ],
  },
];

interface TraineeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export default function TraineeSidebar({ isOpen, onClose }: TraineeSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { identity } = useTraineeIdentity();
  const { isBuddyVisible, setIsBuddyVisible } = useChatbot();

  const isActive = (href: string) =>
    pathname === href ||
    (href === '/trainee/training' && (pathname.startsWith('/trainee/training') || pathname.startsWith('/trainee/course/'))) ||
    (href !== '/trainee/dashboard' && href !== '/trainee/training' && pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full w-[260px] flex-col bg-gradient-to-b from-[#0a1628] via-[#0d1b2a] to-[#0a1120] border-r border-white/5">
      
      {/* Branding Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-900/40">
            <Image src="/logo.png" alt="KarmaSetu Logo" width={36} height={36} className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-black tracking-widest text-white leading-none">
              KARMASETU
            </div>
            <div className="text-[8.5px] tracking-wider text-cyan-400/70 mt-0.5 leading-tight">
              INDUSTRIAL TRAINING ✦ AI
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative overflow-hidden ${
                      active
                        ? 'bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-900/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {/* Active left accent */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400/60" />
                    )}

                    {/* Icon with glow on active */}
                    <div className={`relative flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${active ? 'text-cyan-400' : ''}`}>
                      <Icon className="h-4 w-4" />
                      {active && (
                        <div className="absolute inset-0 blur-sm bg-cyan-400/30 rounded-full scale-150" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={`flex-1 font-medium transition-all duration-200 group-hover:translate-x-0.5 ${active ? 'font-semibold' : ''}`}>
                      {t(item.key)}
                    </span>

                    {/* Active dot indicator */}
                    {active && (
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Buddy AI Toggle */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setIsBuddyVisible(!isBuddyVisible)}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 border ${
            isBuddyVisible
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-900/20'
              : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bot className={`h-4 w-4 transition-all duration-300 ${isBuddyVisible ? 'scale-110 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`} />
            <span>Buddy AI असिस्टेंट</span>
          </div>
          <div className={`h-4 w-8 rounded-full p-0.5 transition-all duration-300 ${isBuddyVisible ? 'bg-cyan-500 shadow-inner' : 'bg-slate-700'}`}>
            <div className={`h-3 w-3 rounded-full bg-white transition-all duration-300 ${isBuddyVisible ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* User footer */}
      <div className="border-t border-white/5 bg-[#080e1a]/60 p-4">
        <div className="flex items-center gap-3">
          {/* Avatar with ring */}
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-cyan-900/40">
              {identity.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#080e1a]" title="Online" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white leading-none mb-1">{identity.name}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80">{t('nav.role.trainee')}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                <BookOpen className="h-2.5 w-2.5" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen md:flex">{sidebar}</div>

      {/* Mobile overlay with animation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
            onClick={onClose}
          />
          <div className="relative h-full animate-[slideInLeft_0.2s_ease]">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
