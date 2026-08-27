import { compareAmounts, groupDigits } from '@/lib/money';

/**
 * A price line for one stock.
 *
 * The geometry is computed from BigInt, not from Number. A price is a
 * `numeric(38,0)` and the original chart ran every point through `Number()`,
 * which silently rounds anything past 2^53 — on a chart that shows up as two
 * distinct prices drawn at the same height. Ratios are taken at fixed
 * precision so the scaling stays exact for any magnitude.
 */

export interface PricePoint {
  readonly recorded_at: string;
  readonly price: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = 18;
/** Ratio precision. Far finer than a pixel at this width. */
const SCALE = 100_000n;

export function PriceChart({
  points,
  symbol,
}: {
  readonly points: readonly PricePoint[];
  readonly symbol: string;
}) {
  // Oldest first: the API returns most-recent-first, and a chart reads left
  // to right through time.
  const ordered = [...points].reverse().filter((point) => /^-?\d+$/.test(point.price));

  if (ordered.length < 2) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        차트를 만들 가격 기록이 아직 충분하지 않아요.
      </p>
    );
  }

  const prices = ordered.map((point) => BigInt(point.price));
  let min = prices[0] as bigint;
  let max = prices[0] as bigint;
  for (const price of prices) {
    if (price < min) min = price;
    if (price > max) max = price;
  }
  // A flat line still has to be drawn somewhere, so a zero range becomes one.
  const range = max - min === 0n ? 1n : max - min;

  const plotWidth = WIDTH - PADDING * 2;
  const plotHeight = HEIGHT - PADDING * 2;
  const coordinates = prices.map((price, index) => {
    const x = PADDING + (index * plotWidth) / (prices.length - 1);
    const ratio = Number(((price - min) * SCALE) / range) / Number(SCALE);
    return `${x.toFixed(1)},${(HEIGHT - PADDING - ratio * plotHeight).toFixed(1)}`;
  });

  const last = prices[prices.length - 1] as bigint;
  const first = prices[0] as bigint;
  const trend = compareAmounts(last.toString(), first.toString());

  return (
    <figure className="grid gap-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${symbol} 가격 ${groupDigits(min.toString())} WLD부터 ${groupDigits(max.toString())} WLD까지`}
          className="h-auto w-full min-w-[20rem]"
        >
          <polyline
            points={coordinates.join(' ')}
            fill="none"
            // Korean market convention, the same pair the amounts use.
            stroke={trend >= 0 ? 'var(--rise)' : 'var(--fall)'}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <figcaption className="tabular text-xs text-muted-foreground">
        최저 {groupDigits(min.toString())} WLD · 최고 {groupDigits(max.toString())} WLD · 현재{' '}
        {groupDigits(last.toString())} WLD
      </figcaption>
    </figure>
  );
}
