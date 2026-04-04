'use client';

import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import PageHeader from '@/components/admin/shared/PageHeader';
import AdminProfileContent from '@/components/admin/profile/AdminProfileContent';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminProfilePage() {
  const { t } = useLanguage();

  return (
    <AdminLayout>
      <PageHeader title={t('admin.profile.title')} sub={t('admin.profile.subtitle')} />
      <AdminProfileContent />
    </AdminLayout>
  );
}
