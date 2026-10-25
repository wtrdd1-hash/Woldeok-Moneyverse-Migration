import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { apiOrNull } from '@/lib/api';
import { canonicalIntegerString } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { MarketplaceTabs } from './marketplace-tabs';
import type { MarketplaceHolding } from './marketplace';
import { parseMarketplaceAskingSnapshot } from './verified-asking-snapshot';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '플레이어 마켓 거래소 & 제작 작업대 (P0)',
  description:
    '기획서(PLAYER_MARKETPLACE_CRAFTING_SPEC) 기반 플레이어 간 아이템 거래소 및 재료 조합 제작대',
  alternates: { canonical: canonicalUrl('/marketplace') },
  robots: { index: false, follow: false },
};

export default async function MarketplacePage() {
  await requireMember();

  const [holdingsData, walletData, askingRows] = await Promise.all([
    apiOrNull<{ holdings: MarketplaceHolding[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ balances?: { cash?: { availableAmount?: unknown } } }>('/api/v1/wallet?recent=1'),
    apiOrNull<unknown>('/api/v1/marketplace/listings?limit=50'),
  ]);

  const holdings = holdingsData?.holdings ?? [];
  const verifiedCash = canonicalIntegerString(walletData?.balances?.cash?.availableAmount);
  const walletVerified = verifiedCash !== null && !verifiedCash.startsWith('-');
  const userBalance = walletVerified ? verifiedCash : '0';
  const askingSnapshot = parseMarketplaceAskingSnapshot(askingRows);

  const categoriesList = [...new Set(holdings.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b, 'ko-KR'),
  );
  const rarities = [...new Set(holdings.map((item) => item.rarity))].sort((a, b) =>
    a.localeCompare(b, 'ko-KR'),
  );

  return (
    <div data-page="marketplace" className="mv-page mv-page--finance grid gap-6 pb-16">
      <PageHeader
        eyebrow="PLAYER MARKETPLACE · CRAFTING WORKBENCH"
        title={<T korean="플레이어 마켓 & 제작대" english="Player Marketplace & Crafting" />}
      >
        <T
          korean="재료 아이템을 조합하여 한정판 외형과 부스트를 제작하고, 거래소(P0)에서 고정가격으로 다른 모험가와 안전하게 거래하세요. 거래 수수료 1%는 인플레이션 방지를 위해 소각(HARD_SINK)됩니다."
          english="Craft limited cosmetic items and business boost kits from materials, and securely trade them with fellow adventurers in the P0 fixed-price marketplace."
        />
      </PageHeader>

      <MarketplaceTabs
        initialHoldings={holdings}
        userBalanceWld={userBalance}
        walletVerified={walletVerified}
        askingSnapshot={askingSnapshot}
        categoriesList={categoriesList}
        rarities={rarities}
      />
    </div>
  );
}
