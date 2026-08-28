import { groupDigits } from '@/lib/money';

/**
 * Daily candles, drawn the way a market draws them: a wick from the day's low
 * to its high, a body from open to close, filled when the day closed down.
 *
 * Geometry from BigInt, like every other chart here — a price is a
 * `numeric(38,0)` and `Number()` rounds silently past 2^53, which on a chart
 * puts two different prices at the same height.
 */
export interface Candle {
  readonly trade_date: string;
  readonly open_price: string;
  readonly high_price: string;
  readonly low_price: string;
  readonly close_price: string;
}

const WIDTH = 720;
const HEIGHT = 260;
const PADDING_Y = 16;
const SCALE = 100_000n;
const INTEGER = /^-?\d+$/;

export function CandleChart({ candles }: { readonly candles: readonly Candle[] }) {
  // Oldest first: the API returns newest first, and a chart reads left to
  // right through time.
  const ordered = [...candles]
    .reverse()
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

  // One slot per day, with the body taking a little over half of it so
  // neighbouring candles stay separate at any count.
  const slot = WIDTH / ordered.length;
  const body = Math.max(1.5, Math.min(14, slot * 0.6));

  return (
    <figure className="grid gap-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[260px] w-full min-w-[420px]"
          role="img"
          aria-label={`일봉 ${ordered.length}개. 최고 ${groupDigits(max.toString())}, 최저 ${groupDigits(min.toString())}.`}
        >
          {ordered.map((candle, index) => {
            const open = BigInt(candle.open_price);
            const close = BigInt(candle.close_price);
            const down = close < open;
            const colour = down ? 'var(--fall)' : 'var(--rise)';
            const centre = index * slot + slot / 2;
            const top = y(close > open ? close : open);
            const bottom = y(close > open ? open : close);
            return (
              <g key={candle.trade_date}>
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
                  fill={down ? colour : 'var(--surface)'}
                  stroke={colour}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="flex justify-between text-[11px] text-muted-foreground">
        <span>{ordered[0]?.trade_date}</span>
        <span className="tabular">
          최저 {groupDigits(min.toString())} · 최고 {groupDigits(max.toString())}
        </span>
        <span>{ordered[ordered.length - 1]?.trade_date}</span>
      </figcaption>
    </figure>
  );
}
