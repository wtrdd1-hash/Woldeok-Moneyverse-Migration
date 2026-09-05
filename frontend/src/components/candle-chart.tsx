'use client';

import { useEffect, useRef, useState } from 'react';
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

const HEIGHT = 260;
/**
 * The pitch a candle sits at when there is room for it.
 *
 * Without a cap the slot is the full width divided by the count, so two
 * candles landed 360px apart with 14px of body between them — a chart that
 * stretched whatever it was given to fill the frame. A chart keeps its pitch
 * and draws narrower than the frame when it has little to say.
 */
const SLOT_MAX = 20;
/**
 * And the pitch below which a candle stops being one.
 *
 * The cap above was the only bound, so the slot was still the frame divided
 * by the count once the count grew: two hundred minute candles came out at a
 * 3.6px pitch with a 2px body, which reads as a dashed rule along the chart
 * rather than as two hundred candles.
 *
 * What gives way past this point is the number of candles in view, not the
 * width of the figure. Drawing wider than the frame and scrolling was the
 * earlier answer, and it put the newest candles — the ones a reader opened
 * the chart for — behind a scrollbar; inside a dialog it dragged the dialog's
 * own text out of the box with it, which is a horizontal scrollbar across a
 * screen that should not have one.
 */
const SLOT_MIN = 9;
/** Below this the figure is too narrow to read as a chart at all. */
const MIN_WIDTH = 260;
/** The frame's width until it has been measured: server render, and tests. */
const ASSUMED_WIDTH = 720;
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

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

/**
 * A step a reader can add up in their head: 1, 2, 2.5 or 5 times a power of
 * ten, the smallest of them that yields about `target` steps across `span`.
 * BigInt throughout, for the reason everything on this chart is.
 */
function niceStep(span: bigint, target: number): bigint {
  const rough = span / BigInt(target);
  if (rough < 1n) return 1n;
  const exponent = rough.toString().length - 1;
  const base = pow10(exponent);
  const candidates = [
    base,
    2n * base,
    ...(exponent >= 1 ? [25n * pow10(exponent - 1)] : []),
    5n * base,
    10n * base,
  ];
  return candidates.find((candidate) => candidate >= rough) ?? 10n * base;
}

/**
 * Where the horizontal rules go, and what they say.
 *
 * A chart with no figures on its axis is a shape, not a reading: the caption
 * gives the extremes, but what a candle in the middle is worth was left to
 * the reader to interpolate. Linear axes get a step from `niceStep`; a log
 * axis gets 1, 2 and 5 of each decade, thinned to the decades alone when
 * that is too many to read.
 */
export function axisTicks(min: bigint, max: bigint, logarithmic: boolean): bigint[] {
  if (max <= min) return [min];
  if (!logarithmic) {
    const step = niceStep(max - min, 4);
    const ticks: bigint[] = [];
    for (let value = ((min + step - 1n) / step) * step; value <= max; value += step) {
      ticks.push(value);
    }
    return ticks;
  }
  const ticks: bigint[] = [];
  const lowest = Math.max(0, min.toString().length - 1);
  const highest = max.toString().length - 1;
  for (let exponent = lowest; exponent <= highest; exponent += 1) {
    for (const mantissa of [1n, 2n, 5n]) {
      const value = mantissa * pow10(exponent);
      if (value >= min && value <= max) ticks.push(value);
    }
  }
  return ticks.length > 8 ? ticks.filter((value) => value.toString().startsWith('1')) : ticks;
}

