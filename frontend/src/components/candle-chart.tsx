import { groupDigits } from '@/lib/money';

/**
 * Candles, drawn the way a Korean market draws them: a wick from the low to
 * the high, a body from open to close, and both directions filled — a red
 * body for a session that closed up, a blue one for a session that closed
 * down. Hollow-for-up is the Western convention and reads here as "this one
 * is missing something".
 *
 * Candles arrive oldest first, which is the order `stock_candles` returns and
 * the order a chart reads.
 *
 * Geometry from BigInt, like every other chart here — a price is a
 * `numeric(38,0)` and `Number()` rounds silently past 2^53, which on a chart
 * puts two different prices at the same height.
 */
export interface Candle {
  /** Start of the bucket. A date for daily and weekly, a timestamp below that. */
  readonly at: string;
  readonly open_price: string;
  readonly high_price: string;
  readonly low_price: string;
  readonly close_price: string;
}

const WIDTH = 720;
const HEIGHT = 260;
/**
 * The pitch a candle sits at when there is room for it.
 *
 * Without a cap the slot is the full width divided by the count, so two
 * candles landed 360px apart with 14px of body between them — a chart that
 * stretched whatever it was given to fill the frame. Real charts keep the
 * pitch and let the drawing be as wide as it needs to be.
 */
const SLOT_MAX = 20;
/** Below this the figure is too narrow to read as a chart at all. */
const MIN_WIDTH = 260;
const PADDING_Y = 16;
const SCALE = 100_000n;
const INTEGER = /^-?\d+$/;

export function CandleChart({
  candles,
  label,
}: {
  readonly candles: readonly Candle[];
  /** How to write a bucket's start under the axis. Raw, if not given. */
  readonly label?: (at: string) => string;
}) {
  const ordered = candles
    .filter(
      (candle) =>
        INTEGER.test(candle.open_price) &&
        INTEGER.test(candle.high_price) &&
        INTEGER.test(candle.low_price) &&
        INTEGER.test(candle.close_price),
    );

  if (ordered.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        아직 그릴 일봉이 없어요. 하루가 지나면 첫 봉이 그려집니다.
      </p>
    );
  }

  let min = BigInt(ordered[0]!.low_price);
  let max = BigInt(ordered[0]!.high_price);
  for (const candle of ordered) {
    const low = BigInt(candle.low_price);
    const high = BigInt(candle.high_price);
    if (low < min) min = low;
    if (high > max) max = high;
  }
  const span = max - min === 0n ? 1n : max - min;

  const y = (value: bigint): number => {
    const ratio = Number(((value - min) * SCALE) / span) / Number(SCALE);
    return HEIGHT - PADDING_Y - ratio * (HEIGHT - PADDING_Y * 2);
  };

  const write = label ?? ((at: string) => at);

  // One slot per candle, with the body taking a little over half of it so
  // neighbouring candles stay separate at any count. The slot shrinks when
  // there are more candles than the frame fits and stops growing when there
  // are fewer, so a handful of candles cluster at a readable pitch instead of
  // being spread across the whole width.
  const slot = Math.min(WIDTH / ordered.length, SLOT_MAX);
  const drawn = slot * ordered.length;
  const chartWidth = Math.max(MIN_WIDTH, drawn);
  // Centred, so a short series sits in the middle of its figure rather than
  // hugging the left edge with empty space after it.
  const offset = (chartWidth - drawn) / 2;
  const body = Math.max(1.5, Math.min(14, slot * 0.6));

  return (
    <figure className="grid gap-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
          // Sized in pixels rather than stretched to the container: the
          // parent scrolls when the series is long, and a short one simply
          // draws narrower.
          style={{ width: chartWidth, maxWidth: '100%' }}
          className="h-[260px]"
          role="img"
          aria-label={`캔들 ${ordered.length}개. 최고 ${groupDigits(max.toString())}, 최저 ${groupDigits(min.toString())}.`}
        >
          {ordered.map((candle, index) => {
            const open = BigInt(candle.open_price);
            const close = BigInt(candle.close_price);
            const down = close < open;
            const colour = down ? 'var(--fall)' : 'var(--rise)';
            const centre = offset + index * slot + slot / 2;
            const top = y(close > open ? close : open);
            const bottom = y(close > open ? open : close);
            return (
              <g key={candle.at}>
                <line
                  x1={centre}
                  x2={centre}
                  y1={y(BigInt(candle.high_price))}
                  y2={y(BigInt(candle.low_price))}
                  stroke={colour}
                  strokeWidth={1}
                />
                <rect
                  x={centre - body / 2}
                  y={top}
                  width={body}
                  // A day that opened and closed level still has to be
                  // visible, so a zero-height body becomes a line.
                  height={Math.max(1, bottom - top)}
                  // Both directions filled. A hollow body is the Western
                  // "up" and reads here as an unfinished candle.
                  fill={colour}
                  stroke={colour}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="flex justify-between text-[11px] text-muted-foreground">
        <span>{write(ordered[0]?.at ?? '')}</span>
        <span className="tabular">
          최저 {groupDigits(min.toString())} · 최고 {groupDigits(max.toString())}
        </span>
        <span>{write(ordered[ordered.length - 1]?.at ?? '')}</span>
      </figcaption>
    </figure>
  );
}
