import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { isLoggedInMember } from '@/lib/session';
import { loadTreasuryPublicState } from './treasury-verified-state';
import { TreasuryPortalClient } from './treasury-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '[2026] 대국민 국고(Treasury) 포털 — 현재 회계기와 재정 대사 | 월덕 머니버스',
  description:
    '정식 복식원장으로 검증된 현재 국고 잔액만 공개합니다. 과거 지급·발권 실적과 수혜 정보는 독립 증빙 전까지 표시하지 않습니다.',
  keywords: ['국고', '재정 대사', '복식부기', '국고 포털', 'WLD', '머니버스'],
  openGraph: {
    title: '월덕 머니버스 — 검증된 현재 국고 회계기',
    description: '현재 국고 대사와 미검증 과거 지급을 구분해 안내합니다.',
    type: 'website',
  },
};

export default async function TreasuryPage() {
  const state = await loadTreasuryPublicState(await isLoggedInMember());
  const { overview, recentLedger, userEligibility } = state;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 sm:pb-16 select-none">
      <PageHeader
        eyebrow="중앙정부 재정 & 공공 복지"
        title="대국민 공개 국고(Treasury) 포털"
      >
        {state.ok
          ? '현재 회계기 국고 잔액은 독립 원장 대사로 검증됐습니다. 과거 지급·발권·수혜 실적은 별도 원장 증빙이 부족해 아직 미검증이며 신규 지급도 승인되지 않았습니다.'
          : '현재 국고 회계기의 독립 대사가 확인되지 않았습니다. 잔액·지급 실적은 미검증 상태로 유지하고 모든 신규 지급은 중지합니다.'}
      </PageHeader>
      <TreasuryPortalClient
        initialOverview={overview}
        initialLedger={recentLedger}
        initialEligibility={userEligibility}
      />
    </div>
  );
}
