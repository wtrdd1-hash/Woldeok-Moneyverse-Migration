import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { MarketplaceTabs } from './marketplace-tabs';
import type { MarketplaceHolding } from './marketplace';

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

  const [holdingsData, walletData] = await Promise.all([
    apiOrNull<{ holdings: MarketplaceHolding[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ balance?: string; cash_balance?: string }>('/api/v1/wallet/summary'),
  ]);

  const holdings = holdingsData?.holdings ?? [];
  const userBalance = walletData?.cash_balance || walletData?.balance || '0';

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
          korean="재료 아이템을 조합하여 한정판 외형과 부스트를 제작하고, 고정가 거래는 원장 정산 검증 전까지 일시 중단됩니다. 제작대 및 보유 아이템 정보를 확인할 수 있습니다."
          english="Craft limited cosmetic items and business boost kits from materials, while fixed-price trading is temporarily unavailable pending ledger verification."
        />
      </PageHeader>

      <MarketplaceTabs
        initialHoldings={holdings}
        userBalanceWld={userBalance}
        categoriesList={categoriesList}
        rarities={rarities}
      />
    </div>
  );
}
