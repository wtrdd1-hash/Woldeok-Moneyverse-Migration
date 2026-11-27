'use client';

import { useEffect, useState } from 'react';
import { groupDigits } from '@/lib/money';
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { COPY } from './copy';

type ComparisonItem = {
  catalog_id: string;
  name: string;
  price: string;
  maintenance_cost: string;
  quantity?: number | null;
};
type Comparison = {
  source: 'shop_catalog_list_v2';
  items: [ComparisonItem, ComparisonItem];
  priceDifference: string;
  weeklyUpkeepDifference: string;
  cheaperCatalogId: string | null;
};

type Status = { kind: 'idle' } | { kind: 'loading'; idsKey: string } | { kind: 'error'; idsKey: string } | { kind: 'ready'; idsKey: string; comparison: Comparison };
const canonical = (value: unknown): value is string => typeof value === 'string' && value.length <= 40 && /^(0|[1-9][0-9]*)$/.test(value);

function validComparison(value: unknown, ids: readonly string[]): value is Comparison {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<Comparison>;
  if (result.source !== 'shop_catalog_list_v2' || !Array.isArray(result.items) || result.items.length !== 2) return false;
  if (!canonical(result.priceDifference) || !canonical(result.weeklyUpkeepDifference)) return false;
  if (result.cheaperCatalogId !== null && !ids.includes(result.cheaperCatalogId ?? '')) return false;
  if (!result.items.every((item, index) => item && item.catalog_id === ids[index] &&
    typeof item.name === 'string' && item.name.length > 0 && item.name.length <= 200 &&
    canonical(item.price) && canonical(item.maintenance_cost))) return false;
  const [a, b] = result.items as [ComparisonItem, ComparisonItem];
  const priceA = BigInt(a.price);
  const priceB = BigInt(b.price);
  const upkeepA = BigInt(a.maintenance_cost);
  const upkeepB = BigInt(b.maintenance_cost);
  const expectedCheaper = priceA === priceB ? null : priceA < priceB ? a.catalog_id : b.catalog_id;
  const expectedDifference = (priceA > priceB ? priceA - priceB : priceB - priceA).toString();
  const expectedUpkeep = (upkeepA > upkeepB ? upkeepA - upkeepB : upkeepB - upkeepA).toString();
  return result.cheaperCatalogId === expectedCheaper && result.priceDifference === expectedDifference &&
    result.weeklyUpkeepDifference === expectedUpkeep;
}

/** Fail-closed server comparison; a client never calculates or invents a price. */
export function ShopComparePanel({ selectedIds }: { readonly selectedIds: readonly string[] }) {
  const { locale } = useLocale();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const first = selectedIds[0];
  const second = selectedIds[1];

  useEffect(() => {
    if (!first || !second || first === second) return;
    const controller = new AbortController();
    setStatus({ kind: 'loading', idsKey: `${first},${second}` });
    void (async () => {
      try {
        const response = await fetch(`/app-api/v1/shop/compare?ids=${encodeURIComponent(`${first},${second}`)}`, {
          cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
        });
        if (!response.ok) throw new Error('shop comparison unavailable');
        const result: unknown = await response.json();
        if (!validComparison(result, [first, second])) throw new Error('invalid shop comparison receipt');
        if (!controller.signal.aborted) setStatus({ kind: 'ready', idsKey: `${first},${second}`, comparison: result });
      } catch {
        if (!controller.signal.aborted) setStatus({ kind: 'error', idsKey: `${first},${second}` });
      }
    })();
    return () => controller.abort();
  }, [first, second]);

  if (!first || !second || first === second) {
    return <p className="rounded-xl border border-border p-3 text-sm text-muted-foreground">{pick(locale, COPY.compareChooseTwo)}</p>;
  }
  if (status.kind === 'idle' || status.kind === 'loading' || status.idsKey !== `${first},${second}`) {
    return <p role="status" className="rounded-xl border border-border p-3 text-sm">{pick(locale, COPY.compareLoading)}</p>;
  }
  if (status.kind === 'error') {
    return <p role="alert" className="rounded-xl border border-destructive/50 p-3 text-sm">{pick(locale, COPY.compareError)}</p>;
  }
  const { comparison } = status;
  return (
    <section aria-label={pick(locale, COPY.compareSectionLabel)} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-bold">{pick(locale, COPY.compareTitle)}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {comparison.items.map((item) => (
          <div key={item.catalog_id} className="rounded-lg border border-border p-3 space-y-1">
            <h4 className="font-semibold">{item.name}</h4>
            <p>{pick(locale, fill(COPY.comparePrice, { amount: groupDigits(item.price) }))}</p>
            <p>{pick(locale, fill(COPY.compareUpkeep, { amount: groupDigits(item.maintenance_cost) }))}</p>
            {item.quantity === 0 ? <p>{pick(locale, COPY.compareOutOfStock)}</p> : null}
          </div>
        ))}
      </div>
      <p>{pick(locale, fill(COPY.compareDifference, { price: groupDigits(comparison.priceDifference), upkeep: groupDigits(comparison.weeklyUpkeepDifference) }))}</p>
      <p className="font-medium">{comparison.cheaperCatalogId === null
        ? pick(locale, COPY.compareSamePrice)
        : pick(locale, fill(COPY.compareCheaper, { name: comparison.items.find((item) => item.catalog_id === comparison.cheaperCatalogId)?.name ?? pick(locale, COPY.unknown) }))}</p>
      <p className="text-xs text-muted-foreground">{pick(locale, COPY.compareFootnote)}</p>
    </section>
  );
}
