'use client';

import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';

interface StockOrderbookProps {
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

  // 단계별 스텝 목록 생성 (5-Depth 또는 10-Depth)
  const askSteps = depth === 5 ? [5, 4, 3, 2, 1] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const bidSteps = depth === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 종목 가격대에 따른 호가 단위(틱 사이즈) 가중치 보정
  const tickStepPct = priceNum > 1_000_000 ? 0.002 : priceNum > 100_000 ? 0.003 : 0.005;

  let cumAsk = 0;
  const rawAsks = askSteps.map((step) => {
    const askPrice = Math.max(1, Math.round(priceNum * (1 + (step * tickStepPct))));
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
  const rawBids = bidSteps.map((step) => {
    const bidPrice = Math.max(1, Math.round(priceNum * (1 - (step * tickStepPct))));
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
  currentPrice,
  isEn = false,
  onSelectPrice,
}: StockOrderbookProps) {
  const [depth, setDepth] = useState<5 | 10>(5);
  const { asks, bids, spread, spreadBps, totalAskVolume, totalBidVolume, bidRatio, askRatio } = computeOrderbook(currentPrice, depth);

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            <span>{isEn ? `Orderbook (${depth}-Depth)` : `${depth}단계 실시간 호가`}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
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
          {asks.map((ask) => (
            <button
              key={`ask-${ask.step}`}
              type="button"
              onClick={() => onSelectPrice?.(ask.price, 'buy')}
              className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-rose-500/15 active:scale-[0.99] transition-all text-left"
              title={isEn ? `Click to buy at ${groupDigits(ask.price)} WLD` : `${groupDigits(ask.price)} WLD에 매수 주문 입력`}
            >
              {/* 잔량 비례 배경 게이지 바 */}
              <div
                className="absolute inset-y-0 right-0 bg-rose-500/10 rounded-r-md pointer-events-none transition-all duration-300"
                style={{ width: `${ask.percent}%` }}
              />
              <span className="relative z-10 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span className="text-[10px] opacity-70">+{ask.step * 0.5}%</span>
                <span>{groupDigits(ask.price)}</span>
              </span>
              <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                <span>{groupDigits(ask.volume.toString())}</span>
                <span className="text-[10px] opacity-70">{isEn ? 'sh' : '주'}</span>
              </span>
            </button>
          ))}
        </div>

        {/* 현재 체결가 중앙 바 */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 font-bold">
          <span className="text-primary flex items-center gap-1">
            <span>{isEn ? 'Current Price' : '현재 체결가'}</span>
          </span>
          <span className="text-sm font-extrabold text-foreground">
            {groupDigits(currentPrice)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </span>
        </div>

        {/* 매수호가 리스트 (Bids, Emerald 계열) */}
        <div className="space-y-0.5">
          {bids.map((bid) => (
            <button
              key={`bid-${bid.step}`}
              type="button"
              onClick={() => onSelectPrice?.(bid.price, 'sell')}
              className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-emerald-500/15 active:scale-[0.99] transition-all text-left"
              title={isEn ? `Click to sell at ${groupDigits(bid.price)} WLD` : `${groupDigits(bid.price)} WLD에 매도 주문 입력`}
            >
              {/* 잔량 비례 배경 게이지 바 */}
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded-r-md pointer-events-none transition-all duration-300"
                style={{ width: `${bid.percent}%` }}
              />
              <span className="relative z-10 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="text-[10px] opacity-70">-{bid.step * 0.5}%</span>
                <span>{groupDigits(bid.price)}</span>
              </span>
              <span className="relative z-10 text-muted-foreground group-hover:text-foreground font-normal flex items-center gap-1">
                <span>{groupDigits(bid.volume.toString())}</span>
                <span className="text-[10px] opacity-70">{isEn ? 'sh' : '주'}</span>
              </span>
            </button>
          ))}
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
