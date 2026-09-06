import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { apiOrNull, publicApi } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
import { ShopStoreView, type CatalogItem } from './shop-store-view';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { cashBalanceFromWallet, type CanonicalWalletOverview } from './wallet-balance';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '상점 2.0 · 월덕 머니버스',
  description: '11대 카테고리 78종 아이템과 치장품, 한정판 Limited 컬렉션 및 실시간 피팅룸',
  alternates: { canonical: '/shop' },
};

const PRINCIPLES = [
  { ko: '11개 카테고리 78종 상품 완비', en: '11 categories & 78 items' },
  { ko: '60fps 무지연 실시간 피팅룸', en: '60fps zero-lag fitting room' },
  { ko: '구매 시 100% 영구 소각(Sink)', en: '100% permanently burned (Sink)' },
  { ko: '현금 교환·환전 불가', en: 'No cash exchange' },
];

export default async function ShopPage() {
  const loggedIn = await isLoggedInMember();

  const [catalogData, walletData, profileData] = await Promise.all([
    loggedIn
      ? apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog')
      : publicApi<{ catalogItems: CatalogItem[] }>('/api/v1/shop/public-catalog', 60),
    loggedIn ? apiOrNull<CanonicalWalletOverview>('/api/v1/wallet') : null,
    loggedIn
      ? apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>(
          '/api/v1/profile',
        )
      : null,
  ]);

  const items = catalogData?.catalogItems || [];
  // The shop and wallet must read the same canonical USER_CASH balance from
  // WalletOverview. A removed legacy `cashBalance` field made the shop show 0
  // even while the wallet correctly showed the ledger-backed amount.
  const userBalance = cashBalanceFromWallet(walletData);
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  return (
    <div className="grid gap-8 pb-16">
      <div className="grid gap-4">
        <PageHeader
          eyebrow="WOLDEOK MARKET · STORE 2.0"
          title={
            <>
              <T korean="모은 WLD로," english="With earned WLD," />
              <br />
              <Accent>
                <T korean="나만의 개성을 뽐내요." english="Express your unique identity." />
              </Accent>
            </>
          }
        >
          <T
            korean="상점의 모든 구매 대금은 서버 금융 원장에 의해 시스템 소각 계정(SYSTEM_SINK)으로 100% 영구 소각되어 통화 가치를 보존합니다."
            english="All shop purchase proceeds are 100% permanently burned (SYSTEM_SINK) to preserve currency stability."
          />
        </PageHeader>

        <ul aria-label="상점 2.0 원칙" className="flex flex-wrap gap-2">
          {PRINCIPLES.map((principle) => (
            <li key={principle.ko}>
              <Badge variant="outline" className="font-normal border-amber-500/30 text-xs">
                <T korean={principle.ko} english={principle.en} />
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Store View */}
      <ShopStoreView
        items={items}
        userBalance={userBalance}
        currentUsername={username}
        userAvatarUrl={avatarUrl}
      />

      <PublicAdvertisement />
    </div>
  );
}
