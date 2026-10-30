'use client';

import { SectionHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoment } from '@/lib/money';
import { useViewer } from '@/lib/use-viewer';

interface Receipt {
  readonly purchaseId: string;
  readonly itemName: string;
  readonly amount: string;
  readonly purchasedAt: string;
}

/**
 * The member's own receipts, loaded in the browser.
 *
 * `/shop` is statically generated for the catalogue, which is the half a
 * crawler and a first-time visitor need as finished HTML. One member's
 * receipts can never be part of a document cached for everyone, so they
 * arrive separately.
 */
export function MyReceipts() {
  const viewer = useViewer();
  const [receipts, setReceipts] = useState<readonly Receipt[] | null>(null);
  const [search, setSearch] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!viewer?.signedIn) return;
    let cancelled = false;
    setReceipts(null);
    setFailed(false);
    const timer = setTimeout(() => {
      const term = search.trim();
      const url = `/api/shop/purchases${term ? `?q=${encodeURIComponent(term)}` : ''}`;
      void fetch(url, { cache: 'no-store' })
        .then(async (response) => {
          if (!response.ok) throw new Error('purchase history unavailable');
          const data: unknown = await response.json();
          if (!data || typeof data !== 'object' || !('purchases' in data) || !Array.isArray(data.purchases)) {
            throw new Error('invalid purchase history');
          }
          return data.purchases as Receipt[];
        })
        .then((purchases) => { if (!cancelled) setReceipts(purchases); })
        .catch(() => { if (!cancelled) setFailed(true); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [viewer?.signedIn, search]);

  if (!viewer?.signedIn) return null;

  return (
    <section aria-labelledby="purchase-title" className="grid gap-3">
      <SectionHeader
        eyebrow="MY RECEIPTS"
        title="내 구매 기록"
        id="purchase-title"
        action={
          <Link href="/wallet" className="shrink-0 text-sm font-extrabold text-clay-ink">
            지갑 원장 보기 →
          </Link>
        }
      />

      <div className="grid gap-1">
        <label htmlFor="receipt-search" className="text-sm font-medium">구매 상품명 검색</label>
        <input
          id="receipt-search"
          name="receiptSearch"
          type="search"
          maxLength={80}
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:max-w-sm"
          placeholder="상품명을 입력하세요"
        />
        <p className="text-xs text-muted-foreground">검색은 최근 100건의 본인 구매 기록만 대상으로 합니다. 검색하지 않을 때는 최근 30건을 표시합니다.</p>
        <a
          href={`/api/shop/purchases/export${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`}
          className="w-fit rounded-md border border-input px-3 py-2 text-sm font-semibold underline underline-offset-2"
          aria-label="최근 최대 100건의 내 구매 기록 CSV 다운로드"
        >
          구매 기록 CSV 다운로드
        </a>
      </div>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">구매 기록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
      ) : receipts === null ? (
        <Skeleton className="h-24 w-full" />
      ) : receipts.length === 0 ? (
        <EmptyState
          title={search.trim() ? "검색 결과가 없어요." : "아직 구매 기록이 없어요."}
          description="구매하면 영수증과 원장 기록이 함께 남습니다."
        />
      ) : (
        <Card>
          <CardContent>
            <ul className="grid gap-3">
              {receipts.map((receipt) => (
                <li
                  key={receipt.purchaseId}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">{receipt.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoment(receipt.purchasedAt, '구매 시간 확인 중')}
                    </p>
                  </div>
                  <Amount value={receipt.amount} className="shrink-0 text-sm" currency />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
