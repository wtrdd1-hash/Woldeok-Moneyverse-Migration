import type { Metadata } from 'next';
import { publicApi, api } from '@/lib/api';
import {
  BondsPortalClient,
  type PublicBondItem,
  type UserHoldingItem,
} from './bonds-portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '기획재정국채 (KTB) 통합 거래소 | 월덱 국채 청약 & 확정 이자',
  description: '중앙 국고(VAULT_MAIN)가 100% 원리금을 보증하는 1년/3년/5년물 국가 국채 청약, 매시간 확정 쿠폰 이자 수취 및 만기 상환 대국민 포털입니다.',
};

interface PublicMarketsResponse {
  overview: {
    totalBondsActive: number;
    totalFundedWld: string;
    totalHoldersCount: number;
    totalCouponsPaidWld: string;
    benchmark1YYield: string;
    benchmark3YYield: string;
    benchmark5YYield: string;
  };
  bonds: PublicBondItem[];
  guarantor: string;
}

export default async function PublicBondsPage() {
  const marketsData = await publicApi<PublicMarketsResponse>('/api/v1/bonds/markets', 30);

  const overview = marketsData?.overview ?? {
    totalBondsActive: 3,
    totalFundedWld: '0',
    totalHoldersCount: 0,
    totalCouponsPaidWld: '0',
    benchmark1YYield: '4.50%',
    benchmark3YYield: '5.20%',
    benchmark5YYield: '6.50%',
  };

  const bonds = marketsData?.bonds ?? [];

  // 로그인 상태인 경우 내 보유 채권 조회 시도
  let holdings: UserHoldingItem[] = [];
  let isLoggedIn = false;

  try {
    const userHoldings = await api<UserHoldingItem[]>('/api/v1/bonds/my-holdings');
    if (Array.isArray(userHoldings)) {
      holdings = userHoldings;
      isLoggedIn = true;
    }
  } catch {
    // 비로그인 방문자
    isLoggedIn = false;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <BondsPortalClient
        initialBonds={bonds}
        initialHoldings={holdings}
        overview={overview}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
