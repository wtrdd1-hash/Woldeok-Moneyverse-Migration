import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyBondMarkets } from './market-integrity';
import { canonicalUrl } from '@/lib/seo';
import { publicApi, api } from '@/lib/api';
import {
  BondsPortalClient,
  type UserHoldingItem,
} from './bonds-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '게임 내 가상 WLD 채권 거래소 | 머니버스',
  description: '실제 국가채권이나 금융상품이 아닌 머니버스 게임 내 가상 WLD 채권의 서버 조회 시점 금리와 잔여 좌수를 확인합니다.',
  alternates: { canonical: canonicalUrl('/bonds') },
  robots: { index: true, follow: true },
};

import { TreasuryDonationCard } from '@/components/treasury-donation-card';

export default async function PublicBondsPage() {
  const marketsData = await publicApi<unknown>('/api/v1/bonds/markets', 30);
  const market = verifyBondMarkets(marketsData);
  if (market === null) {
    return (
      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold">게임 내 가상 WLD 채권 거래소</h1>
        <div role="alert" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-5">
          <h2 className="font-semibold">국채 시장 정보를 확인할 수 없습니다</h2>
          <p className="mt-2 text-sm">서버에서 최신 가상 채권 금리와 청약 가능 좌수를 확인하지 못했습니다. 임의 금리나 잔여 좌수는 표시하지 않으며, 현재 청약은 이 화면에서 진행할 수 없습니다.</p>
          <Link href="/bonds" className="mt-4 inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold underline underline-offset-4">다시 조회하기</Link>
        </div>
      </main>
    );
  }

  const { overview, bonds } = market;

  // 로그인 상태인 경우 내 보유 채권 및 레포 대출 조회 시도
  let holdings: UserHoldingItem[] = [];
  let repoLoans: any[] = [];
  let isLoggedIn = false;

  try {
    const [userHoldings, userRepoLoans] = await Promise.all([
      api<UserHoldingItem[]>('/api/v1/bonds/my-holdings'),
      api<any[]>('/api/v1/bonds/my-repo-loans').catch(() => []),
    ]);
    if (Array.isArray(userHoldings)) {
      holdings = userHoldings;
      isLoggedIn = true;
    }
    if (Array.isArray(userRepoLoans)) {
      repoLoans = userRepoLoans;
    }
  } catch {
    // 비로그인 방문자
    isLoggedIn = false;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <p className="text-sm text-muted-foreground">게임 내 가상 채권 · 서버 조회 <time dateTime={market.disclosedAt}>{new Date(market.disclosedAt).toLocaleString('ko-KR')}</time> 기준 · 실제 국가채권이나 원화 금융상품이 아닙니다.</p>
      <BondsPortalClient
        initialBonds={bonds}
        initialHoldings={holdings}
        initialRepoLoans={repoLoans}
        overview={overview}
        isLoggedIn={isLoggedIn}
      />

      <section aria-label="국고 공공 기부 & 명예의 전당">
        <TreasuryDonationCard />
      </section>
    </div>
  );
}
