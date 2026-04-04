'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TraineeSidebar from './TraineeSidebar';
import TraineeTopbar from './TraineeTopbar';
import { ToastProvider } from '@/components/admin/shared/Toast';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { TraineeIdentityProvider } from '@/context/TraineeIdentityContext';
import { GlobalStatsProvider } from '@/context/GlobalStatsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  React.useEffect(() => {
    let mounted = true;

    const verifyTraineeSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          if (mounted) setAuthState('denied');
          router.replace('/login?role=trainee');
          return;
        }

        const payload = await response.json().catch(() => ({}));
        const role = payload?.user?.role;

        if (role === 'trainee') {
          if (mounted) setAuthState('allowed');
          return;
        }

        if (mounted) setAuthState('denied');
        if (role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }

        router.replace('/login?role=trainee');
      } catch {
        if (mounted) setAuthState('denied');
        router.replace('/login?role=trainee');
      }
    };

    verifyTraineeSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (authState !== 'allowed') {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-300 font-medium">
            {authState === 'checking' ? t('admin.layout.verifying_access') : t('admin.layout.redirecting_login')}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <ToastProvider>
      <TraineeIdentityProvider>
        <GlobalStatsProvider scope="trainee">
          <div className="flex min-h-screen bg-[#020817] text-white">
            <TraineeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
              <TraineeTopbar 
                onMenuClick={() => setSidebarOpen(true)} 
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              />
              <main className="flex-1 px-4 sm:px-8 py-6">{children}</main>
            </div>
            <ChatbotWidget />
          </div>
        </GlobalStatsProvider>
      </TraineeIdentityProvider>
    </ToastProvider>
  );
}
