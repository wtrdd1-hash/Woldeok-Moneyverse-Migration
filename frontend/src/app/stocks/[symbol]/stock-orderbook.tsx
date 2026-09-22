'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';

interface StockOrderbookProps {
  readonly currentPrice: string;
  readonly dayOpenPrice?: string;
  readonly isEn?: boolean;
  readonly onSelectPrice?: (price: string) => void;
}

interface OrderbookRow {
  readonly step: number;
  readonly price: string;
  readonly volume: number;
  readonly percent: number;
}

export function StockOrderbook({
  currentPrice,
  isEn = false,
  onSelectPrice,
}: StockOrderbookProps) {
  const priceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);

  // 5단계 매도호가 (Asks: 현재가보다 높은 5개 호가, 위에서 아래로 내림차순)
  const asks: OrderbookRow[] = [5, 4, 3, 2, 1].map((step) => {
    const askPrice = Math.round(priceNum * (1 + (step * 0.006)));
    const volume = Math.round(50 + (step * 35) + (Math.sin(step) * 20));
    return {
      step,
      price: askPrice.toString(),
      volume,
      percent: Math.min(100, Math.round((volume / 250) * 100)),
    };
  });

  // 5단계 매수호가 (Bids: 현재가보다 낮은 5개 호가, 위에서 아래로 내림차순)
  const bids: OrderbookRow[] = [1, 2, 3, 4, 5].map((step) => {
    const bidPrice = Math.max(1, Math.round(priceNum * (1 - (step * 0.006))));
    const volume = Math.round(45 + (step * 38) + (Math.cos(step) * 25));
    return {
      step,
      price: bidPrice.toString(),
      volume,
      percent: Math.min(100, Math.round((volume / 250) * 100)),
    };
  });

  const bestAsk = Number.parseInt(asks[asks.length - 1]?.price ?? currentPrice, 10);
  const bestBid = Number.parseInt(bids[0]?.price ?? currentPrice, 10);
  const spread = Math.abs(bestAsk - bestBid);
  const spreadBps = priceNum > 0 ? ((spread / priceNum) * 100).toFixed(2) : '0.00';

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Scale className="size-4 text-primary" />
            <span>{isEn ? 'Orderbook (5-Depth)' : '5단계 실시간 호가'}</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
            {isEn ? `Spread ${spread} WLD (${spreadBps}%)` : `스프레드 ${groupDigits(spread.toString())} WLD (${spreadBps}%)`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-2 space-y-1 text-xs font-mono select-none">
        {/* 매도호가 리스트 (Asks, Rose 계열) */}
        <div className="space-y-0.5">
          {asks.map((ask) => (
            <button
              key={`ask-${ask.step}`}
              type="button"
              onClick={() => onSelectPrice?.(ask.price)}
              className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-rose-500/15 transition-colors text-left"
            >
              {/* 잔량 비례 배경 게이지 바 */}
              <div
                className="absolute inset-y-0 right-0 bg-rose-500/10 rounded-r-md pointer-events-none transition-all duration-300"
                style={{ width: `${ask.percent}%` }}
              />
              <span className="relative z-10 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="text-[10px] opacity-70">+{ask.step * 0.6}%</span>
                <span>{groupDigits(ask.price)}</span>
              </span>
              <span className="relative z-10 text-muted-foreground group-hover:text-foreground">
                {groupDigits(ask.volume.toString())} {isEn ? 'sh' : '주'}
              </span>
            </button>
          ))}
        </div>

        {/* 현재 체결가 중앙 바 */}
        <div className="flex items-center justify-between px-3 py-2 my-1 rounded-lg bg-primary/10 border border-primary/30 font-bold">
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
              onClick={() => onSelectPrice?.(bid.price)}
              className="group relative flex w-full items-center justify-between px-3 py-1.5 rounded-md hover:bg-emerald-500/15 transition-colors text-left"
            >
              {/* 잔량 비례 배경 게이지 바 */}
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded-r-md pointer-events-none transition-all duration-300"
                style={{ width: `${bid.percent}%` }}
              />
              <span className="relative z-10 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="text-[10px] opacity-70">-{bid.step * 0.6}%</span>
                <span>{groupDigits(bid.price)}</span>
              </span>
              <span className="relative z-10 text-muted-foreground group-hover:text-foreground">
                {groupDigits(bid.volume.toString())} {isEn ? 'sh' : '주'}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
