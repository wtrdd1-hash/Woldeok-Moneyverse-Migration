import { cn } from '@/lib/cn';

/**
 * The shape of a price over the last few minutes, at the size of a caption.
 *
 * Geometry from BigInt for the same reason `PriceChart` uses it: a price is a
 * `numeric(38,0)`, and running the points through `Number()` draws two
 * distinct prices at the same height once they pass 2^53.
 *
 * No axes, no labels, no tooltip. It answers "which way has this been going"
 * and hands every other question to the detail chart.
 */
export interface SparkPoint {
  readonly price: string;
}

const WIDTH = 160;
const HEIGHT = 40;
const SCALE = 100_000n;

export function Sparkline({
  points,
  direction,
  className,
}: {
  /** Most recent first, as the API returns them. */
  readonly points: readonly SparkPoint[];
  readonly direction: 'rise' | 'fall' | null;
  readonly className?: string;
}) {
  const ordered = [...points].reverse().filter((point) => /^-?\d+$/.test(point.price));
  if (ordered.length < 2) {
    return (
      <div
        className={cn('h-10 rounded-[6px] border border-dashed', className)}
        aria-hidden
      />
    );
  }

  const prices = ordered.map((point) => BigInt(point.price));
  let min = prices[0] as bigint;
  let max = prices[0] as bigint;
  for (const price of prices) {
    if (price < min) min = price;
    if (price > max) max = price;
  }
  // A flat line still has to be drawn somewhere.
  const span = max - min === 0n ? 1n : max - min;

  const step = WIDTH / (prices.length - 1);
  const path = prices
    .map((price, index) => {
      const ratio = Number(((price - min) * SCALE) / span) / Number(SCALE);
      const y = HEIGHT - ratio * HEIGHT;
      return `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Korean market convention, the same one `Amount` follows: rise is red.
  const stroke =
    direction === 'rise'
      ? 'var(--rise)'
      : direction === 'fall'
        ? 'var(--fall)'
        : 'var(--muted-foreground)';

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('h-10 w-full', className)}
      // Decorative: the figures beside it carry the same information, and a
      // screen reader gains nothing from a path.
      aria-hidden
      focusable="false"
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
