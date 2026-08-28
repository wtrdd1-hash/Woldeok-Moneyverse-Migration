'use client';

import { useEffect, useState } from 'react';
import { CandleChart } from '@/components/candle-chart';
import type { Candle } from '@/components/candle-chart';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { groupDigits } from '@/lib/money';

interface Range {
  readonly day_high: string | null;
  readonly day_low: string | null;
  readonly year_high: string | null;
  readonly year_low: string | null;
  readonly first_trade_date: string | null;
}

/**
 * One stock's detail, in a dialog.
 *
 * A dialog rather than a page because it is a glance, not a destination: the
 * question is "what has this been doing" and the answer belongs beside the
 * buy and sell buttons the reader is already looking at. Leaving the market
 * to find out and coming back to trade is the wrong shape for that.
 *
 * The candles load when it opens. Rendering a year of them into every card of
 * a market page would be a lot of HTML for a question nobody has asked yet.
 */
export function StockDetailDialog({
  stockId,
  symbol,
  name,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ candles: Candle[]; range: Range | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    void fetch(`/api/stocks/${stockId}/candles`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
      .then((value: { candles: Candle[]; range: Range | null }) => {
        if (!cancelled) setData(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, data, stockId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="min-h-11">
          상세 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <span className="font-mono text-sm text-clay">{symbol}</span> {name}
          </DialogTitle>
          <DialogDescription>
            하루 한 봉입니다. 봉의 몸통은 시가와 종가, 위아래 선은 그날의 고가와 저가예요.
          </DialogDescription>
        </DialogHeader>

        {failed ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            지금은 차트를 불러올 수 없어요.
          </p>
        ) : !data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <div className="grid gap-4">
            <CandleChart candles={data.candles} />
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Figure term="오늘 고가" value={data.range?.day_high} />
              <Figure term="오늘 저가" value={data.range?.day_low} />
              <Figure term="1년 최고" value={data.range?.year_high} />
              <Figure term="1년 최저" value={data.range?.year_low} />
            </dl>
            {data.range?.first_trade_date && (
              <p className="text-xs text-muted-foreground">
                {data.range.first_trade_date}부터 기록했습니다.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Figure({ term, value }: { readonly term: string; readonly value: string | null | undefined }) {
  return (
    <div className="rounded-[10px] border bg-surface p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      {/* A stock with no candle yet has no high, and saying so is better than
          showing a zero that reads as a real price. */}
      <dd className="tabular text-base font-bold">
        {value ? groupDigits(value) : '기록 없음'}
      </dd>
    </div>
  );
}
