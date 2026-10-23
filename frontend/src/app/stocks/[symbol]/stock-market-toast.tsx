'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X, Radio } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { useStockTrades } from '@/lib/use-market-prices';
import type { VerifiedStockTrade } from '@/lib/verified-stock-trade';

interface StockMarketToastProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly isEn?: boolean;
}

export function StockMarketToast({ stockId, symbol, isEn = false }: StockMarketToastProps) {
  const trades = useStockTrades(stockId);
  const latest = trades.find((trade) => trade.stockId === stockId);
  const [activeTrade, setActiveTrade] = useState<VerifiedStockTrade | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!latest) {
      setIsVisible(false);
      return;
    }
    setActiveTrade(latest);
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 5_000);
    return () => clearTimeout(timer);
  }, [latest]);

  if (!activeTrade || !isVisible || activeTrade.stockId !== stockId) return null;

  const isBuy = activeTrade.side === 'BUY';
  const time = new Date(activeTrade.timestamp).toLocaleTimeString(isEn ? 'en-US' : 'ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  return (
    <div role="status" aria-live="polite" className="fixed bottom-16 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 max-w-xs transition-all motion-reduce:transition-none animate-in slide-in-from-bottom-4 motion-reduce:animate-none fade-in">
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {isBuy ? <ArrowUpRight className="size-4.5" aria-hidden="true" /> : <ArrowDownRight className="size-4.5" aria-hidden="true" />}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Radio className="size-2 text-primary" aria-hidden="true" />
              <span>{symbol} {isEn ? 'Live Trade' : '실제 체결'}</span>
            </span>
            <time dateTime={activeTrade.timestamp}>{time}</time>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-mono text-xs font-bold ${isBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
              {groupDigits(activeTrade.price)} WLD
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {groupDigits(String(activeTrade.quantity))}{isEn ? 'sh' : '주'} ({isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})
            </span>
          </div>
        </div>
        <button type="button" onClick={() => setIsVisible(false)}
          className="size-10 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={isEn ? 'Dismiss confirmed trade' : '체결 알림 닫기'}>
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
