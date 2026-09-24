import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import type {
  AdminTreasuryExpenditureItem,
  AdminTreasuryLedger,
  AdminTreasuryOverview,
  AdminTreasuryRevenueSource,
} from '../types';
import { TreasuryView } from './treasury-view';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/treasury');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminTreasuryPage() {
  await requireAdminConsole(AREA.href);

  const [overview, transactionsRes, revenueRes, expenditureRes] = await Promise.all([
    apiOrNull<AdminTreasuryOverview>('/api/v1/admin/treasury/overview'),
    apiOrNull<{ items: AdminTreasuryLedger[]; next_cursor: string | null }>('/api/v1/admin/treasury/transactions'),
    apiOrNull<{
      items: AdminTreasuryRevenueSource[];
      total_24h_wld: string;
      total_7d_wld: string;
      total_30d_wld: string;
    }>('/api/v1/admin/treasury/revenue'),
    apiOrNull<{
      items: AdminTreasuryExpenditureItem[];
      total_24h_wld: string;
      total_7d_wld: string;
      total_30d_wld: string;
    }>('/api/v1/admin/treasury/expenditure'),
  ]);

  return (
    <div data-page="admin-treasury" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {overview === null ? (
        <EmptyState
          title="국고 현황을 불러오지 못했습니다."
          description="중앙 국고 및 비축금 데이터베이스 연결을 확인해 주세요."
        />
      ) : (
        <TreasuryView
          overview={overview}
          ledger={transactionsRes?.items ?? []}
          revenue={revenueRes}
          expenditure={expenditureRes}
        />
      )}
    </div>
  );
}
