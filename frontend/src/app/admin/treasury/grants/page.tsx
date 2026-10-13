import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../../admin-back';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';
import { AdminGrantsView } from './admin-grants-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '창업 그랜트 심사 대시보드 | 국고 관리자 콘솔',
  robots: { index: false, follow: false },
};

const DEFAULT_APPLICATIONS: TreasuryGrantApplication[] = [
  {
    id: 'GRANT-2026-001',
    businessName: '머니버스 AMM 덱스 (월덕스왑)',
    applicantId: 'usr-9281',
    applicantMasked: 'defi***developer',
    requestedAmountWld: 50000,
    businessPlan: '슬리피지 0.05% 이하의 수학적 오토메이티드 마켓 메이킹 풀을 구축하여 유저 간 즉시 토큰 교환 인프라를 제공하겠습니다.',
    status: 'PENDING_REVIEW',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'GRANT-2026-002',
    businessName: '네오서울 메가물류 물류센터',
    applicantId: 'usr-1102',
    applicantMasked: 'logis***master',
    requestedAmountWld: 80000,
    businessPlan: '도시 부지 공간에 대형 물류 허브를 건립하여 플레이어 직업 아이템 배송 시간을 50% 단축하고 물류 수수료 수입을 창출합니다.',
    status: 'PENDING_REVIEW',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'GRANT-2026-003',
    businessName: '덕비트 AI 퀀트 리서치',
    applicantId: 'usr-4419',
    applicantMasked: 'quant***wizard',
    requestedAmountWld: 30000,
    businessPlan: '고빈도 알고리즘 봇을 오픈소스로 공개하여 가상 주식 시장의 가격 왜곡을 축소하고 개미 투자자에게 실시간 분석 차트를 제공합니다.',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reviewNote: '국고 30,000 WLD 지급 집행 완료 (승인: 오퍼레이터)',
  },
];

export default async function AdminTreasuryGrantsPage() {
  await requireAdminConsole('/admin/treasury/grants');

  const res = await apiOrNull<{ applications: TreasuryGrantApplication[] }>(
    '/api/v1/admin/treasury/grants'
  );

  const applications = res?.applications ?? DEFAULT_APPLICATIONS;

  return (
    <div data-page="admin-treasury-grants" className="mv-page mv-page--admin grid gap-6 pb-32 sm:pb-12">
      <AdminBack />
      <PageHeader
        eyebrow="중앙 국고 재정 관리자"
        title="창업·벤처 그랜트 심사 대시보드"
      >
        대국민 공개 포털에서 시민들이 발의 및 접수한 벤처 창업 지원금 신청서를 심사하고, 승인 시 국고 금고(VAULT_MAIN)에서 신청자 지갑으로 원자적 시드머니를 지급합니다.
      </PageHeader>

      <AdminGrantsView initialApplications={applications} />
    </div>
  );
}
