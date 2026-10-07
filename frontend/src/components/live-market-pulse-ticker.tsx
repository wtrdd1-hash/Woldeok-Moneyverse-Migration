'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

interface StockPulse {
  readonly symbol: string;
  readonly name: string;
  readonly price: number;
  readonly changePercent: number;
  readonly volume: string;
}

const MARKET_PULSE_STOCKS: readonly StockPulse[] = [
  { symbol: 'WDG', name: '월덕게임즈', price: 1450, changePercent: 4.8, volume: '184K' },
  { symbol: 'WDT', name: '월덱테크', price: 1714, changePercent: 3.2, volume: '95K' },
  { symbol: 'CHIMU', name: '치무테크', price: 3140, changePercent: -1.2, volume: '62K' },
  { symbol: 'SHIN', name: '신화바이오', price: 890, changePercent: 7.5, volume: '240K' },
  { symbol: 'DUCK', name: '덕이엔터', price: 2150, changePercent: 0.9, volume: '41K' },
  { symbol: 'HANG', name: '한강로지스', price: 620, changePercent: -2.4, volume: '88K' },
  { symbol: 'SAM', name: '삼한에너지', price: 4320, changePercent: 1.8, volume: '51K' },
  { symbol: 'YONG', name: '용산전자', price: 1120, changePercent: -0.5, volume: '33K' },
];

export function LiveMarketPulseTicker() {
  return (
    <div className="w-full rounded-2xl border border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-3 sm:p-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Activity className="size-3.5 text-emerald-400" />
            <T korean="실시간 가상 주식 펄스 티커" english="Live Virtual Market Pulse" japanese="リアルタイム仮想株式パルスティッカー" chinese="实时虚拟股票波动看板" />
          </span>
        </div>
        <Link
          href="/stocks"
          className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-0.5"
        >
          <T korean="전체 10대 종목 보기" english="View All 10 Stocks" japanese="全10銘柄を見る" chinese="查看全部10只股票" />
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="pt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {MARKET_PULSE_STOCKS.map((stk) => {
          const isUp = stk.changePercent >= 0;
          return (
            <Link
              key={stk.symbol}
              href={`/stocks/${stk.symbol}`}
              className="group shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/70 border border-border/60 hover:border-amber-500/40 transition-all active:scale-[0.98]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-foreground group-hover:text-amber-400 transition-colors">
                    {stk.symbol}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                    {stk.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                  <span className="font-bold text-foreground">
                    {stk.price.toLocaleString()} WLD
                  </span>
                  <span className={`font-black flex items-center gap-0.5 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isUp ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {isUp ? '+' : ''}{stk.changePercent}%
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
