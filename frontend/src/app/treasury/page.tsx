import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { isLoggedInMember } from '@/lib/session';
import { buildUnverifiedTreasuryState } from './treasury-public-state';
import { TreasuryPortalClient } from './treasury-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '[2026] 대국민 국고(Treasury) 포털 — 5대 공공 국고 활용처 & 투명 재정 공시 | 월덕 머니버스',
  description:
    '월덕 머니버스 중앙정부 국고 금고(VAULT_MAIN) 정보 포털. 재정원장과 통화량의 독립 대사 검증이 완료되기 전까지 실제 잔액·지급 실적을 표시하지 않습니다.',
  keywords: [
    '국고',
    '국고 포털',
    '기본배당',
    '청년 창업 지원금',
    '긴급 구호금',
    'WLD 소각',
    '국채 금리',
    '월덕 머니버스',
    '머니버스 국고',
  ],
  openGraph: {
    title: '[2026] 대국민 국고(Treasury) 포털 — 5대 공공 국고 혜택 & 투명 재정 공시',
    description:
      '재정 대사 검증 상태 및 국고 프로그램의 운영 조건을 안내합니다. 미검증 지표와 지급 내역은 제공하지 않습니다.',
    type: 'website',
  },
};

export default async function TreasuryPage() {
  const { overview, recentLedger, userEligibility } = buildUnverifiedTreasuryState(await isLoggedInMember());

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 sm:pb-16 select-none">
      <PageHeader
        eyebrow="중앙정부 재정 & 공공 복지"
        title="대국민 공개 국고(Treasury) 포털"
      >
        국고·통화량의 독립 정산 대사가 완료되지 않아 실잔액과 지급 실적을 공개할 수 없습니다. 아래 프로그램 설명은 제도 안내이며 현재 지급 가능 여부를 보증하지 않습니다.
      </PageHeader>

      <TreasuryPortalClient
        initialOverview={overview}
        initialLedger={recentLedger}
        initialEligibility={userEligibility}
      />
    </div>
  );
}
