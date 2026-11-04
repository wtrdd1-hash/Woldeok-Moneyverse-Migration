import type { Metadata } from 'next';
import Link from 'next/link';
import { FundedTreasuryPensionPanel } from './funded-treasury-pension-panel';
import { publicApi, api } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
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
  title: '국가 국민연금공단 (NPS) | 신규 정식 원장 적립·환급 및 과거 내역',
  description: '신규 국민연금 적립·환급은 정식 국고 원장의 복식분개와 불변 영수증으로 처리합니다. 과거 미증빙 납입·정기 지급 내역은 별도 조회하며, 재원 없는 정기 지급은 중단됩니다.',
};

export default async function PublicPensionPage() {
  const overviewData = await publicApi<NationalPensionOverview>('/api/v1/pension/overview', 30);

  const overview = overviewData ?? null;

  let myAccount: MyPensionAccount | null = null;
  let contributions: ContributionLog[] = [];
  let payouts: PayoutLog[] = [];
  let userCashBalance = '0';
  const isLoggedIn = await isLoggedInMember();

  try {
    const [acc, contribs, payLogs, wallet] = await Promise.all([
      api<MyPensionAccount>('/api/v1/pension/my-account'),
      api<ContributionLog[]>('/api/v1/pension/my-contributions').catch(() => []),
      api<PayoutLog[]>('/api/v1/pension/my-payouts').catch(() => []),
      api<{ cashBalance?: string | number; balance?: string | number }>('/api/v1/wallet/summary').catch(() => null),
    ]);

    if (acc && acc.id) {
      myAccount = acc;
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
    // Session state comes from the real session, not legacy pension account existence.
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <section aria-label="정식 원장 국민연금 납입·환급" className="mb-8">
        {isLoggedIn ? (
          <FundedTreasuryPensionPanel />
        ) : (
          <div role="status" className="rounded-xl border border-emerald-500/30 bg-card p-5">
            <h2 className="font-semibold text-foreground">신규 정식 원장 국민연금</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              로그인 후 정식 원장 국민연금 신규 적립·환급을 이용할 수 있습니다.
              기존 미증빙 연금 기록 및 정기 지급은 별도로 보호됩니다.
            </p>
            <Link href="/login" className="mt-3 inline-block text-sm font-medium text-emerald-500 underline underline-offset-4">
              로그인하기
            </Link>
          </div>
        )}
      </section>
      <section aria-label="기존 국민연금 기록">
      <PensionPortalClient
        overview={overview}
        myAccount={myAccount}
        contributions={contributions}
        payouts={payouts}
        userCashBalance={userCashBalance}
        isLoggedIn={isLoggedIn}
      />
      </section>
    </div>
  );
}
