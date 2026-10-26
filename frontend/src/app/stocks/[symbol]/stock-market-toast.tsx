'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Radio, X } from 'lucide-react';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';
import { subscribeSocketRoom } from '@/lib/site-socket';

interface VerifiedTrade {
  readonly id: string;
  readonly stockId: string;
  readonly price: string;
  readonly quantity: number;
  readonly side: 'BUY' | 'SELL';
  readonly timestamp: string;
}

interface StockMarketToastProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly isEn?: boolean;
}

/**
 * Socket events are only displayed after the backend's trade() call completes.
 * Price ticks are NOT trade executions and must never synthesize fills.
 */
function verifiedTrade(payload: unknown, stockId: string): VerifiedTrade | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const row = payload as Record<string, unknown>;
  if (
    typeof row.id !== 'string' || row.id.length === 0 || row.id.length > 128 ||
    row.stockId !== stockId ||
    typeof row.price !== 'string' || !/^[1-9]\d{0,29}$/.test(row.price) ||
    typeof row.quantity !== 'number' || !Number.isSafeInteger(row.quantity) || row.quantity <= 0 ||
    (row.side !== 'BUY' && row.side !== 'SELL') ||
    typeof row.timestamp !== 'string'
  ) return null;

  const at = Date.parse(row.timestamp);
  // A live notification must be a recent server execution, not a stale replay.
  if (!Number.isFinite(at) || at < Date.now() - 120_000 || at > Date.now() + 30_000) return null;
  return row as unknown as VerifiedTrade;
}

export function StockMarketToast({ stockId, symbol, isEn = false }: StockMarketToastProps) {
  const [activeTrade, setActiveTrade] = useState<VerifiedTrade | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    seen.current.clear();
    setActiveTrade(null);
    setIsVisible(false);
    if (!stockId) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeSocketRoom<unknown>(
      `stock:${stockId}`,
      'stock:subscribe',
      'stock:unsubscribe',
      'stock:trade',
      stockId,
      (payload) => {
        const trade = verifiedTrade(payload, stockId);
        if (!trade || seen.current.has(trade.id)) return;
        // Keep replay protection bounded for long-lived tabs.
        if (seen.current.size >= 100) seen.current.clear();
        seen.current.add(trade.id);
        setActiveTrade(trade);
        setIsVisible(true);
        playStockTickSound();
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setIsVisible(false), 5000);
      },
    );

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      unsubscribe();
    };
  }, [stockId]);

  if (!activeTrade || !isVisible) return null;

  const isBuy = activeTrade.side === 'BUY';
  const tradeTime = new Date(activeTrade.timestamp).toLocaleTimeString(isEn ? 'en-US' : 'ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 max-w-xs transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in"
    >
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-3 shadow-xl flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`} aria-hidden="true">
          {isBuy ? <ArrowUpRight className="size-4.5" /> : <ArrowDownRight className="size-4.5" />}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Radio className="size-2 text-primary" aria-hidden="true" />
              <span>{symbol} {isEn ? 'Live Trade' : '체결 틱'}</span>
            </span>
            <time dateTime={activeTrade.timestamp}>{tradeTime}</time>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-mono text-xs font-bold ${isBuy ? 'text-emerald-500' : 'text-rose-500'}`}>
              {groupDigits(activeTrade.price)} WLD
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {groupDigits(activeTrade.quantity.toString())}{isEn ? ' shares' : '주'} ({isBuy ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도')})
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="min-h-11 min-w-11 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={isEn ? 'Close toast' : '알림 닫기'}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
