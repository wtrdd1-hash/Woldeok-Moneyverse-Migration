'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Scale, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';
import { generateKrxLadder, getKrxTickSize } from '../tick-size';

interface StockOrderbookProps {
  readonly stockId?: string | undefined;
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
}

export function computeOrderbook(currentPriceStr: string, depth: 5 | 10 = 5): OrderbookData {
  const priceNum = Number.parseInt(currentPriceStr.replaceAll(',', '') || '1000', 10);
  const { askPrices, bidPrices } = generateKrxLadder(priceNum, depth);

  // 단계별 스텝 목록 생성 (5-Depth 또는 10-Depth)
  const askSteps = depth === 5 ? [5, 4, 3, 2, 1] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const bidSteps = depth === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  let cumAsk = 0;
  const rawAsks = askSteps.map((step, idx) => {
    const askPrice = askPrices[idx] ?? Math.max(1, priceNum + step);
    const volume = Math.round(50 + (step * 35) + (Math.sin(step * 1.5) * 20));
    return { step, price: askPrice.toString(), volume };
  });

  const asks: OrderbookRow[] = rawAsks.map((item) => {
    cumAsk += item.volume;
    return {
      ...item,
      percent: Math.min(100, Math.round((item.volume / 350) * 100)),
      cumulativeVolume: cumAsk,
    };
  });

  let cumBid = 0;
  const rawBids = bidSteps.map((step, idx) => {
    const bidPrice = bidPrices[idx] ?? Math.max(1, priceNum - step);
    const volume = Math.round(45 + (step * 38) + (Math.cos(step * 1.5) * 25));
    return { step, price: bidPrice.toString(), volume };
  });

  const bids: OrderbookRow[] = rawBids.map((item) => {
    cumBid += item.volume;
    return {
      ...item,
      percent: Math.min(100, Math.round((item.volume / 350) * 100)),
      cumulativeVolume: cumBid,
    };
  });

  const totalAskVolume = asks.reduce((sum, a) => sum + a.volume, 0);
  const totalBidVolume = bids.reduce((sum, b) => sum + b.volume, 0);
  const grandTotal = totalAskVolume + totalBidVolume || 1;
  const bidRatio = Math.round((totalBidVolume / grandTotal) * 100);
  const askRatio = 100 - bidRatio;

  const bestAsk = Number.parseInt(asks[asks.length - 1]?.price ?? currentPriceStr, 10);
  const bestBid = Number.parseInt(bids[0]?.price ?? currentPriceStr, 10);
  const spread = Math.abs(bestAsk - bestBid);
  const spreadBps = priceNum > 0 ? ((spread / priceNum) * 100).toFixed(2) : '0.00';

  return {
    asks,
    bids,
    totalAskVolume,
    totalBidVolume,
    bidRatio,
    askRatio,
    bestAsk,
    bestBid,
    spread,
    spreadBps,
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
  
  // 웹소켓 실시간 틱 구독 (stockId가 있을 경우 실시간 반영, 없을 경우 fallback)
  const initialOpen = dayOpenPrice || currentPrice;
  const quote = useQuote(stockId ?? '', { price: currentPrice, open: initialOpen });
  const livePrice = quote.price || currentPrice;

  // 플래시 펄스 애니메이션 상태 ('rise' | 'fall' | null)
  const [flash, setFlash] = useState<'rise' | 'fall' | null>(null);
  const prevPriceRef = useRef<string>(livePrice);

  useEffect(() => {
    if (prevPriceRef.current && prevPriceRef.current !== livePrice) {
      const prevNum = Number.parseInt(prevPriceRef.current.replaceAll(',', ''), 10);
      const currNum = Number.parseInt(livePrice.replaceAll(',', ''), 10);

      if (currNum > prevNum) {
        setFlash('rise');
      } else if (currNum < prevNum) {
        setFlash('fall');
      }

      const timer = setTimeout(() => {
        setFlash(null);
      }, 650);

      prevPriceRef.current = livePrice;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = livePrice;
  }, [livePrice]);

  const livePriceNum = Number.parseInt(livePrice.replaceAll(',', '') || '1000', 10);
  const currentTick = getKrxTickSize(livePriceNum);
  const { asks, bids, spread, spreadBps, totalAskVolume, totalBidVolume, bidRatio, askRatio } = computeOrderbook(livePrice, depth);

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            <span>{isEn ? `Orderbook (${depth}-Depth)` : `${depth}단계 실시간 호가`}</span>
            {flash && (
              <span className="flex size-2 relative ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  flash === 'rise' ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />
                <span className={`relative inline-flex rounded-full size-2 ${
                  flash === 'rise' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] text-primary/80 hidden sm:inline-flex border-primary/30 bg-primary/5">
              {isEn ? `1 Tick = ${groupDigits(currentTick.toString())} WLD` : `1틱 = ${groupDigits(currentTick.toString())} WLD`}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground hidden sm:inline-flex">
              {isEn ? `Spread ${spread} WLD (${spreadBps}%)` : `스프레드 ${groupDigits(spread.toString())} WLD (${spreadBps}%)`}
            </Badge>
            {/* 5 / 10 Depth 토글 버튼 */}
            <div className="inline-flex rounded-lg border border-border/70 bg-muted/50 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDepth(5)}
                className={`rounded px-2 py-0.5 transition-all ${
                  depth === 5 ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                5D
              </button>
              <button
                type="button"
                onClick={() => setDepth(10)}
                className={`rounded px-2 py-0.5 transition-all ${
                  depth === 10 ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                10D
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 space-y-1.5 text-xs font-mono select-none">
        {/* 매도호가 리스트 (Asks, Rose 계열) */}
        <div className="space-y-0.5">
          {asks.map((ask) => {
            const askNum = Number.parseInt(ask.price, 10);
            const deltaPct = livePriceNum > 0 ? (((askNum - livePriceNum) / livePriceNum) * 100).toFixed(1) : (ask.step * 0.5).toFixed(1);
            return (
              <button
                key={`ask-${ask.step}`}
                type="button"
                onClick={() => onSelectPrice?.(ask.price, 'buy')}
                className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-rose-500/15 active:scale-[0.99] transition-all text-left touch-manipulation select-none"
                title={isEn ? `Click to buy at ${groupDigits(ask.price)} WLD` : `${groupDigits(ask.price)} WLD에 매수 주문 입력`}
              >
                {/* 잔량 비례 배경 게이지 바 */}
                <div
                  className="absolute inset-y-0 right-0 bg-rose-500/10 rounded-r-md pointer-events-none transition-all duration-300 will-change-[width] transform-gpu"
                  style={{ width: `${ask.percent}%` }}
                />
                <span className="relative z-10 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="text-[10px] opacity-70">+{deltaPct}%</span>
                  <span>{groupDigits(ask.price)}</span>
                </span>
                <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                  <span>{groupDigits(ask.volume.toString())}</span>
                  <span className="text-[10px] opacity-70">{isEn ? 'sh' : '주'}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 현재 체결가 중앙 바 (순간 플래시 펄스 애니메이션 탑재) */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border font-bold transition-all duration-300 ${
          flash === 'rise'
            ? 'bg-emerald-500/25 border-emerald-500/50 shadow-xs shadow-emerald-500/20'
            : flash === 'fall'
            ? 'bg-rose-500/25 border-rose-500/50 shadow-xs shadow-rose-500/20'
            : 'bg-primary/10 border-primary/30'
        }`}>
          <span className="text-primary flex items-center gap-1.5">
            <Zap className={`size-3.5 transition-transform duration-300 ${flash ? 'scale-125 text-amber-500' : ''}`} />
            <span>{isEn ? 'Current Price' : '현재 체결가'}</span>
          </span>
          <span className={`text-sm font-extrabold transition-colors duration-300 ${
            flash === 'rise' ? 'text-emerald-600 dark:text-emerald-400' : flash === 'fall' ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
          }`}>
            {groupDigits(livePrice)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </span>
        </div>

        {/* 매수호가 리스트 (Bids, Emerald 계열) */}
        <div className="space-y-0.5">
          {bids.map((bid) => {
            const bidNum = Number.parseInt(bid.price, 10);
            const deltaPct = livePriceNum > 0 ? (((bidNum - livePriceNum) / livePriceNum) * 100).toFixed(1) : (-bid.step * 0.5).toFixed(1);
            return (
              <button
                key={`bid-${bid.step}`}
                type="button"
                onClick={() => onSelectPrice?.(bid.price, 'sell')}
                className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-emerald-500/15 active:scale-[0.99] transition-all text-left touch-manipulation select-none"
                title={isEn ? `Click to sell at ${groupDigits(bid.price)} WLD` : `${groupDigits(bid.price)} WLD에 매도 주문 입력`}
              >
                {/* 잔량 비례 배경 게이지 바 */}
                <div
                  className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded-r-md pointer-events-none transition-all duration-300 will-change-[width] transform-gpu"
                  style={{ width: `${bid.percent}%` }}
                />
                <span className="relative z-10 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="text-[10px] opacity-70">{deltaPct}%</span>
                  <span>{groupDigits(bid.price)}</span>
                </span>
                <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                  <span>{groupDigits(bid.volume.toString())}</span>
                  <span className="text-[10px] opacity-70">{isEn ? 'sh' : '주'}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 호가 잔량 매수/매도 압력 비율 바 (Order Pressure Ratio) */}
        <div className="pt-2 px-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              {isEn ? 'Ask' : '매도'} {askRatio}% ({groupDigits(totalAskVolume.toString())})
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {isEn ? 'Bid' : '매수'} {bidRatio}% ({groupDigits(totalBidVolume.toString())})
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden flex">
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${askRatio}%` }}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${bidRatio}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
