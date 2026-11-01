'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X, Radio } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';
import { useStockTrades } from '@/lib/use-market-prices';

interface StockMarketToastProps {
  readonly stockId: string;
  readonly symbol: string;
  /** Retained for compatibility; the displayed price is never evidence of a trade. */
  readonly currentPrice?: string;
  readonly isEn?: boolean;
}

export function StockMarketToast({ stockId, symbol, isEn = false }: StockMarketToastProps) {
  const trades = useStockTrades(stockId);
  const latest = trades[0];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // The source must be a recent server execution, not a price change or timer.
    if (!latest || latest.stockId !== stockId || Date.now() - Date.parse(latest.timestamp) > 60_000) {
      setVisible(false);
      return;
    }
    setVisible(true);
    playStockTickSound();
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [latest, stockId]);

  if (!latest || !visible || latest.stockId !== stockId) return null;
  const isBuy = latest.side === 'BUY';
  const time = new Date(latest.timestamp).toLocaleTimeString(isEn ? 'en-GB' : 'ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  return (
    <div role="status" aria-live="polite" className="fixed bottom-16 right-4 z-50 max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6 sm:max-w-xs">
      <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xl">
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isBuy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
          {isBuy ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground"><Radio className="size-2 text-primary" />{symbol} {isEn ? 'Executed trade' : '실제 체결'}</span>
            <span>{time}</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-bold">
            <span className={isBuy ? 'text-emerald-500' : 'text-rose-500'}>{groupDigits(latest.price)} WLD</span>
            <span>{groupDigits(latest.quantity.toString())}{isEn ? ' shares' : '주'} ({isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})</span>
          </div>
        </div>
        <button type="button" onClick={() => setVisible(false)} className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-label={isEn ? 'Dismiss executed trade' : '체결 알림 닫기'}><X className="size-4" /></button>
      </div>
    </div>
  );
}
