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
  title: '국가 국민연금공단 (NPS) 대국민 포털 | 평생 기초연금 적립 & 수령',
  description: '중앙 국고(VAULT_MAIN)와 연동되어 국부펀드의 복리 운용 레버리지로 평생 시간당 기초연금을 확정 지급하는 월덱 국민연금 공식 포털입니다.',
};

export default async function PublicPensionPage() {
  const overview = await publicApi<NationalPensionOverview>('/api/v1/pension/overview', 30).catch(() => null);
  if (!overview) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">국민연금 기록 조회</h1>
        <div role="alert" className="mt-6 rounded-lg border border-amber-500/50 p-5">
          기금 기록을 확인할 수 없습니다. 현재 금액을 0 WLD 또는 임의의 국고 잔액으로 표시하지 않습니다. 잠시 후 다시 조회해 주세요.
        </div>
      </main>
    );
  }

  let myAccount: MyPensionAccount | null = null;
  let contributions: ContributionLog[] = [];
  let payouts: PayoutLog[] = [];
  let userCashBalance = '0';
  let isLoggedIn = false;
  let payoutHistoryUnavailable = false;
  let contributionHistoryUnavailable = false;
  let accountUnavailable = false;
  let walletBalanceUnavailable = false;

  const [accountResult, contributionResult, payoutResult, walletResult] = await Promise.allSettled([
    api<MyPensionAccount>('/api/v1/pension/my-account'),
    api<ContributionLog[]>('/api/v1/pension/my-contributions'),
    api<PayoutLog[]>('/api/v1/pension/my-payouts'),
    api<{ cashBalance?: string | number; balance?: string | number }>('/api/v1/wallet/summary'),
  ]);

  if (accountResult.status === 'fulfilled' && accountResult.value?.id) {
    myAccount = accountResult.value;
    isLoggedIn = true;
  } else if (
    accountResult.status === 'fulfilled' ||
    (accountResult.reason as { status?: number } | null)?.status !== 401
  ) {
    accountUnavailable = true;
  }
  contributionHistoryUnavailable = contributionResult.status !== 'fulfilled' || !Array.isArray(contributionResult.value);
  payoutHistoryUnavailable = payoutResult.status !== 'fulfilled' || !Array.isArray(payoutResult.value);
  if (contributionResult.status === 'fulfilled' && Array.isArray(contributionResult.value)) {
    contributions = contributionResult.value;
  }
  if (payoutResult.status === 'fulfilled' && Array.isArray(payoutResult.value)) {
    payouts = payoutResult.value;
  }
  if (walletResult.status === 'fulfilled' && walletResult.value) {
    const raw = walletResult.value.cashBalance ?? walletResult.value.balance;
    const canonical = canonicalIntegerString(raw ?? '');
    if (canonical !== null) userCashBalance = canonical;
    else walletBalanceUnavailable = true;
  } else {
    walletBalanceUnavailable = true;
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
        payoutHistoryUnavailable={payoutHistoryUnavailable}
        contributionHistoryUnavailable={contributionHistoryUnavailable}
        accountUnavailable={accountUnavailable}
        walletBalanceUnavailable={walletBalanceUnavailable}
      />
    </div>
  );
}
