'use client';

import { useEffect, useRef } from 'react';
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
/**
 * And the pitch below which a candle stops being one.
 *
 * The cap above was the only bound, so the slot was still the frame divided
 * by the count once the count grew: two hundred minute candles came out at a
 * 3.6px pitch with a 2px body, which reads as a dashed rule along the chart
 * rather than as two hundred candles. Past this the drawing is wider than the
 * frame and the frame scrolls, which is what its overflow is for and what the
 * cap's own reasoning already said charts do.
 */
const SLOT_MIN = 9;
/** Below this the figure is too narrow to read as a chart at all. */
const MIN_WIDTH = 260;
const PADDING_Y = 16;
const SCALE = 100_000n;
const INTEGER = /^-?\d+$/;

/**
 * When the axis stops being linear.
 *
 * A linear axis has to give the whole height to the largest move in view, so
 * one bucket that went up a hundredfold leaves every other candle a hairline
 * on the floor — which is the shape a reader sees as "the chart is broken",
 * not as "the price was flat". A price is multiplicative anyway: 10 to 20 is
 * the same event as 1000 to 2000, and only a log axis draws them the same
 * height. Narrow ranges stay linear, because that is the axis people read
 * without being told.
 */
const LOG_SPREAD = 8n;

/**
 * log10 of a price.
 *
 * A price is a `numeric(38,0)`, so it cannot go through `Number()` whole —
 * that rounds past 2^53. The exponent comes from the digit count and only the
 * leading digits are handed to a double.
 */
function log10(value: bigint): number {
  const digits = value.toString();
  if (digits.length <= 15) return Math.log10(Number(digits));
  return digits.length - 15 + Math.log10(Number(digits.slice(0, 15)));
}

export function CandleChart({
  candles,
  label,
}: {
  readonly candles: readonly Candle[];
  /** How to write a bucket's start under the axis. Raw, if not given. */
  readonly label?: (at: string) => string;
}) {
  const frame = useRef<HTMLDivElement | null>(null);
  // Whether the newest candle is the one in view. A live tick rewrites the
  // series once a second, and scrolling back to the right on each of those
  // would take the chart out of the hands of a reader looking at something
  // older — so the chart follows only while they are already at that end.
  const pinned = useRef(true);

  useEffect(() => {
    const element = frame.current;
    if (element && pinned.current) element.scrollLeft = element.scrollWidth;
  }, [candles]);

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

  // A price is never zero or negative here, but the axis is only defined for
  // positive values, so the guard is on the data rather than on the schema.
  const logarithmic = min > 0n && max / min >= LOG_SPREAD;
  const logMin = logarithmic ? log10(min) : 0;
  const logSpan = logarithmic ? Math.max(log10(max) - logMin, Number.EPSILON) : 1;

  const y = (value: bigint): number => {
    const ratio = logarithmic
      ? (log10(value) - logMin) / logSpan
      : Number(((value - min) * SCALE) / span) / Number(SCALE);
    return HEIGHT - PADDING_Y - ratio * (HEIGHT - PADDING_Y * 2);
  };

  const write = label ?? ((at: string) => at);

  // One slot per candle, with the body taking a little over half of it so
  // neighbouring candles stay separate at any count. The pitch is bounded at
  // both ends: a handful of candles cluster instead of being spread across
  // the whole width, and a great many of them make the drawing wider than the
  // frame instead of thinning to a hairline. The frame scrolls in the second
  // case, and the effect below starts it at the newest candle.
  const slot = Math.min(Math.max(WIDTH / ordered.length, SLOT_MIN), SLOT_MAX);
  const drawn = slot * ordered.length;
  const chartWidth = Math.max(MIN_WIDTH, drawn);
  // Centred, so a short series sits in the middle of its figure rather than
  // hugging the left edge with empty space after it.
  const offset = (chartWidth - drawn) / 2;
  const body = Math.max(1.5, Math.min(14, slot * 0.6));

  return (
    <figure className="grid gap-2">
      <div
        ref={frame}
        className="overflow-x-auto"
        onScroll={(event) => {
          const element = event.currentTarget;
          pinned.current = element.scrollWidth - element.clientWidth - element.scrollLeft < 4;
        }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
          // Sized in pixels and deliberately not capped at the container's
          // width: capping it scaled the whole drawing back down, which is
          // the squeeze the pitch floor exists to prevent. A drawing wider
          // than the frame scrolls; a shorter one simply draws narrower.
          style={{ width: chartWidth }}
          className="h-[260px]"
          role="img"
          aria-label={`캔들 ${ordered.length}개. 최고 ${groupDigits(max.toString())}, 최저 ${groupDigits(min.toString())}.${
            logarithmic ? ' 세로 눈금은 로그입니다.' : ''
          }`}
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
          {/* Said outright rather than left to be inferred. A reader who
              takes a log axis for a linear one misreads every height on it. */}
          {logarithmic && <span className="ml-1">· 로그 눈금</span>}
        </span>
        <span>{write(ordered[ordered.length - 1]?.at ?? '')}</span>
      </figcaption>
    </figure>
  );
}
