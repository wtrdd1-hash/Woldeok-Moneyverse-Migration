'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';
import { TradeForm } from './trade-form';

interface Range {
  readonly day_high: string | null;
  readonly day_low: string | null;
  readonly year_high: string | null;
  readonly year_low: string | null;
  readonly first_trade_date: string | null;
}

interface ApiCandle {
  readonly bucket_at: string;
  readonly open_price: string;
  readonly high_price: string;
  readonly low_price: string;
  readonly close_price: string;
}

/**
 * The widths the chart offers, in seconds — the same set `stock_candles`
 * accepts, because a width this list allowed and the function refused would be
 * an error the reader caused by using the control as intended.
 *
 * Below a day the candles are folded from the minute candles the ticker
 * keeps, which are retained for thirty days; a day and a week come from the
 * daily table, which is kept for a year.
 */
const INTERVALS = [
  { seconds: 60, label: '1분' },
  { seconds: 300, label: '5분' },
  { seconds: 1800, label: '30분' },
  { seconds: 3600, label: '1시간' },
  { seconds: 7200, label: '2시간' },
  { seconds: 14400, label: '4시간' },
  { seconds: 86400, label: '1일' },
  { seconds: 604800, label: '1주' },
] as const;

const DEFAULT_INTERVAL = 86400;

const TIME = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const DAY = new Intl.DateTimeFormat('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' });

/**
 * One stock's detail, in a dialog.
 *
 * A dialog rather than a page because it is a glance, not a destination: the
 * question is "what has this been doing" and the answer belongs beside the buy
 * and sell buttons the reader is already looking at. Leaving the market to
 * find out and coming back to trade is the wrong shape for that — which is
 * also why the order forms are in here.
 *
 * The candles load when it opens, and again when the width changes. Rendering
 * a year of them into every card of a market page would be a lot of HTML for a
 * question nobody has asked yet.
 */
export function StockDetailDialog({
  stockId,
  symbol,
  name,
  currentPrice,
  dayOpenPrice,
  available,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly dayOpenPrice: string;
  readonly available: string;
}) {
  const [open, setOpen] = useState(false);
  const [interval, setInterval] = useState<number>(DEFAULT_INTERVAL);
  const [data, setData] = useState<{ candles: ApiCandle[]; range: Range | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setData(null);
    setFailed(false);
    void fetch(`/api/stocks/${stockId}/candles?interval=${interval}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
      .then((value: { candles: ApiCandle[]; range: Range | null }) => {
        if (!cancelled) setData(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, interval, stockId]);

  const intraday = interval < 86400;
  const quote = useQuote(stockId, { price: currentPrice, open: dayOpenPrice });

  /**
   * The fetched candles with the one still open brought up to the live price.
   *
   * A candle for a bucket that has not closed is a running total, and the
   * chart was showing whatever it was when the dialog opened while the price
   * beside it moved every second. The last bucket's close follows the
   * broadcast and its high and low stretch to admit it, which is exactly what
   * the database does to the same row on the next tick.
   *
   * When a bucket boundary passes with the dialog open a fresh candle is
   * started, but only below a day: the day and week buckets are aligned to
   * Seoul in SQL and guessing that alignment here would date the candle
   * wrong. Waiting for the next fetch is the better error.
   */
  const candles: Candle[] = useMemo(() => {
    const rows: Candle[] = (data?.candles ?? []).map((row) => ({
      at: row.bucket_at,
      open_price: row.open_price,
      high_price: row.high_price,
      low_price: row.low_price,
      close_price: row.close_price,
    }));

    const live = quote.price;
    const last = rows[rows.length - 1];
    if (!last || !/^\d+$/.test(live)) return rows;

    const started = new Date(last.at).getTime();
    if (Number.isNaN(started)) return rows;

    const width = interval * 1000;
    const now = Date.now();

    if (now < started + width) {
      // The candle's own figures are checked too, not just the live one: they
      // cross the network as strings, and a BigInt() that throws in here
      // throws during a render, which takes the whole page down rather than
      // just the chart.
      const integer = (value: string) => /^\d+$/.test(value);
      const bigger = (a: string, b: string) =>
        integer(a) ? (BigInt(a) >= BigInt(b) ? a : b) : b;
      const smaller = (a: string, b: string) =>
        integer(a) ? (BigInt(a) <= BigInt(b) ? a : b) : b;
      rows[rows.length - 1] = {
        ...last,
        high_price: bigger(last.high_price, live),
        low_price: smaller(last.low_price, live),
        close_price: live,
      };
      return rows;
    }

    if (interval < 86400) {
      const opened = Math.floor(now / width) * width;
      rows.push({
        at: new Date(opened).toISOString(),
        open_price: live,
        high_price: live,
        low_price: live,
        close_price: live,
      });
    }
    return rows;
  }, [data, quote.price, interval]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="min-h-11">
          상세 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="font-mono text-sm text-clay-ink">{symbol}</span> {name}
          </DialogTitle>
          <DialogDescription>
            봉의 몸통은 시가와 종가, 위아래 선은 그 구간의 고가와 저가예요. 오른 봉은 빨강,
            내린 봉은 파랑입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <label htmlFor={`interval-${stockId}`} className="eyebrow">
            봉 단위
          </label>
          <Select value={String(interval)} onValueChange={(value) => setInterval(Number(value))}>
            <SelectTrigger id={`interval-${stockId}`} className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS.map((option) => (
                <SelectItem key={option.seconds} value={String(option.seconds)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {failed ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            지금은 차트를 불러올 수 없어요.
          </p>
        ) : !data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <div className="grid gap-4">
            <CandleChart
              candles={candles}
              label={(at) => {
                const when = new Date(at);
                if (Number.isNaN(when.getTime())) return at;
                return intraday ? TIME.format(when) : DAY.format(when);
              }}
            />
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

        {/* The reader opened this to decide. Closing it to act on the decision
            would put the chart and the button on opposite sides of a click. */}
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <TradeForm
            stockId={stockId}
            side="buy"
            currentPrice={currentPrice}
            dayOpenPrice={dayOpenPrice}
            available={available}
            idSuffix="-detail"
          />
          <TradeForm
            stockId={stockId}
            side="sell"
            currentPrice={currentPrice}
            dayOpenPrice={dayOpenPrice}
            idSuffix="-detail"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Figure({
  term,
  value,
}: {
  readonly term: string;
  readonly value: string | null | undefined;
}) {
  return (
    <div className="rounded-[10px] border bg-surface p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      {/* A stock with no candle yet has no high, and saying so is better than
          showing a zero that reads as a real price. */}
      <dd className="tabular text-base font-bold">{value ? groupDigits(value) : '기록 없음'}</dd>
    </div>
  );
}
