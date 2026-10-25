'use client';

import { useCallback, useEffect, useState } from 'react';
import { Gavel, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';

export interface AuctionListing {
  readonly id: string;
  readonly itemName: string;
  readonly sellerName: string;
  readonly currentBidWld: string;
  readonly bidCount: number;
  readonly endsAt: string;
}

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error' }
  | { readonly kind: 'ready'; readonly auctions: readonly AuctionListing[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER_WLD = /^(0|[1-9][0-9]*)(?:\.0{1,4})?$/;

function parseAuction(raw: unknown): AuctionListing | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const amount = typeof row.currentBidWld === 'string'
    ? INTEGER_WLD.exec(row.currentBidWld)
    : null;
  const start = typeof row.startPriceWld === 'string'
    ? INTEGER_WLD.exec(row.startPriceWld)
    : null;
  if (
    typeof row.id !== 'string' || !UUID.test(row.id)
    || typeof row.itemName !== 'string' || !row.itemName.trim() || row.itemName.length > 160
    || typeof row.sellerName !== 'string' || !row.sellerName.trim() || row.sellerName.length > 100
    || !amount || !start || BigInt(start[1]!) <= 0n
    || BigInt(amount[1]!) < BigInt(start[1]!)
    || typeof row.bidCount !== 'number' || !Number.isSafeInteger(row.bidCount) || row.bidCount < 0
    || typeof row.endsAt !== 'string' || !Number.isFinite(Date.parse(row.endsAt))
  ) return null;

  return {
    id: row.id,
    itemName: row.itemName,
    sellerName: row.sellerName,
    currentBidWld: amount[1]!,
    bidCount: row.bidCount,
    endsAt: row.endsAt,
  };
}

export function AuctionView(_props: { readonly userBalanceWld: string }) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    const abort = new AbortController();
    let cancelled = false;
    async function load() {
      setState({ kind: 'loading' });
      try {
        const response = await fetch('/api/v1/marketplace/auctions', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: abort.signal,
        });
        if (!response.ok) throw new Error('auction source unavailable');
        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || payload.length > 100) throw new Error('invalid auction list');
        const auctions = payload.map(parseAuction);
        if (auctions.some(item => item === null)) throw new Error('invalid auction entry');
        if (!cancelled) setState({ kind: 'ready', auctions: auctions as AuctionListing[] });
      } catch {
        if (!cancelled) setState({ kind: 'error' });
      }
    }
    void load();
    return () => {
      cancelled = true;
      abort.abort();
    };
  }, [revision]);

  return (
    <section aria-label="Verified auction listings" className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="size-5" />
            경매 입찰 일시 중단
          </CardTitle>
          <CardDescription>
            입찰금의 금융 원장 정산과 환불 검증이 완료되지 않아 경매 생성 및 입찰이 중단되었습니다.
            이 화면은 서버에서 확인된 매물의 읽기 전용 현황이며, WLD 차감·에스크로·낙찰을 보장하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={refresh} aria-label="경매 목록 다시 확인">
            <RefreshCw aria-hidden="true" className="size-4" /> 새로고침
          </Button>
        </CardContent>
      </Card>
      {state.kind === 'loading' && <p role="status">서버 경매 목록 확인 중...</p>}
      {state.kind === 'error' && (
        <p role="alert" className="rounded-md border border-destructive/40 p-4">
          경매 데이터를 확인할 수 없습니다. 서버 오류를 빈 경매 기록으로 표시하지 않습니다.
        </p>
      )}
      {state.kind === 'ready' && state.auctions.length === 0 && (
        <p role="status" className="rounded-md border p-4">확인된 경매 매물이 없습니다.</p>
      )}
      {state.kind === 'ready' && state.auctions.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {state.auctions.map(auction => (
            <Card key={auction.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gavel aria-hidden="true" className="size-4" />{auction.itemName}
                </CardTitle>
                <CardDescription>출품자: {auction.sellerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>서버 기록 최고 호가: <strong>{groupDigits(auction.currentBidWld)} WLD</strong></p>
                <p>기록된 입찰: {auction.bidCount}건</p>
                <p>기록된 종료 시각: {new Date(auction.endsAt).toLocaleString('ko-KR')}</p>
                <p className="text-muted-foreground">읽기 전용 · 입찰 및 에스크로 기능 중단</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
