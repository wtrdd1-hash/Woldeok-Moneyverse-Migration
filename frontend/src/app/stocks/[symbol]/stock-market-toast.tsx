'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Radio, X } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';
import { useStockTrades, type LiveTradeData } from '@/lib/use-market-prices';

interface StockMarketToastProps {
  readonly stockId?: string | undefined;
  readonly symbol: string;
  readonly currentPrice?: string | undefined;
  readonly isEn?: boolean | undefined;
}

export function StockMarketToast({ stockId = '', symbol, isEn = false }: StockMarketToastProps) {
  const trades = useStockTrades(stockId);
  const [activeTrade, setActiveTrade] = useState<LiveTradeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const seen = useRef({ stockId, id: trades[0]?.id ?? null });

  useEffect(() => {
    if (seen.current.stockId !== stockId) {
      seen.current = { stockId, id: trades[0]?.id ?? null };
      return;
    }
    const newest = trades[0];
    if (!newest || newest.id === seen.current.id) return;

    // A price tick is not an execution. Only the server's stock:trade event can open this toast.
    seen.current.id = newest.id;
    setActiveTrade(newest);
    setIsVisible(true);
    playStockTickSound();
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [stockId, trades]);

  if (!activeTrade || !isVisible) return null;
  const isBuy = activeTrade.side === 'BUY';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-xs animate-in slide-in-from-bottom-4 fade-in"
    >
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {isBuy ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownRight className="size-4" aria-hidden="true" />}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Radio className="size-2 text-primary" aria-hidden="true" />
              <span>{symbol} {isEn ? 'Verified execution' : '서버 확인 체결'}</span>
            </span>
            <time dateTime={activeTrade.timestamp}>
              {new Date(activeTrade.timestamp).toLocaleTimeString(isEn ? 'en-US' : 'ko-KR', { hour12: false })}
            </time>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-mono text-xs font-bold ${isBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
              {groupDigits(activeTrade.price)} WLD
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {groupDigits(String(activeTrade.quantity))}{isEn ? ' shares' : '주'} ({isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="min-h-11 min-w-11 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isEn ? 'Close toast' : '알림 닫기'}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
