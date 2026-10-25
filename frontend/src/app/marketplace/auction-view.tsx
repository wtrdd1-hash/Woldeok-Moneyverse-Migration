'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Gavel, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatAuctionWld, parseAuctionListings, type AuctionListing } from './auction-feed';

type FeedState = 'loading' | 'ready' | 'unavailable' | 'unauthenticated';

/** Only authoritative backend rows are rendered. Bidding stays OFF until ledger/escrow verification (#1269). */
export function AuctionView() {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [state, setState] = useState<FeedState>('loading');
  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      setState('loading');
      setAuctions([]);
      try {
        const res = await fetch('/api/marketplace/auctions', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setState(res.status === 401 ? 'unauthenticated' : 'unavailable');
          return;
        }
        const payload: unknown = await res.json();
        if (!payload || typeof payload !== 'object' || !('auctions' in payload)) throw new Error('Invalid feed');
        const rows = parseAuctionListings(payload.auctions);
        if (!cancelled) {
          setAuctions(rows);
          setState('ready');
        }
      } catch {
        if (!cancelled) setState('unavailable');
      }
    }
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const retry = () => setRefreshKey((key) => key + 1);
  const timeRemaining = (date: string) => {
    const seconds = Math.max(0, Math.floor((Date.parse(date) - now) / 1000));
    return seconds === 0 ? '마감 시간 경과' : `${Math.floor(seconds / 3600)}시간 ${Math.floor((seconds % 3600) / 60)}분`;
  };

  return (
    <section className="grid gap-5" aria-label="검증된 경매 매물">
      <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5 space-y-2">
        <h3 className="flex items-center gap-2 text-base font-semibold"><Gavel className="size-5" aria-hidden="true" /> 경매 매물 조회</h3>
        <p className="text-sm text-muted-foreground">서버에 등록된 경매 매물만 표시합니다. 입찰·에스크로 정산은 원장 검증이 완료될 때까지 일시 중단됩니다.</p>
      </div>

      {state === 'loading' && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">경매 목록을 불러오는 중입니다.</p>}
      {state === 'unauthenticated' && <p role="status" className="text-sm text-muted-foreground">경매 목록을 확인하려면 로그인이 필요합니다.</p>}
      {state === 'unavailable' && (
        <div role="alert" className="rounded-lg border border-destructive/30 p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm"><AlertCircle className="size-4" aria-hidden="true" /> 경매 목록을 확인할 수 없습니다. 임의의 매물을 대신 표시하지 않습니다.</p>
          <Button type="button" variant="outline" className="min-h-11" onClick={retry}><RefreshCw className="mr-2 size-4" aria-hidden="true" /> 다시 시도</Button>
        </div>
      )}
      {state === 'ready' && auctions.length === 0 && (
        <p role="status" aria-live="polite" className="rounded-lg border border-border p-5 text-sm text-muted-foreground">진행 중인 경매가 없습니다.</p>
      )}
      {state === 'ready' && auctions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {auctions.map((auc) => (
            <Card key={auc.id} className="flex h-full flex-col justify-between overflow-hidden">
              <CardHeader className="space-y-2 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{auc.rarity}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" aria-hidden="true" /> {timeRemaining(auc.endsAt)}</span>
                </div>
                <CardTitle className="text-base break-words">{auc.itemName}</CardTitle>
                <CardDescription className="text-xs break-words">{auc.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 px-4 sm:px-5">
                <p className="text-xs text-muted-foreground">현재 최고 호가 · {auc.bidCount}회 입찰</p>
                <p className="text-xl font-semibold font-mono text-primary break-all">{formatAuctionWld(auc.currentBidWld)} WLD</p>
                <p className="text-xs text-muted-foreground">출품자: {auc.sellerName}</p>
                {auc.buyNowPriceWld && <p className="text-xs text-muted-foreground">즉시 낙찰 기준가: {formatAuctionWld(auc.buyNowPriceWld)} WLD</p>}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2 p-4 sm:p-5">
                <Button type="button" disabled className="min-h-11 w-full"><ShieldAlert className="mr-2 size-4" aria-hidden="true" /> 입찰 일시 중단 (원장 검증 대기)</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