export function CandleChart({
  candles,
  label,
}: {
  readonly candles: readonly Candle[];
  /** How to write a bucket's start under the axis. Raw, if not given. */
  readonly label?: (at: string) => string;
}) {
  const ordered = candles.filter(
    (candle) =>
      INTEGER.test(candle.open_price) &&
      INTEGER.test(candle.high_price) &&
      INTEGER.test(candle.low_price) &&
      INTEGER.test(candle.close_price),
  );
  const drawable = ordered.length > 0;

  const frame = useRef<HTMLDivElement | null>(null);
  // The frame's width in CSS pixels. Measured rather than assumed: how many
  // candles this chart can hold is a question about the box it was handed,
  // and that box is a dialog on a phone as often as a column on a desktop.
  const [frameWidth, setFrameWidth] = useState(0);

  // `drawable` is in the dependencies because the frame is not in the tree
  // until there is something to draw in it: a chart whose first candles
  // arrive after it mounted has to be measured when they do.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = (): void => setFrameWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [drawable]);

  if (!drawable) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        아직 그릴 일봉이 없어요. 하루가 지나면 첫 봉이 그려집니다.
      </p>
    );
  }

  // What fits: the newest candles, at a pitch that stays readable. The pitch
  // is bounded at both ends as before, and past the tighter of the two it is
  // the count that gives way rather than the figure growing past its frame.
  const available = Math.max(MIN_WIDTH, frameWidth || ASSUMED_WIDTH);
  const capacity = Math.max(1, Math.floor(available / SLOT_MIN));
  const shown =
    ordered.length > capacity ? ordered.slice(ordered.length - capacity) : ordered;

  let min = BigInt(shown[0]!.low_price);
  let max = BigInt(shown[0]!.high_price);
  for (const candle of shown) {
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
  // neighbouring candles stay separate at any count. A handful of candles
  // cluster at the cap instead of being spread across the whole width; a
  // great many sit at the floor, and the ones that no longer fit are the
  // oldest, which the axis under the figure names.
  const slot = Math.min(Math.max(available / shown.length, SLOT_MIN), SLOT_MAX);
  const drawn = slot * shown.length;
  const chartWidth = available;
  // Centred, so a short series sits in the middle of its figure rather than
  // hugging the left edge with empty space after it.
  const offset = (chartWidth - drawn) / 2;
  const body = Math.max(1.5, Math.min(14, slot * 0.6));

  // The rules run the full width of the drawing and their figures sit in a
  // column beside it, because a number written over a candle is a number the
  // reader has to separate from the candle first.
  const ticks = axisTicks(min, max, logarithmic);
  const labels = ticks.map((tick) => ({ y: y(tick), text: groupDigits(tick.toString()) }));
  const axisWidth = 10 + 6.5 * Math.max(...labels.map((label) => label.text.length));

  return (
    <figure className="grid gap-2">
      <div className="flex items-start">
      <div ref={frame} className="min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
          // The drawing is built at the frame's own width, so this is one to
          // one and nothing is squeezed. It stays a percentage rather than
          // that measurement in pixels for the frame between a resize and
          // the observer hearing about it, and for the first paint of a
          // frame that has never been measured.
          preserveAspectRatio="none"
          className="h-[260px] w-full"
          role="img"
          aria-label={`캔들 ${shown.length}개. 최고 ${groupDigits(max.toString())}, 최저 ${groupDigits(min.toString())}.${
            logarithmic ? ' 세로 눈금은 로그입니다.' : ''
          }`}
        >
          {/* Paths rather than lines, so the wicks below stay the only <line>s
              in the drawing -- which is what the tests, and a reader of the
              markup, count. */}
          {labels.map((label) => (
            <path
              key={label.text}
              d={`M0 ${label.y} H ${chartWidth}`}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ))}
          {shown.map((candle, index) => {
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
      {/* The axis. aria-hidden because the figure's label already carries the
          extremes, and a screen reader walking a column of prices learns
          nothing the chart is not already saying. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${axisWidth} ${HEIGHT}`}
        style={{ width: axisWidth }}
        className="tabular h-[260px] shrink-0 border-l text-[10px]"
      >
        {labels.map((label) => (
          <text key={label.text} x={6} y={label.y + 3.5} fill="var(--muted-foreground)">
            {label.text}
          </text>
        ))}
      </svg>
      </div>
      <figcaption className="flex justify-between text-[11px] text-muted-foreground">
        <span>{write(shown[0]?.at ?? '')}</span>
        <span className="tabular">
          최저 {groupDigits(min.toString())} · 최고 {groupDigits(max.toString())}
          {/* Said outright rather than left to be inferred. A reader who
              takes a log axis for a linear one misreads every height on it. */}
          {logarithmic && <span className="ml-1">· 로그 눈금</span>}
        </span>
        <span>{write(shown[shown.length - 1]?.at ?? '')}</span>
      </figcaption>
    </figure>
  );
}
