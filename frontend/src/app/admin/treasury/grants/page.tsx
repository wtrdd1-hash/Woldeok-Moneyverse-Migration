import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';
import { AdminGrantsView } from './admin-grants-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '창업·벤처 지원금 심사 관제탑 | 국고 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function AdminTreasuryGrantsPage() {
  await requireAdminConsole('/admin/treasury/grants');

  let applications: any[] = [];
  try {
    const res = await api<{ ok: boolean; applications: any[] }>('/api/v1/admin/treasury/grants');
    applications = res.applications ?? [];
  } catch {
    applications = [];
  }

  return (
    <div data-page="admin-treasury-grants" className="mv-page mv-page--admin grid gap-6 pb-32 sm:pb-12">
      <AdminBack />
      <PageHeader
        eyebrow="중앙 국고 복지·재정 관리국"
        title="창업·벤처 지원금 심사 관제탑"
      >
        국민(시민) 창업 지원금 신청서를 실시간 심사하고, 복지금고(VAULT_WELFARE)로부터 원자적 복식부기 전표를 발행하여 즉시 집행합니다. 승인 후 14일 내 미창업 시 환수(Clawback) 조치가 적용됩니다.
      </PageHeader>

      <AdminGrantsView initialApplications={applications} />
    </div>
  );
}
