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
import { SHOP_RARITIES, shopFilterQuery, vipMembershipFromCatalog } from './shop-rarity';

export const dynamic = 'force-dynamic';

const BASE_METADATA: Metadata = {
  title: 'WLD 아이템 상점',
  description: '월덕 머니버스의 게임 전용 WLD로 아이템·치장품·컬렉션을 확인하고 구매하는 가상 상점입니다.',
  alternates: { canonical: canonicalUrl('/shop') },
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const { q, rarity } = await searchParams;
  return {
    ...BASE_METADATA,
    ...(q || rarity ? { robots: { index: false, follow: false } } : {}),
  };
}

const PRINCIPLES = [
  { ko: '11개 카테고리 78종 상품 완비', en: '11 categories & 78 items' },
  { ko: '60fps 무지연 실시간 피팅룸', en: '60fps zero-lag fitting room' },
  { ko: '구매 시 100% 영구 소각(Sink)', en: '100% permanently burned (Sink)' },
  { ko: '현금 교환·환전 불가', en: 'No cash exchange' },
];

interface ShopPageProps {
  readonly searchParams: Promise<{ q?: string; rarity?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const loggedIn = await isLoggedInMember();
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const rarity = params.rarity ?? '';
  const querySuffix = shopFilterQuery({ q: query, rarity });

  const [catalogData, membershipCatalogData, walletData, profileData] = await Promise.all([
    loggedIn
      ? apiOrNull<{ catalogItems: CatalogItem[] }>(`/api/v1/shop/catalog${querySuffix}`)
      : publicApi<{ catalogItems: CatalogItem[] }>(`/api/v1/shop/public-catalog${querySuffix}`, 60),
    loggedIn && querySuffix ? apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog') : null,
    loggedIn ? apiOrNull<CanonicalWalletOverview>('/api/v1/wallet') : null,
    loggedIn
      ? apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>(
          '/api/v1/profile',
        )
      : null,
  ]);

  const items = catalogData?.catalogItems || [];
  const userBalance = cashBalanceFromWallet(walletData);
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  // A filtered catalogue may omit the VIP pass even when the member owns it.
  // Use an unfiltered owner read for membership; unknown is not "not owned".
  const membershipItems = loggedIn && querySuffix
    ? membershipCatalogData?.catalogItems ?? null
    : catalogData?.catalogItems ?? null;
  const isPlusMember = vipMembershipFromCatalog(membershipItems);

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

        <form action="/shop" method="get" className="flex min-w-0 w-full max-w-2xl gap-2 flex-wrap" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="상품명, 설명, 카테고리 검색"
            aria-label="상점 검색"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2 text-base outline-none focus:border-amber-500 md:text-sm"
          />
          <select
            name="rarity"
            defaultValue={SHOP_RARITIES.some((option) => option.value === rarity) ? rarity : ''}
            aria-label="상품 희귀도"
            className="min-h-11 rounded-md border border-border bg-card px-3 text-sm"
          >
            <option value="">전체 희귀도</option>
            {SHOP_RARITIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button type="submit">
            <T korean="검색" english="Search" />
          </Button>
          {query || rarity ? (
            <Button asChild type="button" variant="outline">
              <Link href="/shop">
                <T korean="초기화" english="Reset" />
              </Link>
            </Button>
          ) : null}
        </form>
        {query || rarity ? (
          <p className="text-sm text-muted-foreground">
            검색 조건에 맞는 상품 {catalogData ? items.length : "확인 불가"}개
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
      {catalogData && isPlusMember !== null ? (
        <ShopMembershipSection userBalance={userBalance} isPlusMember={isPlusMember} />
      ) : null}

      {catalogData ? (
        <ShopStoreView
          items={items}
          userBalance={userBalance}
          currentUsername={username}
          userAvatarUrl={avatarUrl}
        />
      ) : (
        <p role="alert" className="text-sm text-destructive">
          상점 목록을 확인할 수 없습니다. 검색 조건을 확인하거나 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
