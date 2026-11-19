import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiOrNull, publicApi } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { isLoggedInMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { ShopStoreView, type CatalogItem } from './shop-store-view';
import { cashBalanceFromWallet, type CanonicalWalletOverview } from './wallet-balance';
import { ShopMembershipSection } from './shop-membership-section';
import { parseShopUpkeepCap, shopCatalogueQuery } from './shop-upkeep-cap';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WLD 아이템 상점',
  description:
    '월덕 머니버스의 게임 전용 WLD로 아이템·치장품·컬렉션을 확인하고 구매하는 가상 상점입니다.',
  alternates: { canonical: canonicalUrl('/shop') },
};

const PRINCIPLES = [
  { ko: '검증된 판매 상품만 표시', en: 'Only verified catalog items are displayed' },
  { ko: '60fps 무지연 실시간 피팅룸', en: '60fps zero-lag fitting room' },
  { ko: '구매 시 100% 영구 소각(Sink)', en: '100% permanently burned (Sink)' },
  { ko: '현금 교환·환전 불가', en: 'No cash exchange' },
];

interface ShopPageProps {
  readonly searchParams: Promise<{ q?: string; maxUpkeep?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const loggedIn = await isLoggedInMember();
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const cap = parseShopUpkeepCap(params.maxUpkeep);
  const querySuffix = shopCatalogueQuery(query, cap.value);
  const needsUnfilteredMembership = loggedIn && Boolean(query || cap.value || cap.invalid);

  const [catalogData, walletData, profileData, membershipData] = await Promise.all([
    cap.invalid
      ? null
      : loggedIn
        ? apiOrNull<{ catalogItems: CatalogItem[] }>(`/api/v1/shop/catalog${querySuffix}`)
        : publicApi<{ catalogItems: CatalogItem[] }>(
            `/api/v1/shop/public-catalog${querySuffix}`,
            60,
          ),
    loggedIn ? apiOrNull<CanonicalWalletOverview>('/api/v1/wallet') : null,
    loggedIn
      ? apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>(
          '/api/v1/profile',
        )
      : null,
    needsUnfilteredMembership
      ? apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog')
      : null,
  ]);

  const catalogueUnavailable = !cap.invalid && !Array.isArray(catalogData?.catalogItems);
  const items = Array.isArray(catalogData?.catalogItems) ? catalogData.catalogItems : [];
  const userBalance = cashBalanceFromWallet(walletData);
  const membershipKnown = !catalogueUnavailable && (!needsUnfilteredMembership || membershipData !== null);
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  const vipPassItem = (membershipData?.catalogItems ?? items).find(
    (item) => item.code === 'item_vip_lounge_pass' || item.code.includes('vip_lounge'),
  );
  const isPlusMember = Boolean(vipPassItem && vipPassItem.user_owned_quantity > 0);

  return (
    <div
      data-page="shop"
      className="mv-page mv-page--gameplay grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 pb-16 w-full max-w-full"
    >
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

        <form
          action="/shop"
          method="get"
          className="flex min-w-0 w-full max-w-2xl gap-2 flex-wrap"
          role="search"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="상품명, 설명, 카테고리 검색"
            aria-label="상점 검색"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2 text-base outline-none focus:border-amber-500 md:text-sm"
          />
          <label className="flex min-w-0 items-center gap-2 text-sm">
            <span className="whitespace-nowrap">주간 유지비 상한 (WLD)</span>
            <input
              type="text"
              name="maxUpkeep"
              defaultValue={cap.value}
              inputMode="numeric"
              pattern="(0|[1-9][0-9]*)"
              maxLength={30}
              placeholder="제한 없음"
              aria-invalid={cap.invalid}
              aria-describedby={cap.invalid ? 'shop-upkeep-error' : undefined}
              className="w-32 min-h-[44px] min-w-0 rounded-xl border border-border bg-card px-3 py-2 text-base tabular-nums md:text-sm"
            />
          </label>
          <Button type="submit" className="min-h-[44px] px-5">
            <T korean="검색" english="Search" />
          </Button>
          {query || cap.value || cap.invalid ? (
            <Button asChild type="button" variant="outline" className="min-h-[44px]">
              <Link href="/shop">
                <T korean="초기화" english="Reset" />
              </Link>
            </Button>
          ) : null}
        </form>
        {cap.invalid ? (
          <p id="shop-upkeep-error" role="alert" className="text-sm text-destructive">
            주간 유지비 상한은 0 또는 앞에 0이 없는 최대 30자리 정수여야 합니다. 필터를 수정해
            주세요.
          </p>
        ) : null}
        {cap.value ? (
          <p className="text-sm text-muted-foreground">
            주간 유지비 {cap.value} WLD 이하 상품만 표시합니다.
          </p>
        ) : null}
        {query && !cap.invalid && !catalogueUnavailable ? (
          <p className="text-sm text-muted-foreground">
            “{query}” 검색 결과 {items.length}개
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
            <Button asChild size="sm" variant="outline" className="min-h-[44px] sm:min-h-[36px]">
              <Link href="/marketplace">
                <T korean="플레이어 마켓 작업대" english="Marketplace workbench" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Moneyverse Plus VIP Membership Tier Card */}
      {membershipKnown ? (
        <ShopMembershipSection userBalance={userBalance} isPlusMember={isPlusMember} />
      ) : null}

      {catalogueUnavailable ? (
        <div role="alert" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-card p-6">
          <EmptyState
            title={<T korean="상점 정보를 불러올 수 없습니다" english="Shop data is unavailable" />}
            description={<T korean="실제 상품 정보를 확인하지 못했습니다. 상품이 없는 것으로 처리하지 않으며, 구매도 일시적으로 중단합니다." english="The verified catalogue could not be loaded. No products are shown and purchases remain unavailable." />}
          >
            <Button asChild variant="outline"><Link href="/shop"><T korean="다시 조회" english="Retry" /></Link></Button>
          </EmptyState>
        </div>
      ) : (
        <ShopStoreView
          items={items}
          allowCompare={loggedIn}
          userBalance={userBalance}
          currentUsername={username}
          userAvatarUrl={avatarUrl}
        />
      )}
    </div>
  );
}
