import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { KdicControlTower, type KdicOverviewData } from './kdic-control-tower';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '예금보험공사(KDIC) 금융안정기금 & 뱅크런 관제탑 | 관리자 콘솔',
  description: '예금자보호기금 건전성 모니터링, 부보 금융기관 BIS 비율 및 뱅크런 비상 대위변제 관제탑',
};

export default async function AdminKdicPage() {
  await requireAdminConsole('/admin/kdic');

  const overviewData = await api<{ success: boolean; data: KdicOverviewData }>('/api/v1/admin/kdic/overview')
    .then((res) => res?.data || null)
    .catch(() => null);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KdicControlTower initialData={overviewData} />
    </div>
  );
}
