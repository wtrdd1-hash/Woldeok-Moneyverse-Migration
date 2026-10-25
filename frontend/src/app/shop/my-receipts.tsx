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
  readonly transactionId: string;
  readonly amount: string;
  readonly purchasedAt: string;
}

type ReceiptState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error' }
  | { readonly kind: 'loaded'; readonly receipts: readonly Receipt[] };

function isReceiptHistory(value: unknown): value is { purchases: Receipt[] } {
  if (!value || typeof value !== 'object') return false;
  const purchases = (value as { purchases?: unknown }).purchases;
  return Array.isArray(purchases) && purchases.length <= 30 && purchases.every((row: unknown) => {
    if (!row || typeof row !== 'object') return false;
    const receipt = row as Record<string, unknown>;
    return typeof receipt.purchaseId === 'string' &&
      typeof receipt.itemName === 'string' &&
      typeof receipt.transactionId === 'string' &&
      typeof receipt.amount === 'string' && /^[1-9][0-9]*$/.test(receipt.amount) &&
      typeof receipt.purchasedAt === 'string';
  });
}

function MemberReceipts() {
  const [state, setState] = useState<ReceiptState>({ kind: 'loading' });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    // Refetch on tab return: another tab may have signed out or switched accounts.
    const onFocus = () => setRefresh((value) => value + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setState({ kind: 'loading' });
    void fetch('/api/shop/purchases', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('purchase history unavailable');
        const data: unknown = await response.json();
        if (!isReceiptHistory(data)) throw new Error('invalid purchase history');
        return data.purchases;
      })
      .then((receipts) => {
        if (!cancelled) setState({ kind: 'loaded', receipts });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refresh]);

  return (
    <section aria-labelledby="purchase-title" className="grid min-w-0 gap-3">
      <SectionHeader
        eyebrow="MY RECEIPTS"
        title="내 구매 기록"
        id="purchase-title"
        action={<Link href="/wallet" className="shrink-0 text-sm font-extrabold text-clay-ink">지갑 원장 보기 →</Link>}
      />
      <p className="text-xs text-muted-foreground">최근 최대 30건의 확인된 구매 기록입니다. 전체 기간 내역이 아닙니다.</p>
      {state.kind === 'loading' ? (
        <Skeleton className="h-24 w-full" aria-label="구매 기록 불러오는 중" />
      ) : state.kind === 'error' ? (
        <div role="alert" className="rounded-xl border border-destructive/40 p-4 text-sm">
          <p>구매 기록을 확인할 수 없습니다. 구매 기록이 없다는 뜻은 아닙니다.</p>
          <button type="button" onClick={() => setRefresh((value) => value + 1)} className="mt-2 rounded-md border px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
            다시 조회
          </button>
        </div>
      ) : state.receipts.length === 0 ? (
        <EmptyState title="아직 구매 기록이 없어요." description="서버에서 최근 구매 기록이 없음을 확인했습니다." />
      ) : (
        <Card>
          <CardContent>
            <ul className="grid gap-3">
              {state.receipts.map((receipt) => (
                <li key={receipt.purchaseId} className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="grid min-w-0 gap-0.5">
                    <p className="text-sm font-medium">{receipt.itemName}</p>
                    <p className="text-xs text-muted-foreground">{formatMoment(receipt.purchasedAt, '구매 시간 확인 중')}</p>
                    <p className="break-all text-xs text-muted-foreground">원장 거래: {receipt.transactionId}</p>
                  </div>
                  <Amount value={receipt.amount} className="max-w-full break-all text-sm" currency />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

/** Unmounting on sign-out destroys the prior member's private receipt state. */
export function MyReceipts() {
  const viewer = useViewer();
  if (!viewer?.signedIn) return null;
  return <MemberReceipts />;
}
