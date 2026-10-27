import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { KdicControlTower } from './kdic-control-tower';
import { parseKdicOverview } from './kdic-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '예금보험공사(KDIC) 금융안정기금 & 뱅크런 관제탑 | 관리자 콘솔',
  description: '가상 예금보험기금과 금융기관 상태를 검증된 관리자 데이터로 조회합니다.',
  robots: { index: false, follow: false },
};

export default async function AdminKdicPage() {
  await requireAdminConsole('/admin/kdic');

  const overviewData = parseKdicOverview(
    await api<unknown>('/api/v1/admin/kdic/overview').catch(() => null),
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <KdicControlTower initialData={overviewData} />
    </div>
  );
}
