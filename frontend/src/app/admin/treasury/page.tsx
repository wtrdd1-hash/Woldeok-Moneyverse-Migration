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
import { SwfControlPanel } from './swf-control-panel';
import { parseSwfEvidence } from './swf-evidence';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/treasury');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminTreasuryPage() {
  await requireAdminConsole(AREA.href);

  const [overview, transactionsRes, revenueRes, expenditureRes, swfRes] = await Promise.all([
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
    apiOrNull<unknown>('/api/v1/admin/treasury/swf'),
  ]);

  const swfEvidence = parseSwfEvidence(swfRes);

  return (
    <div data-page="admin-treasury" className="mv-page mv-page--admin grid gap-6 pb-32 sm:pb-12">
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
        <>
          {swfEvidence === null ? (
            <section role="alert" className="rounded-xl border border-amber-500/40 p-5 text-sm" aria-label="국부펀드 관측 상태">
              <p className="font-semibold">국부펀드 관측 정보를 검증할 수 없습니다.</p>
              <p>관리자 API 또는 데이터베이스의 재무정보를 확인하지 못했습니다. 투자 자산 0건을 의미하지 않으며, 검증 전 정책 변경과 자금 집행은 표시하지 않습니다.</p>
              <a href="/admin/treasury" className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 underline focus-visible:outline-2 focus-visible:outline-offset-2">다시 조회</a>
            </section>
          ) : (
            <SwfControlPanel
              initialConfig={swfEvidence.config}
              initialPortfolios={swfEvidence.portfolios}
              initialEvents={swfEvidence.events}
            />
          )}
          <TreasuryView
            overview={overview}
            ledger={transactionsRes?.items ?? []}
            revenue={revenueRes}
            expenditure={expenditureRes}
          />
        </>
      )}
    </div>
  );
}
