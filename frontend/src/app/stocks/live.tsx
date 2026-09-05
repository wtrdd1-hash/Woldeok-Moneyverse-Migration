'use client';

import { useMemo } from 'react';
import { Amount } from '@/components/amount';
import { useLocale } from '@/components/locale-provider';
import { Sparkline } from '@/components/sparkline';
import type { SparkPoint } from '@/components/sparkline';
import { cn } from '@/lib/cn';
import { changeAmount, changePercent, groupDigits, priceDirection } from '@/lib/money';
import { useMarketConnected, useQuote } from '@/lib/use-market-prices';

/**
 * The parts of the market screen that move.
 *
 * The cards themselves stay server-rendered — names, descriptions, the float,
 * the buttons — and only the figures that change every second are client
 * components. That keeps the page's first paint the server's HTML and the
 * per-second work to re-rendering a few numbers.
 */
export function LiveQuote({
  stockId,
  price,
  open,
}: {
  readonly stockId: string;
  readonly price: string;
  readonly open: string;
}) {
  const quote = useQuote(stockId, { price, open });
  const direction = priceDirection(quote.price, quote.open);

  return (
    // The sparkline beside this one does not shrink, so without `min-w-0` a
    // large enough price pushes it out of the card rather than wrapping.
    <div className="grid min-w-0 gap-0.5">
      <p className="text-xl leading-tight font-medium [overflow-wrap:anywhere]">
        <Amount value={quote.price} direction={direction} currency />
      </p>
      <TodayMove current={quote.price} open={quote.open} />
    </div>
  );
}

/**
 * Today's move, in WLD and in percent.
 *
 * Both, because neither answers the question alone: a hundred WLD is a lot on
 * a cheap stock and nothing on an expensive one, and a percentage without the
 * amount is hard to act on when the reader is about to buy a quantity.
 */
function TodayMove({ current, open }: { readonly current: string; readonly open: string }) {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const direction = priceDirection(current, open);
  const amount = changeAmount(current, open);
  const percent = changePercent(current, open);

  if (direction === null) {
    return <p className="tabular text-xs text-muted-foreground">{isEn ? 'No change today' : '오늘 변동 없음'}</p>;
  }

  return (
    <p className={cn('tabular text-xs font-bold', direction === 'rise' ? 'text-rise' : 'text-fall')}>
      {/* groupDigits renders a leading minus as U+2212, so the sign is the
          amount's own and is not prefixed twice. */}
      {isEn ? 'Today ' : '오늘 '}
      {direction === 'rise' ? '+' : ''}
      {groupDigits(amount)}
      {percent && <span className="ml-1 font-normal">({percent}%)</span>}
    </p>
  );
}

/** A holding's value at the live price rather than at the price of the load. */
export function LiveHoldingValue({
  stockId,
  quantity,
  price,
  averageCost,
}: {
  readonly stockId: string;
  readonly quantity: string;
  readonly price: string;
  readonly averageCost: string;
}) {
  const quote = useQuote(stockId, { price, open: averageCost });

  // BigInt, not Number: a holding of a million shares at a million WLD is past
  // 2^53, and a valuation that silently rounds is worse than no valuation.
  const value =
    /^\d+$/.test(quantity) && /^\d+$/.test(quote.price)
      ? (BigInt(quantity) * BigInt(quote.price)).toString()
      : null;

  if (value === null) return <span className="text-muted-foreground">—</span>;

  return <Amount value={value} direction={priceDirection(quote.price, averageCost)} />;
}

/** Says the figures are live, once one has actually arrived. */
export function LiveBadge() {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  const connected = useMarketConnected();
  if (!connected) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
      <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-rise" />
      {isEn ? 'Live' : '실시간'}
    </span>
  );
}

/**
 * The preview line, with the minute in progress drawn from the broadcast.
 *
 * The server renders an hour of one-minute closes and the socket then moves
 * only the price beside it, so the line used to sit still until the
 * thirty-second refresh redrew it — the one figure on the card that looked
 * frozen while everything around it moved.
 *
 * The broadcast price replaces the newest point rather than being added to
 * the series, because that point *is* the minute in progress (136) and the
 * price is where it stands. Pushing one point per second onto the front
 * instead turned an hour-wide window into a forty-second one within a minute
 * of the page being open, and forty seconds of a walk this calm is noise
 * stretched to the full height of the figure — the saw this pair of changes
 * is here to stop drawing.
 *
 * Derived rather than held: the thirty-second refresh brings the minutes
 * that have closed since the load, and state seeded once from the props
 * would have ignored every one of them.
 */
export function LiveSparkline({
  stockId,
  points,
  price,
  open,
  limit,
  className,
}: {
  readonly stockId: string;
  /** Most recent first, as the API returns them. */
  readonly points: readonly SparkPoint[];
  readonly price: string;
  readonly open: string;
  readonly limit: number;
  readonly className?: string;
}) {
  const quote = useQuote(stockId, { price, open });
  const series = useMemo<readonly SparkPoint[]>(
    () => [{ price: quote.price }, ...points.slice(1, limit)],
    [points, quote.price, limit],
  );

  return (
    <Sparkline
      points={series}
      direction={priceDirection(quote.price, quote.open)}
      {...(className === undefined ? {} : { className })}
    />
  );
}
