import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import {
  EnterpriseControlTower,
  type DividendLogItem,
  type PrivateEnterpriseItem,
  type StateEnterpriseItem,
  type StateHoldingOverviewItem,
} from './enterprise-control-tower';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/enterprises');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminEnterprisesPage() {
  await requireAdminConsole(AREA.href);

  const [overview, soes, privateEnterprises, dividendLogs] = await Promise.all([
    apiOrNull<StateHoldingOverviewItem>('/api/v1/admin/enterprises/overview'),
    apiOrNull<StateEnterpriseItem[]>('/api/v1/admin/enterprises/soes'),
    apiOrNull<PrivateEnterpriseItem[]>('/api/v1/admin/enterprises/private'),
    apiOrNull<DividendLogItem[]>('/api/v1/admin/enterprises/dividend-logs'),
  ]);

  return (
    <div data-page="admin-enterprises" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {overview === null ? (
        <EmptyState
          title="국가지주회사 및 공기업 데이터를 불러오지 못했습니다."
          description="월덱 국가투자공사(WSHC) 데이터베이스 연결 상태를 확인해 주세요."
        />
      ) : (
        <EnterpriseControlTower
          initialOverview={overview}
          initialSoes={soes ?? []}
          initialPrivate={privateEnterprises ?? []}
          initialDividendLogs={dividendLogs ?? []}
        />
      )}
    </div>
  );
}
