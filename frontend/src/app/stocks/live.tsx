'use client';

import { useEffect, useState } from 'react';
import { Amount } from '@/components/amount';
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
    <div className="grid gap-0.5">
      <p className="text-xl font-medium">
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
  const direction = priceDirection(current, open);
  const amount = changeAmount(current, open);
  const percent = changePercent(current, open);

  if (direction === null) {
    return <p className="tabular text-xs text-muted-foreground">오늘 변동 없음</p>;
  }

  return (
    <p className={cn('tabular text-xs font-bold', direction === 'rise' ? 'text-rise' : 'text-fall')}>
      {/* groupDigits renders a leading minus as U+2212, so the sign is the
          amount's own and is not prefixed twice. */}
      오늘 {direction === 'rise' ? '+' : ''}
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
  const connected = useMarketConnected();
  if (!connected) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
      <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-rise" />
      실시간
    </span>
  );
}

/**
 * The preview line, drawn from the broadcast rather than from the load.
 *
 * The server renders the last few minutes and the socket then moves only the
 * price beside it, so the line used to sit still until the thirty-second
 * refresh redrew it — the one figure on the card that looked frozen while
 * everything around it moved.
 *
 * The server's series is the seed and every broadcast is pushed onto the
 * front of it, oldest falling off the end. A refresh arriving underneath does
 * not reset it: what is held here is newer than what the server just sent.
 *
 * A tick that repeats the price adds no point. The window is therefore the
 * last N *changes* rather than the last N seconds, which is what a line of
 * this size is answering anyway — it has no time axis to be wrong about.
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
  const [series, setSeries] = useState<readonly SparkPoint[]>(() => points.slice(0, limit));

  useEffect(() => {
    setSeries((previous) => {
      if (previous[0]?.price === quote.price) return previous;
      return [{ price: quote.price }, ...previous].slice(0, limit);
    });
  }, [quote.price, limit]);

  return (
    <Sparkline
      points={series}
      direction={priceDirection(quote.price, quote.open)}
      {...(className === undefined ? {} : { className })}
    />
  );
}
