import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { loadGrants } from '@/app/api/treasury/apply-grant/route';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';
import { AdminGrantsView } from './admin-grants-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '창업 그랜트 심사 대시보드 | 국고 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function AdminTreasuryGrantsPage() {
  await requireAdminConsole('/admin/treasury/grants');

  // Local legacy applications are unverified records, not approved ledger payments.
  const applications = loadGrants();

  return (
    <div data-page="admin-treasury-grants" className="mv-page mv-page--admin grid gap-6 pb-32 sm:pb-12">
      <AdminBack />
      <PageHeader
        eyebrow="중앙 국고 재정 관리자"
        title="창업·벤처 그랜트 심사 대시보드"
      >
        대국민 공개 포털에서 시민들이 발의 및 접수한 벤처 창업 지원금 신청서를 심사하고, 기존 신청 기록을 참고용으로 조회합니다. 실제 심사·국고 지급은 원장 및 관리자 감사 연동 검증 전까지 중단되어 있습니다.
      </PageHeader>

      <AdminGrantsView initialApplications={applications} />
    </div>
  );
}
