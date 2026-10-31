'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, Gavel, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { parseVerifiedAuctions, type VerifiedAuction } from './auction-evidence';

interface AuctionViewProps {
  readonly userBalanceWld: string;
  readonly currentUserId?: string;
}

export function AuctionView({ userBalanceWld: _userBalanceWld }: AuctionViewProps) {
  const [auctions, setAuctions] = useState<readonly VerifiedAuction[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [revision, setRevision] = useState(0);

  const retry = useCallback(() => setRevision((previous) => previous + 1), []);
  useEffect(() => {
    const abort = new AbortController();
    setState('loading');
    setAuctions([]);
    async function load() {
      try {
        const response = await fetch('/api/marketplace/auctions', {
          cache: 'no-store', credentials: 'same-origin', signal: abort.signal,
        });
        if (!response.ok) throw new Error('auction request failed');
        const verified = parseVerifiedAuctions(await response.json());
        if (verified === null) throw new Error('unverified auction response');
        if (!abort.signal.aborted) { setAuctions(verified); setState('ready'); }
      } catch {
        if (!abort.signal.aborted) { setAuctions([]); setState('error'); }
      }
    }
    void load();
    return () => abort.abort();
  }, [revision]);

  return (
    <section className="grid gap-4" aria-label="경매 목록">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm" role="note">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>경매 매물은 서버에서 확인된 정보만 표시합니다. WLD 입찰·에스크로 정산은 원장 검증이 완료될 때까지 제공되지 않습니다.</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Gavel className="size-5" aria-hidden="true" />경매 현황</h2>
        <Button type="button" variant="outline" onClick={retry} disabled={state === 'loading'} className="min-h-11">
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />다시 조회
        </Button>
      </div>
      {state === 'loading' && <p role="status" aria-live="polite">경매 정보를 확인하는 중입니다.</p>}
      {state === 'error' && <p role="alert" className="rounded-lg border border-rose-500/40 p-4 text-sm">경매 정보를 조회할 수 없습니다. 잠시 후 다시 조회해 주세요.</p>}
      {state === 'ready' && auctions.length === 0 && <p role="status" className="rounded-lg border p-4 text-sm">현재 진행 중인 경매가 없습니다.</p>}
      {state === 'ready' && auctions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Card key={auction.id} className="flex flex-col justify-between overflow-hidden">
              <CardHeader className="space-y-2">
                <span className="text-xs text-muted-foreground">{auction.rarity}</span>
                <CardTitle className="break-words text-base">{auction.itemName}</CardTitle>
                <p className="break-words text-xs text-muted-foreground">출품자: {auction.sellerName}</p>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="break-words text-muted-foreground">{auction.description}</p>
                <p className="font-mono font-semibold">{groupDigits(auction.currentBidWld)} WLD · 입찰 {auction.bidCount}회</p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-4" aria-hidden="true" />마감: {new Date(auction.endsAt).toLocaleString('ko-KR')}</p>
                <Button type="button" disabled className="min-h-11 w-full" aria-label={`${auction.itemName} 입찰 이용 불가`}>입찰 준비 중</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
