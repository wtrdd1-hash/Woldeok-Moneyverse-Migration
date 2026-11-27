import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import type { TodayEvent } from '@/app/quests/early-events';
import { BuyForm, SettleUpkeepButton, UseItemButton } from './catalog-forms';
import { CatalogCard, HoldingCard } from './catalog-parts';
import { holdingsFilterUrl } from './holdings-filter';
import { groupByCategory, isHeldToTheLimit, maxPurchasable, owesUpkeep } from './catalog';
import type { CatalogItem, HeldItem } from './catalog';
import { getServerLocale } from '@/lib/locale-server';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { COPY } from './copy';

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

export default async function ShopCatalogPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly q?: string; readonly mine?: string }>;
}) {
  await requireMember();
  // A member page is force-dynamic already, so reading the request locale costs no static render.
  const locale = await getServerLocale();
  const c = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);
  const { q: rawQuery, mine: rawMine } = await searchParams;
  const query = rawQuery?.trim().toLocaleLowerCase('ko-KR') ?? '';
  const mineStatus = rawMine === 'attention' ? 'attention' : 'all';

  // Both reads in one round. The shelf is a second request only because it is
  // a second read model, not because the catalogue has to finish first.
  const [catalog, mine, today] = await Promise.all([
    apiOrNull<{ catalogItems: CatalogItem[] }>('/api/v1/shop/catalog'),
    apiOrNull<{ holdings: HeldItem[] }>(`/api/v1/shop/holdings${mineStatus === 'attention' ? '?status=attention' : ''}`),
    apiOrNull<{ event: TodayEvent | null }>('/api/v1/early-game/today'),
  ]);
  const marketSaleActive = today?.event?.event_code === 'market_sale' && today.event.claimed;

  // How many of each the member holds right now. A failed shelf read leaves
  // this empty, which shows one owned badge fewer -- it never turns into a
  // claim that they hold none.
  const held = new Map<string, number>(
    (mine?.holdings ?? []).map((item) => [item.catalog_id, item.quantity]),
  );
  const items = (catalog?.catalogItems ?? []).filter((item) => {
    if (query === '') return true;
    return [item.name, item.description, item.code]
      .join(' ')
      .toLocaleLowerCase('ko-KR')
      .includes(query);
  });
  const groups = groupByCategory(items, locale);

  return (
    <div data-page="shop-catalog" className="mv-page mv-page--gameplay grid gap-6">
      <PageHeader eyebrow="ITEM SHOP" title={c(COPY.title)}>
        {c(COPY.intro)}
      </PageHeader>

      {marketSaleActive && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{c(COPY.saleBadge)}</Badge>
            <strong>{c(COPY.saleHeadline)}</strong>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {c(COPY.saleBody)}
          </p>
        </div>
      )}

      <section aria-labelledby="catalog-title" className="grid gap-4">
        <div className="grid gap-2">
          <h2 id="catalog-title" className="text-lg">
            {c(COPY.buyableTitle)}
          </h2>
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            {c(COPY.priceNoteBefore)}
            <Link href="/wallet" className="text-clay-ink">
              {c(COPY.priceNoteLink)}
            </Link>
            {c(COPY.priceNoteAfter)}
          </p>
          {/* Said once, beside the figure it explains. Until 104 the upkeep
              was a column nothing charged and this paragraph said so; now it
              has to say when the charge lands and what happens when it cannot
              be paid, because a member who learns that from a suspended item
              has learned it too late. The four weeks are 16.4's cap. */}
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            {c(COPY.upkeepNote)}
          </p>
          <form className="flex max-w-md gap-2" role="search">
            <Input
              name="q"
              type="search"
              defaultValue={rawQuery ?? ''}
              placeholder={c(COPY.searchPlaceholder)}
              aria-label={c(COPY.searchLabel)}
            />
            <button
              type="submit"
              className="min-h-11 shrink-0 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {c(COPY.search)}
            </button>
          </form>
        </div>

        {catalog === null ? (
          <EmptyState
            title={c(COPY.catalogFailedTitle)}
            description={c(COPY.catalogFailedBody)}
          />
        ) : groups.length === 0 ? (
          // A different fact from the one above: the request worked and the
          // catalogue has nothing on sale right now.
          <EmptyState
            title={query === '' ? c(COPY.noneOnSaleTitle) : c(COPY.noMatchTitle)}
            description={query === '' ? c(COPY.noneOnSaleBody) : c(COPY.noMatchBody)}
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
                  {c(fill(COPY.groupCount, { count: group.items.length }))}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => {
                  const owned = held.get(item.catalog_id) ?? 0;
                  const max = maxPurchasable(item);
                  return (
                    <CatalogCard key={item.catalog_id} item={item} held={owned} locale={locale}>
                      {isHeldToTheLimit(item.purchase_limit, owned) ? (
                        <Badge variant="outline">{c(COPY.owned)}</Badge>
                      ) : max === 0 ? (
                        // The catalogue named a stock of zero. 072 refuses the
                        // purchase outright, so the control is not offered.
                        <Badge variant="outline">{c(COPY.soldOut)}</Badge>
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
            {c(COPY.mineTitle)}
          </h2>
          <nav aria-label={c(COPY.mineFilterLabel)} className="flex flex-wrap gap-2">
            <Link
              href={holdingsFilterUrl(rawQuery ?? '', 'all')}
              aria-current={mineStatus === 'all' ? 'page' : undefined}
              className={`min-h-11 rounded-md border px-4 py-2 text-sm ${mineStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card'} focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            >
              {c(COPY.mineFilterAll)}
            </Link>
            <Link
              href={holdingsFilterUrl(rawQuery ?? '', 'attention')}
              aria-current={mineStatus === 'attention' ? 'page' : undefined}
              className={`min-h-11 rounded-md border px-4 py-2 text-sm ${mineStatus === 'attention' ? 'bg-primary text-primary-foreground' : 'bg-card'} focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            >
              {c(COPY.mineFilterAttention)}
            </Link>
          </nav>
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
            {c(COPY.mineNote)}
          </p>
        </div>

        {mine === null ? (
          <EmptyState
            title={c(COPY.mineFailedTitle)}
            description={c(COPY.tryAgainShortly)}
          />
        ) : mine.holdings.length === 0 ? (
          <EmptyState
            title={mineStatus === 'attention' ? c(COPY.noAttentionTitle) : c(COPY.noHoldingsTitle)}
            description={mineStatus === 'attention' ? c(COPY.noAttentionBody) : c(COPY.noHoldingsBody)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.holdings.map((item) => (
              <HoldingCard key={item.catalog_id} item={item} locale={locale}>
                {/* One slot, and the card decides whether to draw it at all.
                    Which control it is, is decided here, because the page is
                    the only place holding both: a holding with arrears has
                    exactly one thing to do about it, and everything else that
                    can be used has the other. */}
                {owesUpkeep(item) ? (
                  <SettleUpkeepButton catalogId={item.catalog_id} amount={item.arrears_due} />
                ) : (
                  <UseItemButton catalogId={item.catalog_id} />
                )}
              </HoldingCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
