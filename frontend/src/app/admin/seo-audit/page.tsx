import React from 'react';
import type { Metadata } from 'next';
import { AdminSeoAuditView } from '@/components/admin-seo-audit-view';

export const metadata: Metadata = {
  title: '검색엔진 수집 감사 관제 타워 | 월덕 머니버스 관리자',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSeoAuditPage() {
  return <AdminSeoAuditView />;
}
