'use client';

import { useEffect, useState } from 'react';
import { groupDigits } from '@/lib/money';

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
    return <p className="rounded-xl border border-border p-3 text-sm text-muted-foreground">비교할 2개 상품을 선택하세요. 가격은 서버에서 확인합니다.</p>;
  }
  if (status.kind === 'idle' || status.kind === 'loading' || status.idsKey !== `${first},${second}`) {
    return <p role="status" className="rounded-xl border border-border p-3 text-sm">상품 가격을 확인하는 중입니다.</p>;
  }
  if (status.kind === 'error') {
    return <p role="alert" className="rounded-xl border border-destructive/50 p-3 text-sm">비교 정보를 확인할 수 없습니다. 잠시 후 다시 시도하세요.</p>;
  }
  const { comparison } = status;
  return (
    <section aria-label="서버 검증 상품 비용 비교" className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-bold">상품 비용 비교 · 서버 확인</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {comparison.items.map((item) => (
          <div key={item.catalog_id} className="rounded-lg border border-border p-3 space-y-1">
            <h4 className="font-semibold">{item.name}</h4>
            <p>구매 가격: {groupDigits(item.price)} WLD</p>
            <p>주간 유지비: {groupDigits(item.maintenance_cost)} WLD</p>
            {item.quantity === 0 ? <p>현재 재고 없음</p> : null}
          </div>
        ))}
      </div>
      <p>가격 차이: {groupDigits(comparison.priceDifference)} WLD · 주간 유지비 차이: {groupDigits(comparison.weeklyUpkeepDifference)} WLD</p>
      <p className="font-medium">{comparison.cheaperCatalogId === null
        ? '두 상품의 구매 가격이 같습니다.'
        : `더 저렴한 상품: ${comparison.items.find((item) => item.catalog_id === comparison.cheaperCatalogId)?.name ?? '확인 불가'}`}</p>
      <p className="text-xs text-muted-foreground">현재 조회된 회원별 상점 가격 기준입니다. 구매 가능 여부와 최종 결제 금액은 구매 시 서버에서 다시 확인됩니다.</p>
    </section>
  );
}
