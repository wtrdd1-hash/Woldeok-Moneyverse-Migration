'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';

interface StockOrderbookProps {
  readonly stockId?: string | undefined;
  readonly symbol?: string | undefined;
  readonly currentPrice: string;
  readonly dayOpenPrice?: string | undefined;
  readonly isEn?: boolean | undefined;
  readonly onSelectPrice?: ((price: string, side: 'buy' | 'sell') => void) | undefined;
}

// Retained for the standalone chart's type contract, not for generated market data.
export interface OrderbookRow {
  readonly step: number;
  readonly price: string;
  readonly volume: number;
  readonly percent: number;
  readonly cumulativeVolume: number;
}

export function StockOrderbook({ stockId, currentPrice, dayOpenPrice, isEn = false }: StockOrderbookProps) {
  const quote = useQuote(stockId ?? '', { price: currentPrice, open: dayOpenPrice ?? currentPrice });
  const lastPrice = quote.price || currentPrice;
  const [checking, setChecking] = useState(false);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((previous) => previous + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    if (!stockId) return () => controller.abort();
    setChecking(true);
    void fetch(`/api/stocks/${encodeURIComponent(stockId)}/orderbook`, {
      cache: 'no-store',
      signal: controller.signal,
    }).catch(() => undefined).finally(() => {
      if (!controller.signal.aborted) setChecking(false);
    });
    return () => controller.abort();
  }, [stockId, revision]);

  return (
    <Card className="toss-card min-w-0 overflow-hidden border-border/80 shadow-sm" data-testid="stock-depth-source-hold">
      <CardHeader className="border-b border-border/60 bg-muted/20 p-3.5 sm:p-4">
        <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <Scale aria-hidden="true" className="size-4 shrink-0 text-primary" />
          {isEn ? 'Stock quote and order depth' : '주식 가격 및 호가 현황'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3.5 sm:p-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 p-3">
          <span className="text-xs text-muted-foreground">
            {isEn ? 'Last reported price (not an order or execution)' : '최근 제공 가격 (호가·체결 기록 아님)'}
          </span>
          <span className="break-all font-mono text-base font-bold tabular-nums">
            {groupDigits(lastPrice.replaceAll(',', ''))} WLD
          </span>
        </div>
        <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="min-w-0 break-words text-foreground">
            {checking
              ? (isEn ? 'Checking the order depth source. No live orders are displayed.' : '호가 원천 검증 중입니다. 실시간 주문 잔량은 표시하지 않습니다.')
              : (isEn ? 'Verified order depth and executions are unavailable. Price changes are not trades.' : '호가 및 체결 원천을 검증할 수 없어 주문 잔량과 체결 내역을 제공하지 않습니다.')}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={checking}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {isEn ? 'Check depth availability again' : '호가 제공 여부 다시 확인'}
        </button>
      </CardContent>
    </Card>
  );
}
