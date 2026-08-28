import { describe, expect, it, vi } from 'vitest';
import { MarketTicker } from './market-ticker';

/**
 * The walk lives in SQL. What this owns is the schedule, so what matters here
 * is what happens when a beat arrives at a bad moment.
 */
describe('MarketTicker', () => {
  it('refuses a beat fast enough to outrun the database', () => {
    expect(() => new MarketTicker({ tick: async () => 0, intervalMs: 50 })).toThrow(
      'at least 200ms',
    );
  });

  it('refuses to be built without something to call', () => {
    expect(
      () => new MarketTicker({ tick: undefined as never, intervalMs: 1000 }),
    ).toThrow('a tick function is required');
  });

  it('reports how many stocks moved', async () => {
    const ticker = new MarketTicker({ tick: async () => 3, intervalMs: 1000 });
    await expect(ticker.tickOnce()).resolves.toBe(3);
  });

  /**
   * The important one. A slow tick must drop the beat rather than queue it:
   * a queue is a market that stands still and then applies every missed
   * second at once.
   */
  it('skips a beat rather than running two ticks at once', async () => {
    let release: (() => void) | undefined;
    const inFlight = new Promise<void>((resolve) => {
      release = resolve;
    });
    let calls = 0;
    const ticker = new MarketTicker({
      tick: async () => {
        calls += 1;
        await inFlight;
        return 1;
      },
      intervalMs: 1000,
    });

    const first = ticker.tickOnce();
    await expect(ticker.tickOnce()).resolves.toBe(0);
    expect(calls).toBe(1);
    expect(ticker.skippedBeats).toBe(1);

    release?.();
    await expect(first).resolves.toBe(1);

    // Once the first finishes, the next beat runs normally.
    await expect(ticker.tickOnce()).resolves.toBe(1);
    expect(calls).toBe(2);
  });

  // A market that stops moving beats an API that falls over.
  it('survives a failing tick and keeps the schedule', async () => {
    const seen: unknown[] = [];
    const ticker = new MarketTicker({
      tick: async () => {
        throw new Error('deadlock detected');
      },
      intervalMs: 1000,
      onError: (error) => seen.push(error),
    });
    await expect(ticker.tickOnce()).resolves.toBe(0);
    expect(seen).toHaveLength(1);
    // Not wedged: the failure released the guard.
    await expect(ticker.tickOnce()).resolves.toBe(0);
    expect(seen).toHaveLength(2);
  });

  it('starts once and stops cleanly', () => {
    const tick = vi.fn(async () => 0);
    const ticker = new MarketTicker({ tick, intervalMs: 1000 });
    ticker.start();
    ticker.start();
    ticker.stop();
    ticker.stop();
    expect(tick).not.toHaveBeenCalled();
  });
});
