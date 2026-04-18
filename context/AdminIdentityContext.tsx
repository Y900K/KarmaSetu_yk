'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type AdminIdentity = {
  name: string;
  email: string;
  role: string;
  title: string;
  department: string;
  avatar: string; // Initials
};

const DEFAULT_ADMIN: AdminIdentity = {
  name: 'Admin User',
  email: '',
  role: 'admin',
  title: 'System Administrator',
  department: 'Operations',
  avatar: 'AU',
};

interface AdminIdentityContextType {
  admin: AdminIdentity;
  isLoading: boolean;
  updateAdmin: (updates: Partial<AdminIdentity>) => void;
  refreshAdmin: () => Promise<void>;
}

const AdminIdentityContext = createContext<AdminIdentityContextType | undefined>(undefined);

export function AdminIdentityProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminIdentity>(DEFAULT_ADMIN);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    // Avoid running on trainee routes
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/trainee')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok && data.user && data.user.role === 'admin') {
        const name = data.user.fullName || data.user.name || 'Admin';
        const department = data.user.department || 'Operations';
        
        setAdmin({
          name,
          email: data.user.email || '',
          role: 'admin',
          department,
          title: 'System Administrator',
          avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        });
      } else if (res.status === 401 || (data.ok && data.user && data.user.role !== 'admin')) {
        // Not an admin or not logged in - clear state
        setAdmin(DEFAULT_ADMIN);
      }
    } catch (error) {
      console.error('Failed to refresh admin identity:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  const updateAdmin = useCallback((updates: Partial<AdminIdentity>) => {
    setAdmin((prev) => {
      const next = { ...prev, ...updates };
      if (updates.name) {
        next.avatar = updates.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
      return next;
    });
  }, []);

  return (
    <AdminIdentityContext.Provider value={{ admin, isLoading, updateAdmin, refreshAdmin }}>
      {children}
    </AdminIdentityContext.Provider>
  );
}

export function useAdminIdentity() {
  const context = useContext(AdminIdentityContext);
  if (context === undefined) {
    throw new Error('useAdminIdentity must be used within AdminIdentityProvider.');
  }
  return context;
}
