'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, BookOpen, Clock } from 'lucide-react';
import { useAPI } from '@/lib/hooks/useAPI';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface NotificationProps {
  role: 'admin' | 'trainee';
}

export interface NotificationItem {
  _id: string;
  type: string;
  level: 'INFO' | 'HIGH' | 'CRITICAL';
  title: string;
  desc: string;
  link?: string;
  status: 'open' | 'read';
  createdAt: string;
}

export default function NotificationCenter({ role }: NotificationProps) {
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, mutate, isLoading } = useAPI<{ ok: boolean; notifications: NotificationItem[] }>(
    '/api/notifications?limit=10',
    { refreshInterval: 30000 }
  );

  const notifications = data?.ok ? data.notifications : [];
  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      mutate();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      mutate();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string, level: string) => {
    if (level === 'CRITICAL' || level === 'HIGH') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case 'trainee_completion':
      case 'certificate_earned':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'course_assigned':
      case 'trainee_enrollment':
        return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
      >
        <Bell className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-[#020817]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-12 right-0 w-80 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between bg-slate-900/50">
            <span className="text-sm font-bold text-white tracking-tight uppercase">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 opacity-50"></div>
                <p className="text-xs text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-10 w-10 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-sm text-slate-300 font-medium">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-1">No unread notifications.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div 
                  key={item._id}
                  className="group relative p-4 border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-slate-800 transition-colors">
                      {getIcon(item.type, item.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link 
                          href={item.link || '#'} 
                          className="text-sm text-white font-bold leading-tight hover:text-cyan-400 transition-colors truncate"
                          onClick={() => {
                            markAsRead(item._id);
                            setShowDropdown(false);
                          }}
                        >
                          {item.title}
                        </Link>
                        <button 
                          onClick={() => markAsRead(item._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-opacity cursor-pointer"
                          title="Clear notification"
                        >
                          <span className="text-[10px]">✕</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {getTimeAgo(item.createdAt)}
                        </span>
                        {item.level !== 'INFO' && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                            item.level === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {item.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link 
            href={role === 'admin' ? '/admin/alerts' : '/trainee/dashboard'} 
            onClick={() => setShowDropdown(false)}
            className="block w-full py-3 bg-slate-900/80 text-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all uppercase tracking-widest border-t border-[#1e293b]"
          >
            View Full Notification Center
          </Link>
        </div>
      )}
    </div>
  );
}
