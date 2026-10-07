import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import {
  PensionControlTower,
  type NationalPensionOverview,
  type PayoutLogItem,
} from './pension-control-tower';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국민연금 (NPS) 공적 기금 관제 타워 | 관리자 콘솔',
  description: '국민 기여금 적립 총액(AUM), 연금 수령자 관리, 시간당 평생 기초연금 일괄 지급을 총괄 관제합니다.',
};

export default async function AdminPensionPage() {
  await requireAdminConsole('/admin/pension');

  const [overview, payoutLogs] = await Promise.all([
    api<NationalPensionOverview>('/api/v1/admin/pension/overview').catch(() => ({
      totalAumWld: '0',
      totalSubscribersCount: 0,
      totalRetiredReceiversCount: 0,
      totalPensionPaidWld: '0',
      benchmarkAnnualPayoutRate: '8.0%',
      vaultMainBalanceWld: '25000000',
    })),
    api<PayoutLogItem[]>('/api/v1/admin/pension/recent-payouts?limit=30').catch(() => []),
  ]);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PensionControlTower
        initialOverview={overview}
        initialPayoutLogs={payoutLogs}
      />
    </div>
  );
}
