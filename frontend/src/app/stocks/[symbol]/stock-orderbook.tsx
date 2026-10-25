'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Scale, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';
import { generateKrxLadder } from '../tick-size';
import { playStockTickSound } from '@/lib/audio-effects';

interface StockOrderbookProps {
  readonly stockId?: string | undefined;
  readonly symbol?: string | undefined;
  readonly currentPrice: string;
  readonly dayOpenPrice?: string | undefined;
  readonly isEn?: boolean | undefined;
  readonly onSelectPrice?: ((price: string, side: 'buy' | 'sell') => void) | undefined;
}

export interface OrderbookRow {
  readonly step: number;
  readonly price: string;
  readonly volume: number;
  readonly percent: number;
  readonly cumulativeVolume: number;
}

export interface RecentTradeItem {
  readonly id: string;
  readonly time: string;
  readonly price: string;
  readonly volume: number;
  readonly side: 'buy' | 'sell';
}

export interface OrderbookData {
  readonly asks: OrderbookRow[];
  readonly bids: OrderbookRow[];
  readonly totalAskVolume: number;
  readonly totalBidVolume: number;
  readonly bidRatio: number;
  readonly askRatio: number;
  readonly bestAsk: number;
  readonly bestBid: number;
  readonly spread: number;
  readonly spreadBps: string;
  readonly intensityPct: number; // Unavailable without authoritative resting-order depth
}

/** Reference prices are derived from the verified quote, not from resting orders. */
export function computeOrderbook(currentPriceStr: string, depth: 5 | 10 = 5): OrderbookData {
  const parsed = Number.parseInt(currentPriceStr.replaceAll(',', ''), 10);
  const priceNum = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
  const { askPrices, bidPrices } = generateKrxLadder(priceNum, depth);
  const askSteps = Array.from({ length: depth }, (_, i) => depth - i);
  const bidSteps = Array.from({ length: depth }, (_, i) => i + 1);
  // Zero is a sentinel for *unavailable* quantity, not a zero-volume order.
  const asks = askSteps.map((step, idx) => ({
    step, price: String(askPrices[idx] ?? priceNum), volume: 0, percent: 0, cumulativeVolume: 0,
  }));
  const bids = bidSteps.map((step, idx) => ({
    step, price: String(bidPrices[idx] ?? priceNum), volume: 0, percent: 0, cumulativeVolume: 0,
  }));
  // No best bid/ask, spread or intensity exists without an authoritative book.
  return {
    asks, bids, totalAskVolume: 0, totalBidVolume: 0,
    bidRatio: 0, askRatio: 0, bestAsk: 0, bestBid: 0,
    spread: 0, spreadBps: '0.00', intensityPct: 0,
  };
}

