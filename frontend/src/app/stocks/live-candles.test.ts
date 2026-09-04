import { describe, expect, it } from 'vitest';
import type { Candle } from '@/components/candle-chart';
import { applyTick, bucketStart, reconcile, rollOver } from './live-candles';

const MINUTE = 60;
// 2026-09-04T08:00:00Z, which is on a minute boundary.
const T0 = Date.UTC(2026, 8, 4, 8, 0, 0);

const candle = (atMs: number, o: string, h: string, l: string, c: string): Candle => ({
  at: new Date(atMs).toISOString(),
  open_price: o,
  high_price: h,
  low_price: l,
  close_price: c,
});

describe('bucketStart', () => {
  it('aligns to multiples of the width since the epoch, as stock_candles does', () => {
    expect(bucketStart(T0 + 37_000, MINUTE)).toBe(T0);
    expect(bucketStart(T0 + 4 * 60_000 + 59_999, 300)).toBe(T0);
    expect(bucketStart(T0 + 5 * 60_000, 300)).toBe(T0 + 5 * 60_000);
  });
});

describe('applyTick', () => {
  const open = [candle(T0, '1000', '1000', '1000', '1000')];

  it('stretches the open candle to a price inside its bucket', () => {
    const up = applyTick(open, '1010', T0 + 10_000, MINUTE);
    expect(up).toHaveLength(1);
    expect(up[0]).toMatchObject({ open_price: '1000', high_price: '1010', low_price: '1000', close_price: '1010' });

    // The bug this pins: the high and low were rebuilt from the latest price
    // every tick, so a candle that had been to 1010 forgot it on the way down.
    const down = applyTick(up, '990', T0 + 20_000, MINUTE);
    expect(down[0]).toMatchObject({ open_price: '1000', high_price: '1010', low_price: '990', close_price: '990' });
  });

  it('opens a new candle once the bucket has ended, and keeps the old one', () => {
    const next = applyTick(open, '1005', T0 + 60_000, MINUTE);
    expect(next).toHaveLength(2);
    expect(next[0]).toBe(open[0]);
    expect(next[1]).toMatchObject({
      at: new Date(T0 + 60_000).toISOString(),
      open_price: '1005',
      high_price: '1005',
      low_price: '1005',
      close_price: '1005',
    });
  });

  it('keeps growing, one candle per bucket', () => {
    let series: readonly Candle[] = open;
    for (let minute = 1; minute <= 3; minute += 1) {
      series = applyTick(series, '1000', T0 + minute * 60_000 + 5_000, MINUTE);
    }
    expect(series.map((c) => c.at)).toEqual(
      [0, 1, 2, 3].map((minute) => new Date(T0 + minute * 60_000).toISOString()),
    );
  });

  it('returns the same series for a repeated price, so nothing re-renders', () => {
    expect(applyTick(open, '1000', T0 + 10_000, MINUTE)).toBe(open);
  });

  it('ignores a price that is not a run of digits', () => {
    expect(applyTick(open, '1e3', T0 + 10_000, MINUTE)).toBe(open);
    expect(applyTick(open, '', T0 + 10_000, MINUTE)).toBe(open);
  });

  it('ignores a tick older than the open bucket', () => {
    expect(applyTick(open, '1010', T0 - 1, MINUTE)).toBe(open);
  });

  it('starts a series from nothing at the bucket the clock is in', () => {
    const first = applyTick([], '500', T0 + 30_000, MINUTE);
    expect(first).toHaveLength(1);
    expect(first[0]?.at).toBe(new Date(T0).toISOString());
  });

  it('only brings the day in hand up to the price on a daily chart, never opening one', () => {
    // A day's bucket is aligned to Seoul in SQL; a day opened here would be
    // dated wrong, so the next fetch does that instead.
    const day = [candle(Date.UTC(2026, 8, 3), '1000', '1000', '1000', '1000')];
    const later = applyTick(day, '1100', Date.UTC(2026, 8, 6, 12), 86_400);
    expect(later).toHaveLength(1);
    expect(later[0]).toMatchObject({ high_price: '1100', close_price: '1100' });
  });
});

describe('rollOver', () => {
  const open = [candle(T0, '1000', '1010', '990', '1005')];

  it('does nothing, and allocates nothing, while the bucket is still open', () => {
    expect(rollOver(open, T0 + 59_999, MINUTE)).toBe(open);
  });

  it('opens the next bucket at the last close once the clock leaves this one', () => {
    // The bug this pins: with no price arriving, nothing opened the next
    // candle and the chart read as having stopped.
    const next = rollOver(open, T0 + 60_000, MINUTE);
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({
      at: new Date(T0 + 60_000).toISOString(),
      open_price: '1005',
      high_price: '1005',
      low_price: '1005',
      close_price: '1005',
    });
  });

  it('leaves a daily chart alone', () => {
    const day = [candle(Date.UTC(2026, 8, 3), '1000', '1000', '1000', '1000')];
    expect(rollOver(day, Date.UTC(2026, 8, 6), 86_400)).toBe(day);
  });
});

describe('reconcile', () => {
  const server = [candle(T0, '1000', '1010', '990', '1005'), candle(T0 + 60_000, '1005', '1008', '1001', '1002')];

  it("keeps only the candles opened here after the server's last one", () => {
    const local = [
      candle(T0, '1000', '1000', '1000', '1000'), // the server saw more of this minute
      candle(T0 + 60_000, '1005', '1005', '1005', '1005'),
      candle(T0 + 120_000, '1002', '1003', '1002', '1003'), // not on the server yet
    ];
    const merged = reconcile(server, local);
    expect(merged).toHaveLength(3);
    expect(merged[1]).toBe(server[1]);
    expect(merged[2]).toBe(local[2]);
  });

  it("returns the server's rows untouched when nothing newer was drawn", () => {
    expect(reconcile(server, server.slice(0, 1))).toBe(server);
  });

  it('keeps what was drawn when the server has nothing yet', () => {
    const local = [candle(T0, '1000', '1000', '1000', '1000')];
    expect(reconcile([], local)).toBe(local);
  });
});
