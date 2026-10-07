import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { api } from '@/lib/api';
import {
  BondControlTower,
  type CouponLogItem,
  type TreasuryBondItem,
  type TreasuryBondsOverview,
} from './bond-control-tower';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '기획재정국채 (KTB) 통합 관제 타워 | 관리자 콘솔',
  description: '국가 국채 발행, 표면금리 조정, 시간당 쿠폰 이자 정산 및 국고 자금 조달을 총괄 관제합니다.',
};

export default async function AdminBondsPage() {
  await requireAdminConsole('/admin/bonds');

  const [overview, bonds, couponLogs] = await Promise.all([
    api<TreasuryBondsOverview>('/api/v1/admin/bonds/overview').catch(() => ({
      totalBondsActive: 3,
      totalFundedWld: '0',
      totalHoldersCount: 0,
      totalCouponsPaidWld: '0',
      benchmark1YYield: '4.50%',
      benchmark3YYield: '5.20%',
      benchmark5YYield: '6.50%',
    })),
    api<TreasuryBondItem[]>('/api/v1/admin/bonds/list').catch(() => []),
    api<CouponLogItem[]>('/api/v1/admin/bonds/coupon-logs?limit=30').catch(() => []),
  ]);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BondControlTower
        initialOverview={overview}
        initialBonds={bonds}
        initialLogs={couponLogs}
      />
    </div>
  );
}