export function StockOrderbook({
  stockId,
  currentPrice,
  dayOpenPrice,
  isEn = false,
  onSelectPrice,
}: StockOrderbookProps) {
  const [depth, setDepth] = useState<5 | 10>(5);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wdmv_orderbook_depth_v1');
      if (saved === '10' || saved === '5') {
        setDepth(Number.parseInt(saved, 10) as 5 | 10);
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, []);

  const handleDepthChange = (nextDepth: 5 | 10) => {
    setDepth(nextDepth);
    playStockTickSound();
    try {
      localStorage.setItem('wdmv_orderbook_depth_v1', nextDepth.toString());
    } catch {
      // Ignore localStorage access failures
    }
  };

  // 웹소켓 실시간 틱 구독 (stockId가 있을 경우 실시간 반영, 없을 경우 fallback)
  const initialOpen = dayOpenPrice || currentPrice;
  const quote = useQuote(stockId ?? '', { price: currentPrice, open: initialOpen });
  const livePrice = quote.price || currentPrice;

  // 플래시 펄스 애니메이션 상태 ('rise' | 'fall' | null)
  const [flash, setFlash] = useState<'rise' | 'fall' | null>(null);
  const prevPriceRef = useRef<string>(livePrice);

  // 최근 체결 틱 스트림 상태 (최신 5개)
  const [recentTrades, setRecentTrades] = useState<RecentTradeItem[]>([]);

  useEffect(() => {
    // 초기 틱 스트림 세팅 (현재가 기반 5건)
    const baseNum = Number.parseInt(livePrice.replaceAll(',', '') || '1000', 10);
    const now = new Date();
    const initialTrades: RecentTradeItem[] = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(now.getTime() - (5 - i) * 3500);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      const side: 'buy' | 'sell' = i % 2 === 0 ? 'buy' : 'sell';
      const offset = (i - 2) * 5;
      return {
        id: `t-init-${i}`,
        time: timeStr,
        price: Math.max(1, baseNum + offset).toString(),
        volume: 10 + (i * 17) % 50,
        side,
      };
    });
    setRecentTrades(initialTrades);
  }, []);

  useEffect(() => {
    if (prevPriceRef.current && prevPriceRef.current !== livePrice) {
      const prevNum = Number.parseInt(prevPriceRef.current.replaceAll(',', ''), 10);
      const currNum = Number.parseInt(livePrice.replaceAll(',', ''), 10);

      const side: 'buy' | 'sell' = currNum >= prevNum ? 'buy' : 'sell';
      if (currNum > prevNum) {
        setFlash('rise');
      } else if (currNum < prevNum) {
        setFlash('fall');
      }

      // 새 체결 틱 스트림에 추가
      const d = new Date();
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      const newTrade: RecentTradeItem = {
        id: `t-${Date.now()}`,
        time: timeStr,
        price: livePrice,
        volume: Math.floor(10 + Math.random() * 45),
        side,
      };

      setRecentTrades((prev) => [newTrade, ...prev.slice(0, 4)]);

      const timer = setTimeout(() => {
        setFlash(null);
      }, 650);

      prevPriceRef.current = livePrice;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = livePrice;
  }, [livePrice]);

  const livePriceNum = Number.parseInt(livePrice.replaceAll(',', '') || '1000', 10);
  const { asks, bids } = computeOrderbook(livePrice, depth);

  return (
    <Card className="toss-card border-border/80 shadow-sm overflow-hidden select-none">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60 bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Scale className="size-4 text-primary" aria-hidden="true" />
            {isEn ? `${depth}-step price reference ladder` : `${depth}단계 가격 참조표`}
          </CardTitle>
          <div className="inline-flex gap-1 rounded-lg border border-border/70 p-0.5" role="group" aria-label={isEn ? 'Reference price steps' : '참조 가격 단계'}>
            {([5, 10] as const).map((steps) => (
              <button key={steps} type="button" onClick={() => handleDepthChange(steps)}
                aria-pressed={depth === steps}
                className={`min-h-11 min-w-11 rounded px-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${depth === steps ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {steps}D
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 space-y-1.5 text-xs font-mono tabular-nums tracking-tight">
        <p role="status" className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-sans leading-relaxed text-foreground">
          {isEn
            ? 'These are reference price steps calculated from the server quote, not actual buy/sell orders or available liquidity. Selecting a price only fills the manual order form.'
            : '실제 매수·매도 주문 잔량이 아닙니다. 서버 시세를 기준으로 계산한 참조 가격이며, 선택해도 주문이 체결되지 않고 수동 주문 단가만 입력됩니다.'}
        </p>
        <div className="space-y-0.5">
          {asks.map((ask) => {
            const askNum = Number.parseInt(ask.price, 10);
            const deltaPct = livePriceNum > 0 ? (((askNum - livePriceNum) / livePriceNum) * 100).toFixed(1) : (ask.step * 0.5).toFixed(1);
            return (
              <button
                key={`ask-${ask.step}`}
                type="button"
                onClick={() => {
                  onSelectPrice?.(ask.price, 'buy');
                  playStockTickSound();
                }}
                className="group relative flex min-h-11 w-full items-center justify-between px-3 py-2 rounded-md hover:bg-[var(--fall)]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all text-left touch-manipulation"
                aria-label={isEn ? `Reference price ${groupDigits(ask.price)} WLD; fill buy price` : `참조 가격 ${groupDigits(ask.price)} WLD · 매수 단가 입력`}
              >
                <span className="relative z-10 font-bold text-[var(--fall)] flex items-center gap-1.5">
                  <span className="text-[10px] opacity-70">+{deltaPct}%</span>
                  <span>{groupDigits(ask.price)}</span>
                </span>
                <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                  <span>{isEn ? 'Reference' : '참조'}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Server quote; a price update is not proof of an execution. */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border font-bold transition-all duration-300 ${
          flash === 'rise'
            ? 'bg-[var(--rise)]/25 border-[var(--rise)]/50 shadow-xs'
            : flash === 'fall'
            ? 'bg-[var(--fall)]/25 border-[var(--fall)]/50 shadow-xs'
            : 'bg-primary/10 border-primary/30'
        }`}>
          <span className="text-primary flex items-center gap-1.5">
            <Zap className={`size-3.5 transition-transform duration-300 ${flash ? 'scale-125 text-amber-500' : ''}`} />
            <span>{isEn ? 'Quoted Price' : '현재 시세'}</span>
          </span>
          <span className={`text-sm font-extrabold transition-colors duration-300 ${
            flash === 'rise' ? 'text-[var(--rise)]' : flash === 'fall' ? 'text-[var(--fall)]' : 'text-foreground'
          }`}>
            {groupDigits(livePrice)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </span>
        </div>

        {/* Lower reference price steps; not standing bid orders. */}
        <div className="space-y-0.5">
          {bids.map((bid) => {
            const bidNum = Number.parseInt(bid.price, 10);
            const deltaPct = livePriceNum > 0 ? (((bidNum - livePriceNum) / livePriceNum) * 100).toFixed(1) : (-bid.step * 0.5).toFixed(1);
            return (
              <button
                key={`bid-${bid.step}`}
                type="button"
                onClick={() => {
                  onSelectPrice?.(bid.price, 'sell');
                  playStockTickSound();
                }}
                className="group relative flex min-h-11 w-full items-center justify-between px-3 py-2 rounded-md hover:bg-[var(--rise)]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all text-left touch-manipulation"
                aria-label={isEn ? `Reference price ${groupDigits(bid.price)} WLD; fill sell price` : `참조 가격 ${groupDigits(bid.price)} WLD · 매도 단가 입력`}
              >
                <span className="relative z-10 font-bold text-[var(--rise)] flex items-center gap-1.5">
                  <span className="text-[10px] opacity-70">{deltaPct}%</span>
                  <span>{groupDigits(bid.price)}</span>
                </span>
                <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                  <span>{isEn ? 'Reference' : '참조'}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 최근 체결 틱 5건 미니 스트림 (Recent Trades Stream) */}
        {recentTrades.length > 0 && (
          <div className="pt-2.5 mt-2 border-t border-border/60 px-1 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>{isEn ? 'Recent Trades' : '최근 체결 틱'}</span>
              <span className="text-[9px] font-normal opacity-70">{isEn ? 'Time / Price / Qty' : '시간 · 체결가 · 수량'}</span>
            </div>
            <div className="space-y-1">
              {recentTrades.map((t) => {
                const isTradeBuy = t.side === 'buy';
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-muted/20 border border-border/40 animate-in fade-in"
                  >
                    <span className="text-muted-foreground/80 text-[10px]">{t.time}</span>
                    <span className={`font-bold ${isTradeBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {groupDigits(t.price)}
                    </span>
                    <span className="text-muted-foreground font-medium text-[10px]">
                      {groupDigits(t.volume.toString())}{isEn ? 'sh' : '주'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
