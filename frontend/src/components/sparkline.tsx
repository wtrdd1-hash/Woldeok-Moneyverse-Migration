import { cn } from '@/lib/cn';

/**
 * The shape of a price over the last hour, at the size of a caption.
 *
 * Geometry from BigInt for the same reason `CandleChart` uses it: a price is a
 * `numeric(38,0)`, and running the points through `Number()` draws two
 * distinct prices at the same height once they pass 2^53.
 *
 * No axes, no labels, no tooltip. It answers "which way has this been going"
 * and hands every other question to the detail chart.
 *
 * It does have a scale, though it does not print one. A line normalised to
 * nothing but its own extremes draws an hour that moved a hundredth of a
 * percent exactly like an hour that moved thirty: the quiet one comes out as
 * a saw filling the figure, which reads as a broken market rather than a calm
 * one. Below `MIN_SPAN_DIVISOR` of the price the line is drawn shorter than
 * the box instead of being stretched to fill it.
 */
export interface SparkPoint {
  readonly price: string;
}

const WIDTH = 160;
const HEIGHT = 40;
const SCALE = 100_000n;
/**
 * The range that fills the figure, as a share of the price: one percent.
 *
 * A stock's day is about three percent under 124's defaults, so an hour of
 * ordinary drift is a fraction of the height and a day's worth of news fills
 * it. The denominator, not the number, is the point: the height means
 * something now.
 */
const MIN_SPAN_DIVISOR = 100n;

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

  // The band the line is drawn against: its own extremes, widened to the
  // floor when it moved less than that. Widened about the middle, so a
  // series that barely moved sits across the centre of the figure rather
  // than along one of its edges.
  const last = prices[prices.length - 1] as bigint;
  const floor = (last < 0n ? -last : last) / MIN_SPAN_DIVISOR;
  let low = min;
  let high = max;
  if (high - low < floor) {
    const middle = (min + max) / 2n;
    low = middle - floor / 2n;
    high = low + floor;
  }
  // A flat line at a price of zero still has to be drawn somewhere.
  const span = high - low === 0n ? 1n : high - low;

  const step = WIDTH / (prices.length - 1);
  const path = prices
    .map((price, index) => {
      const ratio = Number(((price - low) * SCALE) / span) / Number(SCALE);
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
