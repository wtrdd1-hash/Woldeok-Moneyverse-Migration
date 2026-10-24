'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X, Radio } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';
import { useStockTrades, type LiveTradeData } from '@/lib/use-market-prices';

interface StockMarketToastProps {
  readonly stockId?: string;
  readonly symbol: string;
  readonly isEn?: boolean;
}

/**
 * Displays only a newly received, server-confirmed execution.
 * The NestJS stock service broadcasts stock:trade after PostgreSQL stock_trade returns.
 * Never infer a trade from a quote change or generate one on a timer.
 */
export function StockMarketToast({ stockId = '', symbol, isEn = false }: StockMarketToastProps) {
  const trades = useStockTrades(stockId);
  const latest = trades[0];
  const lastSeenId = useRef<string | null>(latest?.id ?? null);
  const [activeTrade, setActiveTrade] = useState<LiveTradeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!latest || latest.id === lastSeenId.current) return;
    lastSeenId.current = latest.id;
    setActiveTrade(latest);
    setIsVisible(true);
    playStockTickSound();
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [latest]);

  if (!activeTrade || !isVisible) return null;

  const isBuy = activeTrade.side === 'BUY';
  return (
    <div role="status" aria-live="polite" className="fixed bottom-16 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-xs transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in">
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
        <div aria-hidden="true" className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {isBuy ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Radio aria-hidden="true" className="size-3 text-primary" />
              {symbol} {isEn ? 'Confirmed trade' : '확인된 체결'}
            </span>
            <time dateTime={activeTrade.timestamp}>{new Date(activeTrade.timestamp).toLocaleTimeString(isEn ? 'en-US' : 'ko-KR', { hour12: false })}</time>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className={`font-mono text-xs font-bold ${isBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
              {groupDigits(activeTrade.price)} WLD
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {groupDigits(activeTrade.quantity.toString())}{isEn ? ' shares' : '주'} ({isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})
            </span>
          </div>
        </div>
        <button type="button" onClick={() => setIsVisible(false)} className="min-h-11 min-w-11 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label={isEn ? 'Close trade notification' : '알림 닫기'}>
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
