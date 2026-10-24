import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { VerifiedMarketplaceBoard } from './verified-marketplace-board';
import { parseMarketplaceListings } from './verified-marketplace-listings';
import type { MarketplaceHolding } from './marketplace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '플레이어 마켓 — 서버 확인 매물',
  description: '실제 거래소 등록 매물과 내 보유 아이템 조회',
  alternates: { canonical: canonicalUrl('/marketplace') },
  robots: { index: false, follow: false },
};

export default async function MarketplacePage() {
  await requireMember();

  const [activeRows, ownRows, holdingsData, walletData] = await Promise.all([
    apiOrNull<unknown>('/api/v1/marketplace/listings'),
    apiOrNull<unknown>('/api/v1/marketplace/my-listings'),
    apiOrNull<{ holdings: MarketplaceHolding[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ balance?: string; cash_balance?: string }>('/api/v1/wallet/summary'),
  ]);

  const activeListings = parseMarketplaceListings(activeRows);
  const myListings = parseMarketplaceListings(ownRows);
  const holdings = Array.isArray(holdingsData?.holdings) ? holdingsData.holdings : null;
  const rawBalance = walletData?.cash_balance ?? walletData?.balance ?? null;
  const walletBalance = typeof rawBalance === 'string' && /^\d+$/.test(rawBalance)
    ? rawBalance : null;

  return (
    <div data-page="marketplace" className="mv-page mv-page--finance grid gap-6 pb-16">
      <PageHeader
        eyebrow="PLAYER MARKETPLACE · VERIFIED LISTINGS"
        title={<T korean="플레이어 마켓 기록" english="Verified Player Marketplace" />}
      >
        <T
          korean="실제 서버에 등록된 매물과 내 판매 내역을 확인할 수 있습니다. 구매·등록·취소·제작·경매·직거래·감정 기능은 검증 전까지 이 화면에서 제공하지 않습니다."
          english="Browse verified server listings and your listing history. Trading and crafting actions remain unavailable until verified."
        />
      </PageHeader>
      <VerifiedMarketplaceBoard
        activeListings={activeListings}
        myListings={myListings}
        holdings={holdings}
        walletBalance={walletBalance}
      />
    </div>
  );
}
