import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiOrNull, publicApi } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { ShopStoreView, type CatalogItem } from './shop-store-view';
import { cashBalanceFromWallet, type CanonicalWalletOverview } from './wallet-balance';
import { ShopMembershipSection } from './shop-membership-section';
import { normalizeShopPriceCeiling } from './shop-price-ceiling';
import { hasVerifiedVipPass } from './shop-membership-status';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WLD 아이템 상점',
  description: '월덕 머니버스의 게임 전용 WLD로 아이템·치장품·컬렉션을 확인하고 구매하는 가상 상점입니다.',
  alternates: { canonical: canonicalUrl('/shop') },
};

const PRINCIPLES = [
  { ko: '11개 카테고리 78종 상품 완비', en: '11 categories & 78 items' },
  { ko: '60fps 무지연 실시간 피팅룸', en: '60fps zero-lag fitting room' },
  { ko: '구매 시 100% 영구 소각(Sink)', en: '100% permanently burned (Sink)' },
  { ko: '현금 교환·환전 불가', en: 'No cash exchange' },
];

interface ShopPageProps {
  readonly searchParams: Promise<{ q?: string | string[]; maxPrice?: string | string[] }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const loggedIn = await isLoggedInMember();
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : '';
  const { value: maxPrice, invalid: invalidMaxPrice } = normalizeShopPriceCeiling(params.maxPrice);
  const queryParams = new URLSearchParams();
  if (query) queryParams.set('q', query);
  if (maxPrice) queryParams.set('maxPrice', maxPrice);
  const querySuffix = queryParams.size > 0 ? `?${queryParams.toString()}` : '';

  const [catalogData, walletData, profileData, membershipCatalogData] = await Promise.all([
    loggedIn
      ? apiOrNull<{ catalogItems: CatalogItem[] }>(`/api/v1/shop/catalog${querySuffix}`)
      : publicApi<{ catalogItems: CatalogItem[] }>(`/api/v1/shop/public-catalog${querySuffix}`, 60),
    loggedIn ? apiOrNull<CanonicalWalletOverview>('/api/v1/wallet') : null,
    loggedIn
      ? apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>(
          '/api/v1/profile',
        )
      : null,
    loggedIn && querySuffix
      ? apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog')
      : null,
  ]);

  const items = catalogData?.catalogItems || [];
  const userBalance = cashBalanceFromWallet(walletData);
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  // Visible filters must not make a member's existing VIP entitlement disappear.
  const isPlusMember = hasVerifiedVipPass(membershipCatalogData?.catalogItems ?? items);

  return (
    <div data-page="shop" className="mv-page mv-page--gameplay grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 pb-16 w-full max-w-full">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
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

        <form action="/shop" method="get" className="flex min-w-0 w-full max-w-2xl gap-2" role="search">
          <input
            type="search"
            name="q"
            maxLength={120}
            defaultValue={query}
            placeholder="상품명, 설명, 카테고리 검색"
            aria-label="상점 검색"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2 text-base outline-none focus:border-amber-500 md:text-sm"
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="maxPrice"
            maxLength={19}
            defaultValue={maxPrice}
            placeholder="최대 WLD 가격"
            aria-label="최대 WLD 가격"
            aria-invalid={invalidMaxPrice}
            className="w-32 min-w-0 rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:border-amber-500 md:text-sm"
          />
          <Button type="submit">
            <T korean="검색" english="Search" />
          </Button>
          {query || maxPrice || invalidMaxPrice ? (
            <Button asChild type="button" variant="outline">
              <Link href="/shop">
                <T korean="초기화" english="Reset" />
              </Link>
            </Button>
          ) : null}
        </form>
        {invalidMaxPrice ? (
          <p role="alert" className="text-sm text-destructive">가격 상한은 0 이상인 정수 WLD로 입력해 주세요.</p>
        ) : null}
        {query || maxPrice ? (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {query ? `“${query}” · ` : ''}{maxPrice ? `최대 ${maxPrice} WLD · ` : ''}검색 결과 {items.length}개
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <ul aria-label="상점 2.0 원칙" className="flex flex-wrap gap-2">
            {PRINCIPLES.map((principle) => (
              <li key={principle.ko}>
                <Badge variant="outline" className="font-normal border-amber-500/30 text-xs">
                  <T korean={principle.ko} english={principle.en} />
                </Badge>
              </li>
            ))}
          </ul>
          {loggedIn ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/marketplace">
                <T korean="플레이어 마켓 작업대" english="Marketplace workbench" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Moneyverse Plus VIP Membership Tier Card */}
      <ShopMembershipSection userBalance={userBalance} isPlusMember={isPlusMember} />

      <ShopStoreView
        items={items}
        userBalance={userBalance}
        currentUsername={username}
        userAvatarUrl={avatarUrl}
      />
    </div>
  );
}
