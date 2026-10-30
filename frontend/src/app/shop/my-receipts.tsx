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
import { parseShopPurchaseHistory, type ShopPurchaseHistory } from '@/lib/shop-purchase-history';
import { receiptAmountRangeError } from '@/lib/shop-receipt-amount-range';

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
  const [history, setHistory] = useState<ShopPurchaseHistory | null>(null);
  const [search, setSearch] = useState('');
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null);
  const [rangeError, setRangeError] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const amountRangeError = receiptAmountRangeError(minAmount, maxAmount);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!viewer?.signedIn) return;
    let cancelled = false;
    setHistory(null);
    setFailed(false);
    if (amountRangeError) return;
    const timer = setTimeout(() => {
      const term = search.trim();
      const params = new URLSearchParams();
      if (term) params.set('q', term);
      if (appliedRange) { params.set('from', appliedRange.from); params.set('to', appliedRange.to); }
      if (minAmount) params.set('minAmount', minAmount);
      if (maxAmount) params.set('maxAmount', maxAmount);
      const url = `/api/shop/purchases${params.size ? `?${params.toString()}` : ''}`;
      void fetch(url, { cache: 'no-store' })
        .then(async (response) => {
          if (!response.ok) throw new Error('purchase history unavailable');
          const data: unknown = await response.json();
          const verified = parseShopPurchaseHistory(data);
          if (!verified) throw new Error('invalid purchase history');
          return verified;
        })
        .then((verified) => { if (!cancelled) setHistory(verified); })
        .catch(() => { if (!cancelled) setFailed(true); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [viewer?.signedIn, search, appliedRange, minAmount, maxAmount, amountRangeError]);

  if (!viewer?.signedIn) return null;
  const receipts = history?.purchases ?? null;

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
        <label htmlFor="receipt-search" className="text-sm font-medium">
          구매 상품명 검색
        </label>
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
        <p className="text-xs text-muted-foreground">검색·날짜·금액 필터는 최근 100건의 본인 구매 기록만 대상으로 합니다. 필터가 없을 때는 최근 30건을 표시합니다.</p>
        <a
          href={`/api/shop/purchases/export${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`}
          className="w-fit rounded-md border border-input px-3 py-2 text-sm font-semibold underline underline-offset-2"
          aria-label="최근 최대 100건의 내 구매 기록 CSV 다운로드"
        >
          구매 기록 CSV 다운로드
        </a>
        <label htmlFor="receipt-min-amount" className="text-sm font-medium mt-2">
          최소 구매 금액 (WLD)
        </label>
        <input
          id="receipt-min-amount"
          name="receiptMinAmount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={30}
          autoComplete="off"
          value={minAmount}
          onChange={(event) => {
            if (/^[0-9]{0,30}$/.test(event.target.value)) setMinAmount(event.target.value);
          }}
          aria-invalid={Boolean(amountRangeError)}
          aria-describedby="receipt-amount-help"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:max-w-sm"
          placeholder="예: 100"
        />
        <label htmlFor="receipt-max-amount" className="text-sm font-medium mt-2">
          최대 구매 금액 (WLD)
        </label>
        <input
          id="receipt-max-amount"
          name="receiptMaxAmount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={30}
          autoComplete="off"
          value={maxAmount}
          onChange={(event) => {
            if (/^[0-9]{0,30}$/.test(event.target.value)) setMaxAmount(event.target.value);
          }}
          aria-invalid={Boolean(amountRangeError)}
          aria-describedby="receipt-amount-help"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:max-w-sm"
          placeholder="예: 1000"
        />
        <p id="receipt-amount-help" className="text-xs text-muted-foreground">
          금액을 비워두면 해당 제한을 적용하지 않습니다. 입력한 최대 금액도 포함합니다.
        </p>
        {amountRangeError && (
          <p role="alert" className="text-sm text-destructive">{amountRangeError}</p>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end">
        <div className="grid gap-1">
          <label htmlFor="receipt-from" className="text-sm font-medium">시작 날짜 (한국시간)</label>
          <input id="receipt-from" name="receiptFrom" type="date" value={draftFrom}
            onChange={(event) => { setDraftFrom(event.target.value); setRangeError(false); }}
            className="min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="receipt-to" className="text-sm font-medium">종료 날짜 (한국시간)</label>
          <input id="receipt-to" name="receiptTo" type="date" value={draftTo}
            onChange={(event) => { setDraftTo(event.target.value); setRangeError(false); }}
            className="min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button type="button" className="rounded-md border px-3 py-2 text-sm font-semibold"
          onClick={() => {
            const start = Date.parse(`${draftFrom}T00:00:00+09:00`);
            const end = Date.parse(`${draftTo}T00:00:00+09:00`);
            if (!draftFrom || !draftTo || !Number.isFinite(start) || !Number.isFinite(end) || end < start || (end - start) / 86_400_000 >= 366) {
              setRangeError(true); return;
            }
            setRangeError(false);
            setAppliedRange({ from: draftFrom, to: draftTo });
          }}>날짜 적용</button>
        <button type="button" className="rounded-md border px-3 py-2 text-sm"
          onClick={() => { setDraftFrom(''); setDraftTo(''); setAppliedRange(null); setRangeError(false); }}>날짜 초기화</button>
      </div>
      {rangeError && <p role="alert" className="text-sm text-destructive">올바른 시작·종료 날짜를 모두 선택해 주세요 (최대 366일).</p>}
      {appliedRange && <p className="text-xs text-muted-foreground" role="status">한국시간 {appliedRange.from} ~ {appliedRange.to} 구매 기록을 표시합니다. 최근 100건 범위입니다.</p>}
      {!failed && history && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          현재 표시된 구매 {history.summary.count}건의 합계: <Amount value={history.summary.totalSpent} currency />
          <span className="block text-xs">최근 기록만 계산한 금액이며 전체 누적 구매액은 아닙니다.</span>
        </p>
      )}
      {amountRangeError ? (
        <p role="status" className="text-sm text-muted-foreground">금액 조건을 수정하면 검색합니다.</p>
      ) : failed ? (
        <p role="alert" className="text-sm text-destructive">
          구매 기록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : receipts === null ? (
        <Skeleton className="h-24 w-full" />
      ) : receipts.length === 0 ? (
        <EmptyState
          title={search.trim() || appliedRange || minAmount || maxAmount ? "검색 결과가 없어요." : "아직 구매 기록이 없어요."}
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
