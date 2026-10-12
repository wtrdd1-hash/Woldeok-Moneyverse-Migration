'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import type { HubStock } from '../stock-hub';

interface StockTickerSwitcherProps {
  readonly stocks: readonly HubStock[];
  readonly currentSymbol: string;
  readonly isEn?: boolean;
}

export function StockTickerSwitcher({
  stocks,
  currentSymbol,
  isEn = false,
}: StockTickerSwitcherProps) {
  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-1.5 shadow-xs">
      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5"
        role="region"
        aria-label={isEn ? 'Stock Ticker Quick Switcher' : '가상 주식 퀵 티커 바'}
      >
        {stocks.map((s) => {
          const isSelected = s.symbol === currentSymbol;
          const currentP = Number.parseInt(s.current_price.replaceAll(',', '') || '0', 10);
          const openP = Number.parseInt(s.day_open_price.replaceAll(',', '') || s.current_price.replaceAll(',', '') || '0', 10);
          const diff = currentP - openP;
          const isUp = diff >= 0;
          const changePct = openP > 0 ? ((diff / openP) * 100).toFixed(1) : '0.0';

          return (
            <Link
              key={s.id}
              href={`/stocks/${encodeURIComponent(s.symbol)}`}
              className={`group shrink-0 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 min-h-[40px] text-xs transition-all ${
                isSelected
                  ? 'bg-primary/15 border border-primary/40 shadow-xs'
                  : 'hover:bg-muted/60 border border-transparent'
              }`}
              title={`${s.name} (${s.symbol}) - ${groupDigits(s.current_price)} WLD`}
            >
              {/* 심볼 및 종목명 */}
              <div className="flex flex-col min-w-0 leading-tight">
                <span
                  className={`font-mono text-xs font-bold ${
                    isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'
                  }`}
                >
                  {s.symbol}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                  {s.name}
                </span>
              </div>

              {/* 현재가 및 등락률 */}
              <div className="flex flex-col items-end leading-tight shrink-0 font-mono">
                <span className="font-bold text-[11px] text-foreground">
                  {groupDigits(s.current_price.replaceAll(',', ''))}
                </span>
                <span
                  className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                    isUp ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {isUp ? '+' : ''}{changePct}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
