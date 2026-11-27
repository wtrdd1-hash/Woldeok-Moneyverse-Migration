import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { apiOrNull, publicApi } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { isLoggedInMember } from '@/lib/session';
import { canonicalUrl } from '@/lib/seo';
import { ShopStoreView, type CatalogItem } from './shop-store-view';
import { cashBalanceFromWallet } from './wallet-balance';
import { ShopMembershipSection } from './shop-membership-section';
import { parseShopUpkeepCap, shopCatalogueQuery } from './shop-upkeep-cap';
import { ShopPrinciples, ShopSearchForm } from './shop-search-form';
import { COPY } from './copy';
import { fill, textProps } from '@/lib/copy-format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WLD 아이템 상점',
  description:
    '월덕 머니버스의 게임 전용 WLD로 아이템·치장품·컬렉션을 확인하고 구매하는 가상 상점입니다.',
  alternates: { canonical: canonicalUrl('/shop') },
};

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
    loggedIn ? apiOrNull<unknown>('/api/v1/wallet') : null,
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
  const username = profileData?.chosenName || profileData?.discordUsername || undefined;
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
              <T {...textProps(COPY.heroLead)} />
              <br />
              <Accent>
                <T {...textProps(COPY.heroAccent)} />
              </Accent>
            </>
          }
        >
          <T {...textProps(COPY.heroBody)} />
        </PageHeader>

        <ShopSearchForm query={query} capValue={cap.value} capInvalid={cap.invalid} />
        {cap.invalid ? (
          <p id="shop-upkeep-error" role="alert" className="text-sm text-destructive">
            <T {...textProps(COPY.upkeepCapInvalid)} />
          </p>
        ) : null}
        {cap.value ? (
          <p className="text-sm text-muted-foreground">
            <T {...textProps(fill(COPY.upkeepCapActive, { cap: cap.value }))} />
          </p>
        ) : null}
        {query && !cap.invalid && !catalogueUnavailable ? (
          <p className="text-sm text-muted-foreground">
            <T {...textProps(fill(COPY.searchResults, { query, count: items.length }))} />
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <ShopPrinciples />
          {loggedIn ? (
            <Button asChild size="sm" variant="outline" className="min-h-[44px] sm:min-h-[36px]">
              <Link href="/marketplace">
                <T {...textProps(COPY.marketplaceWorkbench)} />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Moneyverse Plus VIP Membership Tier Card */}
      {membershipKnown ? (
        <ShopMembershipSection
          userBalance={userBalance}
          isPlusMember={isPlusMember}
          pass={
            vipPassItem
              ? { catalogId: vipPassItem.catalog_id, name: vipPassItem.name, description: vipPassItem.description, price: vipPassItem.price }
              : null
          }
        />
      ) : null}

      {catalogueUnavailable ? (
        <div role="alert" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-card p-6">
          <EmptyState
            title={<T {...textProps(COPY.unavailableTitle)} />}
            description={<T {...textProps(COPY.unavailableBody)} />}
          >
            <Button asChild variant="outline"><Link href="/shop"><T {...textProps(COPY.retry)} /></Link></Button>
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
