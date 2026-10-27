import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { EnterpriseControlTower } from './enterprise-control-tower';
import { parseEnterpriseEvidence } from './enterprise-evidence';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const AREA = adminArea('/admin/enterprises');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminEnterprisesPage() {
  await requireAdminConsole(AREA.href);

  const [overview, soes, privateEnterprises, dividendLogs] = await Promise.all([
    apiOrNull<unknown>('/api/v1/admin/enterprises/overview'),
    apiOrNull<unknown>('/api/v1/admin/enterprises/soes'),
    apiOrNull<unknown>('/api/v1/admin/enterprises/private'),
    apiOrNull<unknown>('/api/v1/admin/enterprises/dividend-logs'),
  ]);

  const verified = parseEnterpriseEvidence(overview, soes, privateEnterprises, dividendLogs);

  return (
    <div data-page="admin-enterprises" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {verified === null ? (
        <div role="alert" aria-live="assertive" className="grid gap-3">
          <EmptyState
            title="국가지주회사 및 공기업 데이터를 불러오지 못했습니다."
            description="조회에 실패했거나 검증할 수 없는 데이터입니다. 실제 기록 0건과 구분합니다."
          />
          <a
            href="/admin/enterprises"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium sm:w-fit"
          >
            다시 조회
          </a>
        </div>
      ) : (
        <EnterpriseControlTower
          initialOverview={verified.overview}
          initialSoes={verified.soes}
          initialPrivate={verified.privateEnterprises}
          initialDividendLogs={verified.dividendLogs}
        />
      )}
    </div>
  );
}
