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

  useEffect(() => {
    if (!viewer?.signedIn) return;
    let cancelled = false;
    void fetch('/api/shop/purchases', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { purchases: [] }))
      .then((data: { purchases?: Receipt[] }) => {
        if (!cancelled) setReceipts(data.purchases ?? []);
      })
      .catch(() => {
        if (!cancelled) setReceipts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [viewer?.signedIn]);

  if (!viewer?.signedIn) return null;

  return (
    <section aria-labelledby="purchase-title" className="grid gap-3">
      <SectionHeader
        eyebrow="MY RECEIPTS"
        title="내 구매 기록"
        id="purchase-title"
        action={
          <Link href="/wallet" className="shrink-0 text-sm font-extrabold text-clay">
            지갑 원장 보기 →
          </Link>
        }
      />

      {receipts === null ? (
        <Skeleton className="h-24 w-full" />
      ) : receipts.length === 0 ? (
        <EmptyState
          title="아직 구매 기록이 없어요."
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
