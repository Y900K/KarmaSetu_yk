'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { ToastProvider } from '@/components/admin/shared/Toast';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

import { AdminIdentityProvider } from '@/context/AdminIdentityContext';
import { useLanguage } from '@/context/LanguageContext';
import { GlobalStatsProvider } from '@/context/GlobalStatsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  // Global keyboard shortcut for sidebar toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const verifyAdminSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          if (mounted) setAuthState('denied');
          router.replace('/login');
          return;
        }

        const payload = await response.json().catch(() => ({}));
        const role = payload?.user?.role;

        if (role === 'admin') {
          if (mounted) setAuthState('allowed');
          return;
        }

        if (mounted) setAuthState('denied');
        router.replace('/login');
      } catch {
        if (mounted) setAuthState('denied');
        router.replace('/login');
      }
    };

    verifyAdminSession();

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
    <AdminIdentityProvider>
      <ToastProvider>
        <GlobalStatsProvider scope="admin">
          <div className="flex min-h-screen bg-[#020817] text-white">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} />
          <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
            <AdminTopbar onMenuClick={() => setSidebarOpen(true)} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isCollapsed={isSidebarCollapsed} />
            <main className="flex-1 px-4 sm:px-8 py-6">{children}</main>
            <ChatbotWidget />
          </div>
        </div>
        </GlobalStatsProvider>
      </ToastProvider>
    </AdminIdentityProvider>
  );
}
