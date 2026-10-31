import type { Metadata } from 'next';
import { publicApi, api } from '@/lib/api';
import {
  PensionPortalClient,
} from './pension-portal-client';
import { loadPensionMemberEvidence, parsePensionOverview } from './pension-source';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가상경제 국민연금 내역 조회 (정산 검증 중)',
  description: '머니버스 가상경제 연금의 기존 납입·수령 기록을 확인합니다. 신규 거래와 지급은 원장 정산 검증 전까지 중단됩니다.',
  robots: { index: false, follow: false },
};

export default async function PublicPensionPage() {
  const [overviewData, member] = await Promise.all([
    publicApi<unknown>('/api/v1/pension/overview', 30),
    loadPensionMemberEvidence((path) => api<unknown>(path)),
  ]);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PensionPortalClient
        overview={parsePensionOverview(overviewData)}
        myAccount={member.account}
        contributions={member.contributions}
        payouts={member.payouts}
        userCashBalance={member.cashBalance ?? '0'}
        isLoggedIn={member.isLoggedIn}
        sourceEvidence={member.sourceEvidence}
      />
    </div>
  );
}
