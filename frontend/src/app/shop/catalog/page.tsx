import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { BuyForm, UseItemButton } from './catalog-forms';
import { CatalogCard, HoldingCard } from './catalog-parts';
import { groupByCategory, isHeldToTheLimit, maxPurchasable } from './catalog';
import type { CatalogItem, HeldItem } from './catalog';

/**
 * One member's own shelf, and a catalogue only a member can reach.
 *
 * `shop_catalog_list` takes an actor, so the API put this behind a session --
 * unlike the 009 catalogue on `/shop`, which stays public and prerendered.
 * Never cached, and never offered to a crawler.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '아이템 상점',
  robots: { index: false, follow: false },
};

export default async function ShopCatalogPage() {
  await requireMember();

  // Both reads in one round. The shelf is a second request only because it is
  // a second read model, not because the catalogue has to finish first.
  const [catalog, mine] = await Promise.all([
    apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog'),
    apiOrNull<{ holdings: HeldItem[] }>('/api/v1/shop/holdings'),
  ]);

  // How many of each the member holds right now. A failed shelf read leaves
  // this empty, which shows one 보유 중 badge fewer -- it never turns into a
  // claim that they hold none.
  const held = new Map<string, number>(
    (mine?.holdings ?? []).map((item) => [item.catalog_id, item.quantity]),
  );
  const groups = groupByCategory(catalog?.catalogItems ?? []);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="ITEM SHOP" title="아이템 상점">
        아이템과 가격은 모두 WLD 게임 데이터입니다. 실제 현금 결제나 환전, 실물 배송과는 관련이
        없습니다.
      </PageHeader>

      <section aria-labelledby="catalog-title" className="grid gap-4">
        <div className="grid gap-2">
          <h2 id="catalog-title" className="text-lg">
            살 수 있는 아이템
          </h2>
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            표시된 가격은 안내입니다. 결제 시점에 서버가 가격과 재고를 다시 확인하고, 그때 확인한
            금액으로 원장에 기록해요. 구매 기록은{' '}
            <Link href="/wallet" className="text-clay-ink">
              내 지갑
            </Link>
            에서도 볼 수 있어요.
          </p>
          {/* Said once, beside the figure it explains. 075 adds the upkeep
              column and the receipts table but no function that charges one,
              so a member seeing 주간 관리비 must not read it as a bill that is
              already arriving. */}
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            이동수단과 임대권에는 주간 관리비가 적혀 있어요. 지금은 금액만 안내하고 실제로
            청구하지는 않습니다. 청구가 시작되면 이 화면에서 먼저 알려 드려요.
          </p>
        </div>

        {catalog === null ? (
          <EmptyState
            title="상점 목록을 불러오지 못했어요."
            description="가격이나 재고를 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : groups.length === 0 ? (
          // A different fact from the one above: the request worked and the
          // catalogue has nothing on sale right now.
          <EmptyState
            title="지금 판매 중인 아이템이 없어요."
            description="운영자가 아이템을 열면 이 자리에 가격과 함께 표시돼요."
          />
        ) : (
          groups.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`category-${group.category}`}
              className="grid gap-3"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 id={`category-${group.category}`} className="text-base font-medium">
                  {group.label}
                </h3>
                <span className="tabular text-xs text-muted-foreground">
                  {group.items.length}개
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => {
                  const owned = held.get(item.catalog_id) ?? 0;
                  const max = maxPurchasable(item);
                  return (
                    <CatalogCard key={item.catalog_id} item={item} held={owned}>
                      {isHeldToTheLimit(item.purchase_limit, owned) ? (
                        <Badge variant="outline">보유 중</Badge>
                      ) : max === 0 ? (
                        // The catalogue named a stock of zero. 072 refuses the
                        // purchase outright, so the control is not offered.
                        <Badge variant="outline">품절</Badge>
                      ) : (
                        <BuyForm catalogId={item.catalog_id} max={max} />
                      )}
                    </CatalogCard>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </section>

      <section aria-labelledby="mine-title" className="grid gap-3">
        <div className="grid gap-2">
          <h2 id="mine-title" className="text-lg">
            내 아이템
          </h2>
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            사용 가능한 아이템은 한 번에 1개씩 써요. 장식과 전시 아이템은 사용하지 않고 그대로
            보유합니다.
          </p>
        </div>

        {mine === null ? (
          <EmptyState
            title="보유한 아이템을 불러오지 못했어요."
            description="잠시 후 다시 확인해 주세요."
          />
        ) : mine.holdings.length === 0 ? (
          <EmptyState
            title="아직 보유한 아이템이 없어요."
            description="위에서 아이템을 구입하면 이 자리에 표시돼요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.holdings.map((item) => (
              <HoldingCard key={item.catalog_id} item={item}>
                <UseItemButton catalogId={item.catalog_id} />
              </HoldingCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
