'use client';

import { useEffect, useRef, useState } from 'react';
import { CandleChart } from '@/components/candle-chart';
import type { Candle } from '@/components/candle-chart';
import { useLocale } from '@/components/locale-provider';
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
import { applyTick, reconcile, rollOver } from './live-candles';
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

const INTERVALS = [
  { seconds: 60, label: '1분', enLabel: '1m' },
  { seconds: 300, label: '5분', enLabel: '5m' },
  { seconds: 1800, label: '30분', enLabel: '30m' },
  { seconds: 3600, label: '1시간', enLabel: '1h' },
  { seconds: 7200, label: '2시간', enLabel: '2h' },
  { seconds: 14400, label: '4시간', enLabel: '4h' },
  { seconds: 86400, label: '1일', enLabel: '1d' },
  { seconds: 604800, label: '1주', enLabel: '1w' },
] as const;

const DEFAULT_INTERVAL = 86400;


/**
 * How often the server's candles are fetched again while the dialog is open.
 *
 * The socket carries the price and the series below follows it, so this is
 * for what the socket does not carry: the minute a hidden tab slept through,
 * the day's high and low beside the chart, and the day and week candles the
 * dialog never opens on its own.
 */
const REFETCH_MS = 60_000;

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
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const [open, setOpen] = useState(false);
  const [interval, setInterval] = useState<number>(DEFAULT_INTERVAL);
  /**
   * The candles on screen: the server's rows, followed by the live price a
   * second at a time (see live-candles.ts). State rather than a memo over the
   * fetched rows, because the open candle has to remember the prices it has
   * already seen -- its high and low are the whole reason it has a wick.
   */
  const [series, setSeries] = useState<readonly Candle[]>([]);
  const [range, setRange] = useState<Range | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // Whether a fetch has ever succeeded for this width. A refetch that fails
  // after that must not blank a chart that is already drawn.
  const everLoaded = useRef(false);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [isEn],
  );

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
      }),
    [isEn],
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    everLoaded.current = false;
    setSeries([]);
    setRange(null);
    setLoaded(false);
    setFailed(false);

    const fetchCandles = (): void => {
      void fetch(`/api/stocks/${stockId}/candles?interval=${interval}`, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
        .then((value: { candles: ApiCandle[]; range: Range | null }) => {
          if (cancelled) return;
          const rows: Candle[] = (value.candles ?? []).map((row) => ({
            at: row.bucket_at,
            open_price: row.open_price,
            high_price: row.high_price,
            low_price: row.low_price,
            close_price: row.close_price,
          }));
          // The server's rows win for every bucket they cover; only what was
          // opened here after the last of them survives the merge.
          setSeries((local) => reconcile(rows, local));
          setRange(value.range);
          everLoaded.current = true;
          setLoaded(true);
        })
        .catch(() => {
          if (!cancelled && !everLoaded.current) setFailed(true);
        });
    };

    fetchCandles();
    const refetch = window.setInterval(() => {
      // A hidden tab is not being read; asking on its behalf spends the
      // reader's battery on a screen nobody is looking at.
      if (document.visibilityState === 'visible') fetchCandles();
    }, REFETCH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(refetch);
    };
  }, [open, interval, stockId]);

  const intraday = interval < 86400;
  const quote = useQuote(stockId, { price: currentPrice, open: dayOpenPrice });


  // Every broadcast price goes into the open candle, or opens the next one.
  useEffect(() => {
    if (!open) return;
    setSeries((local) => applyTick(local, quote.price, Date.now(), interval));
  }, [open, quote.price, interval]);

  // And the clock alone opens the next candle when no price has arrived to
  // do it: a quiet minute is still a minute. `rollOver` hands back the same
  // series until a boundary passes, so this costs no render in between.
  useEffect(() => {
    if (!open || !intraday) return;
    const timer = window.setInterval(() => {
      setSeries((local) => rollOver(local, Date.now(), interval));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, intraday, interval]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="min-h-11">
          {isEn ? 'Details' : '상세 보기'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="font-mono text-sm text-clay-ink">{symbol}</span> {name}{' '}
            {isEn ? 'Details' : '상세'}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'The candlestick body indicates open and close prices, and the wicks show high and low ranges. Red indicates a rise, blue indicates a fall.'
              : '봉의 몸통은 시가와 종가, 위아래 선은 그 구간의 고가와 저가예요. 오른 봉은 빨강, 내린 봉은 파랑입니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <label htmlFor={`interval-${stockId}`} className="eyebrow">
            {isEn ? 'Interval' : '봉 단위'}
          </label>
          <Select value={String(interval)} onValueChange={(value) => setInterval(Number(value))}>
            <SelectTrigger id={`interval-${stockId}`} className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS.map((option) => (
                <SelectItem key={option.seconds} value={String(option.seconds)}>
                  {isEn ? option.enLabel : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {failed ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {isEn ? 'Unable to load chart at this time.' : '지금은 차트를 불러올 수 없어요.'}
          </p>
        ) : !loaded ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <div className="grid gap-4">
            <CandleChart
              candles={series}
              label={(at) => {
                const when = new Date(at);
                if (Number.isNaN(when.getTime())) return at;
                return intraday ? timeFormatter.format(when) : dayFormatter.format(when);
              }}
            />
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
<Figure term={isEn ? 'Today High' : '오늘 고가'} value={range?.day_high} />
              <Figure term={isEn ? 'Today Low' : '오늘 저가'} value={range?.day_low} />
              <Figure term={isEn ? '52-Week High' : '1년 최고'} value={range?.year_high} />
              <Figure term={isEn ? '52-Week Low' : '1년 최저'} value={range?.year_low} />
            </dl>
            {range?.first_trade_date && (
              <p className="text-xs text-muted-foreground">
{isEn
                  ? `Recorded since ${range.first_trade_date}`
                  : `${range.first_trade_date}부터 기록했습니다.`}
              </p>
            )}
          </div>
        )}

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
  isEn,
}: {
  readonly term: string;
  readonly value: string | null | undefined;
  readonly isEn?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[10px] border bg-surface p-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="tabular text-base leading-tight font-bold [overflow-wrap:anywhere]">
        {value ? groupDigits(value) : (isEn ? 'No record' : '기록 없음')}
      </dd>
    </div>
  );
}
