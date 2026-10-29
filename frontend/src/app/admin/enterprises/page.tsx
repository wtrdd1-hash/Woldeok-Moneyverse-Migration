import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import Link from 'next/link';
import { parseEnterpriseEvidence } from './enterprise-evidence';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { EnterpriseControlTower } from './enterprise-control-tower';

export const dynamic = 'force-dynamic';

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

  const evidence = parseEnterpriseEvidence({ overview, soes, privateEnterprises, dividendLogs });

  return (
    <div data-page="admin-enterprises" className="mv-page mv-page--admin grid gap-6">
      <AdminBack />
      <PageHeader eyebrow={AREA.eyebrow} title={AREA.title}>
        {AREA.summary}
      </PageHeader>

      {evidence === null ? (
        <div role="alert" className="space-y-3">
          <EmptyState
            title="국가지주회사 및 공기업 데이터를 불러오지 못했습니다."
            description="재무정보 일부가 누락되었거나 검증되지 않았습니다. 기존 수치를 정상으로 표시하지 않습니다."
          />
          <Link
            href="/admin/enterprises"
            className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 underline underline-offset-4"
          >
            다시 조회
          </Link>
        </div>
      ) : (
        <EnterpriseControlTower
          initialOverview={evidence.overview}
          initialSoes={evidence.soes}
          initialPrivate={evidence.privateEnterprises}
          initialDividendLogs={evidence.dividendLogs}
        />
      )}
    </div>
  );
}
