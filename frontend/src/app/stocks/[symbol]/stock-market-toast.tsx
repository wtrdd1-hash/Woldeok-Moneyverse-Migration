'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, X, Radio } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';

export interface RecentTradeItem {
  readonly id: string;
  readonly price: number;
  readonly volume: number;
  readonly isBuy: boolean;
  readonly time: string;
}

interface StockMarketToastProps {
  readonly symbol: string;
  readonly currentPrice: string;
  readonly isEn?: boolean;
}

export function StockMarketToast({
  symbol,
  currentPrice,
  isEn = false,
}: StockMarketToastProps) {
  const [activeTrade, setActiveTrade] = useState<RecentTradeItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const priceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);

  // 12~20초 주기로 가상/실시간 대형 체결 틱 알림 시뮬레이션 및 슬라이드 인-아웃
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      // 30% 확률로 대규모 체결 틱 발생
      const isBuy = Math.random() > 0.45;
      const variation = (Math.random() - 0.48) * 0.02; // ±1% 변동
      const execPrice = Math.max(1, Math.round(priceNum * (1 + variation)));
      const volume = Math.floor(Math.random() * 80) + 10;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newTrade: RecentTradeItem = {
        id: Math.random().toString(36).slice(2, 9),
        price: execPrice,
        volume,
        isBuy,
        time: timeStr,
      };

      setActiveTrade(newTrade);
      setIsVisible(true);
      playStockTickSound();

      // 5초 후 슬라이드 아웃
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 14000);

    return () => {
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [priceNum]);

  if (!activeTrade || !isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 max-w-xs transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in"
    >
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
        {/* 체결 아이콘 */}
        <div
          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
            activeTrade.isBuy
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-rose-500/15 text-rose-500'
          }`}
        >
          {activeTrade.isBuy ? (
            <ArrowUpRight className="size-4.5" />
          ) : (
            <ArrowDownRight className="size-4.5" />
          )}
        </div>

        {/* 체결 내용 */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Radio className="size-2 text-primary animate-ping" />
              <span>{symbol} {isEn ? 'Live Trade' : '체결 틱'}</span>
            </span>
            <span>{activeTrade.time}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={`font-mono text-xs font-bold ${
                activeTrade.isBuy ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {groupDigits(activeTrade.price.toString())} WLD
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {groupDigits(activeTrade.volume.toString())}주 ({activeTrade.isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})
            </span>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="size-6 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-colors"
          aria-label={isEn ? 'Close toast' : '알림 닫기'}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
