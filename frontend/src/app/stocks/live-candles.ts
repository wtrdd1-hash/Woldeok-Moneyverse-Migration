import type { Candle } from '@/components/candle-chart';

/**
 * The candle a reader is watching, kept up to date between fetches.
 *
 * The detail dialog fetches the server's candles when it opens and then hears
 * a price a second over the socket. Folding those prices into the series is
 * this file's job, and it is a pure function of (series, price, clock) so it
 * can be tested without a dialog, a socket or a clock.
 *
 * It used to be a memo that recomputed from the fetched rows every tick.
 * That had no memory: the open bucket was rebuilt from scratch on each price,
 * so its open, high and low were always the latest price and the candle
 * drew as a flat dash with no wick; and once a bucket boundary passed, the
 * same one synthesized candle was moved to the new bucket rather than a new
 * candle being added, so the chart never grew. Both are what a series that
 * remembers fixes.
 *
 * Buckets below a day are aligned to multiples of the width since the epoch,
 * which is how `stock_candles` folds the minute table, so a candle started
 * here lands on the same slot the server will report for it. A day and a
 * week are aligned to Seoul in SQL and are never opened here; the day's
 * candle is only brought up to the live price and the next fetch does the
 * rest.
 */

const INTEGER = /^\d+$/;
const DAY = 86_400;

/** Start of the bucket `atMs` falls in, as `stock_candles` would place it. */
export function bucketStart(atMs: number, widthSeconds: number): number {
  const width = widthSeconds * 1000;
  return Math.floor(atMs / width) * width;
}

function flat(atMs: number, price: string): Candle {
  return {
    at: new Date(atMs).toISOString(),
    open_price: price,
    high_price: price,
    low_price: price,
    close_price: price,
  };
}

function bigger(a: string, b: string): string {
  return BigInt(a) >= BigInt(b) ? a : b;
}

function smaller(a: string, b: string): string {
  return BigInt(a) <= BigInt(b) ? a : b;
}

function wellFormed(candle: Candle): boolean {
  return (
    INTEGER.test(candle.open_price) &&
    INTEGER.test(candle.high_price) &&
    INTEGER.test(candle.low_price) &&
    INTEGER.test(candle.close_price)
  );
}

/** The last candle brought up to `price`: high and low stretch to admit it, close follows it. */
function extended(last: Candle, price: string): Candle {
  return {
    ...last,
    high_price: bigger(last.high_price, price),
    low_price: smaller(last.low_price, price),
    close_price: price,
  };
}

function same(a: Candle, b: Candle): boolean {
  return (
    a.high_price === b.high_price && a.low_price === b.low_price && a.close_price === b.close_price
  );
}

/**
 * The series with one more price in it.
 *
 * Inside the open bucket the last candle stretches; past its end a new candle
 * opens at the price. Anything that is not a run of digits is ignored rather
 * than thrown on -- it crossed a socket -- and an unchanged series comes back
 * as the same reference, so a repeated price costs no render.
 */
export function applyTick(
  series: readonly Candle[],
  price: string,
  atMs: number,
  widthSeconds: number,
): readonly Candle[] {
  if (!INTEGER.test(price)) return series;
  const last = series[series.length - 1];

  if (widthSeconds >= DAY) {
    // Never opened here (see above); only the day in hand follows the price.
    if (!last || !wellFormed(last)) return series;
    const next = extended(last, price);
    return same(last, next) ? series : [...series.slice(0, -1), next];
  }

  if (last && wellFormed(last)) {
    const started = Date.parse(last.at);
    const width = widthSeconds * 1000;
    if (!Number.isNaN(started)) {
      if (atMs < started) return series; // older than the open bucket: a skewed clock
      if (atMs < started + width) {
        const next = extended(last, price);
        return same(last, next) ? series : [...series.slice(0, -1), next];
      }
    }
  }
  return [...series, flat(bucketStart(atMs, widthSeconds), price)];
}

/**
 * The next bucket, opened at the last close once the clock has left the
 * current one. The same reference while it has not, which is what lets a
 * once-a-second timer call this without re-rendering the chart each time.
 *
 * Opening it at the last close rather than waiting for a price is what makes
 * the chart move when the market does not: a quiet minute is still a minute,
 * and the previous behaviour -- nothing new until the next tick -- read as
 * the chart having stopped.
 */
export function rollOver(
  series: readonly Candle[],
  atMs: number,
  widthSeconds: number,
): readonly Candle[] {
  if (widthSeconds >= DAY) return series;
  const last = series[series.length - 1];
  if (!last || !wellFormed(last)) return series;
  const started = Date.parse(last.at);
  if (Number.isNaN(started) || atMs < started + widthSeconds * 1000) return series;
  return [...series, flat(bucketStart(atMs, widthSeconds), last.close_price)];
}

/**
 * The server's candles, with whatever this browser has drawn past the end of
 * them. The server wins for any bucket it knows about -- its high and low
 * saw every tick, including the ones a hidden tab missed -- and only the
 * candles opened here after its last one are kept.
 */
export function reconcile(server: readonly Candle[], local: readonly Candle[]): readonly Candle[] {
  const lastServer = server[server.length - 1];
  if (!lastServer) return local;
  const cutoff = Date.parse(lastServer.at);
  if (Number.isNaN(cutoff)) return server;
  const newer = local.filter((candle) => {
    const at = Date.parse(candle.at);
    return !Number.isNaN(at) && at > cutoff;
  });
  return newer.length === 0 ? server : [...server, ...newer];
}
