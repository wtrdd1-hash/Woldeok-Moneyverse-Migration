import type { Metadata } from 'next';
import { publicApi, api, ApiError } from '@/lib/api';
import { canonicalIntegerString } from '@/lib/money';
import { verifyPensionAccount, verifyPensionContributions, verifyPensionOverview, verifyPensionPayouts } from './pension-source';
import {
  PensionPortalClient,
  type MyPensionAccount,
  type ContributionLog,
  type PayoutLog,
} from './pension-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '국가 국민연금공단 (NPS) 대국민 포털 | 기존 납입·수령 기록 조회 (정산 중)',
  description: '가상경제 국민연금의 기존 납입·수령 기록을 조회하는 포털입니다. 연 지급률과 금융 원장 정산 검증이 완료될 때까지 신규 거래 및 지급은 중단됩니다.',
  robots: { index: false, follow: false },
};

type MemberStatus = 'guest' | 'verified' | 'unavailable';

export default async function PublicPensionPage() {
  const overview = verifyPensionOverview(await publicApi<unknown>('/api/v1/pension/overview', 30));

  let myAccount: MyPensionAccount | null = null;
  let contributions: ContributionLog[] | null = null;
  let payouts: PayoutLog[] | null = null;
  let userCashBalance = '0';
  let walletVerified = false;
  let memberStatus: MemberStatus = 'guest';

  try {
    const accountData = await api<unknown>('/api/v1/pension/my-account');
    myAccount = verifyPensionAccount(accountData);
    if (myAccount) {
      memberStatus = 'verified';
      const owner = { userId: myAccount.user_id, accountId: myAccount.id };
      const [contribs, payLogs, wallet] = await Promise.allSettled([
        api<unknown>('/api/v1/pension/my-contributions'),
        api<unknown>('/api/v1/pension/my-payouts'),
        api<unknown>('/api/v1/wallet'),
      ]);
      contributions = contribs.status === 'fulfilled' ? verifyPensionContributions(contribs.value, owner) : null;
      payouts = payLogs.status === 'fulfilled' ? verifyPensionPayouts(payLogs.value, owner) : null;
      if (wallet.status === 'fulfilled' && wallet.value && typeof wallet.value === 'object' &&
          !Array.isArray(wallet.value)) {
        const value = wallet.value as Record<string, unknown>;
        const balances = value.balances;
        if (balances && typeof balances === 'object' && !Array.isArray(balances)) {
          const source = balances as Record<string, unknown>;
          const cash = canonicalIntegerString(source.totalAvailableAmount);
          if (source.currency === 'WLD' && typeof source.totalAvailableAmount === 'string' &&
              cash !== null && !cash.startsWith('-') && cash === source.totalAvailableAmount) {
            userCashBalance = cash;
            walletVerified = true;
          }
        }
      }
    } else {
      memberStatus = 'unavailable';
    }
  } catch (error) {
    memberStatus = error instanceof ApiError && error.status === 401 ? 'guest' : 'unavailable';
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PensionPortalClient
        overview={overview}
        myAccount={myAccount}
        contributions={contributions}
        payouts={payouts}
        userCashBalance={userCashBalance}
        walletVerified={walletVerified}
        memberStatus={memberStatus}
        isLoggedIn={memberStatus === 'verified'}
      />
    </div>
  );
}
