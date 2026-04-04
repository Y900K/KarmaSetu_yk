'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ADMIN_USER } from '@/data/mockAdminData';

export type AdminIdentity = {
  name: string;
  email: string;
  role: string;
  title: string;
  department: string;
  avatar: string; // Initials
};

interface AdminIdentityContextType {
  admin: AdminIdentity;
  updateAdmin: (updates: Partial<AdminIdentity>) => void;
}

const AdminIdentityContext = createContext<AdminIdentityContextType | undefined>(undefined);

function getInitialAdmin(): AdminIdentity {
  if (typeof window === 'undefined') return ADMIN_USER;
  const saved = localStorage.getItem('ks_admin_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse admin profile from localStorage', e);
    }
  }
  return ADMIN_USER;
}

export function AdminIdentityProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminIdentity>(getInitialAdmin);

  const updateAdmin = useCallback((updates: Partial<AdminIdentity>) => {
    setAdmin((prev) => {
      const next = { ...prev, ...updates };
      // Helper to update avatar if name changes
      if (updates.name) {
        next.avatar = updates.name.split(' ').map(n => n[0]).join('').toUpperCase();
      }
      localStorage.setItem('ks_admin_profile', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AdminIdentityContext.Provider value={{ admin, updateAdmin }}>
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
