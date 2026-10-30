import type { Metadata } from 'next';
import { publicApi, api } from '@/lib/api';
import { canonicalIntegerString } from '@/lib/money';
import {
  PensionPortalClient,
  type NationalPensionOverview,
  type MyPensionAccount,
  type ContributionLog,
  type PayoutLog,
} from './pension-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국가 국민연금공단 (NPS) 대국민 포털 | 기존 납입·수령 기록 조회 (정산 중)',
  description: '가상경제 국민연금의 기존 납입·수령 기록을 조회하는 포털입니다. 연 지급률과 금융 원장 정산 검증이 완료될 때까지 신규 거래 및 지급은 중단됩니다.',
};

export default async function PublicPensionPage() {
  const overviewData = await publicApi<NationalPensionOverview>('/api/v1/pension/overview', 30);

  const overview = overviewData ?? null;

  let myAccount: MyPensionAccount | null = null;
  let contributions: ContributionLog[] = [];
  let payouts: PayoutLog[] = [];
  let userCashBalance = '0';
  let isLoggedIn = false;

  try {
    const [acc, contribs, payLogs, wallet] = await Promise.all([
      api<MyPensionAccount>('/api/v1/pension/my-account'),
      api<ContributionLog[]>('/api/v1/pension/my-contributions').catch(() => []),
      api<PayoutLog[]>('/api/v1/pension/my-payouts').catch(() => []),
      api<{ cashBalance?: string | number; balance?: string | number }>('/api/v1/wallet/summary').catch(() => null),
    ]);

    if (acc && acc.id) {
      myAccount = acc;
      isLoggedIn = true;
    }
    if (Array.isArray(contribs)) {
      contributions = contribs;
    }
    if (Array.isArray(payLogs)) {
      payouts = payLogs;
    }
    const walletData = wallet as { cashBalance?: string | number; balance?: string | number } | null;
    userCashBalance = canonicalIntegerString(walletData?.cashBalance ?? walletData?.balance ?? '0') ?? '0';
  } catch {
    isLoggedIn = false;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PensionPortalClient
        overview={overview}
        myAccount={myAccount}
        contributions={contributions}
        payouts={payouts}
        userCashBalance={userCashBalance}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
