import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import { PensionControlTower } from './pension-control-tower';
import { parsePensionOverview, parsePensionPayoutLogs } from './pension-evidence';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국민연금 (NPS) 공적 기금 관제 타워 | 관리자 콘솔',
  description: '가상 연금 기금과 지급 이력을 관리자 권한으로 조회합니다.',
  robots: { index: false, follow: false },
};

export default async function AdminPensionPage() {
  await requireAdminConsole('/admin/pension');

  const [overviewResponse, payoutResponse] = await Promise.all([
    api<unknown>('/api/v1/admin/pension/overview').catch(() => null),
    api<unknown>('/api/v1/admin/pension/recent-payouts?limit=30').catch(() => null),
  ]);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PensionControlTower
        initialOverview={parsePensionOverview(overviewResponse)}
        initialPayoutLogs={parsePensionPayoutLogs(payoutResponse)}
      />
    </div>
  );
}
