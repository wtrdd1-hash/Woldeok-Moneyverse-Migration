import type { Metadata } from 'next';
import { publicApi, api } from '@/lib/api';
import {
  PensionPortalClient,
  type NationalPensionOverview,
  type MyPensionAccount,
  type ContributionLog,
  type PayoutLog,
} from './pension-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국가 국민연금공단 (NPS) 대국민 포털 | 평생 기초연금 적립 & 수령',
  description: '중앙 국고(VAULT_MAIN)와 연동되어 국부펀드의 복리 운용 레버리지로 평생 시간당 기초연금을 확정 지급하는 월덱 국민연금 공식 포털입니다.',
};

export default async function PublicPensionPage() {
  const overviewData = await publicApi<NationalPensionOverview>('/api/v1/pension/overview', 30);

  const overview: NationalPensionOverview = overviewData ?? {
    totalAumWld: '0',
    totalSubscribersCount: 0,
    totalRetiredReceiversCount: 0,
    totalPensionPaidWld: '0',
    benchmarkAnnualPayoutRate: '8.0%',
    vaultMainBalanceWld: '25000000',
  };

  let myAccount: MyPensionAccount | null = null;
  let contributions: ContributionLog[] = [];
  let payouts: PayoutLog[] = [];
  let userCashBalance = 0;
  let isLoggedIn = false;

  try {
    const [acc, contribs, payLogs, wallet] = await Promise.all([
      api<MyPensionAccount>('/api/v1/pension/my-account'),
      api<ContributionLog[]>('/api/v1/pension/my-contributions').catch(() => []),
      api<PayoutLog[]>('/api/v1/pension/my-payouts').catch(() => []),
      api<{ cashBalance?: number; balance?: number }>('/api/v1/wallet/summary').catch(() => null),
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
    const walletData = wallet as { cashBalance?: number; balance?: number } | null;
    userCashBalance = Number(walletData?.cashBalance ?? walletData?.balance ?? 0);
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
