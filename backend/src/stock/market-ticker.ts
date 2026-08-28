/**
 * Moves the market on a timer.
 *
 * The walk itself is in the database — `stock_market_live_tick` picks a shock
 * per stock, pulls it back toward the day's open, clamps the day's range and
 * keeps the candle. This owns only the schedule, which is why it is a class
 * with a timer and nothing else.
 *
 * Ticks never overlap. A tick that is still running when the next is due
 * skips that beat rather than queueing, because a queue of ticks is a market
 * that keeps moving after everyone has stopped watching and then applies an
 * afternoon of movement in one second.
 */
export interface MarketTickerOptions {
  /** Returns how many stocks moved. Zero when another process holds the lock. */
  readonly tick: () => Promise<number>;
  readonly intervalMs: number;
  readonly onError?: (error: unknown) => void;
}

export class MarketTicker {
  private readonly options: MarketTickerOptions;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private skipped = 0;

  constructor(options: MarketTickerOptions) {
    if (typeof options.tick !== 'function') throw new TypeError('a tick function is required');
    if (options.intervalMs < 200) throw new TypeError('interval must be at least 200ms');
    this.options = options;
  }

  /** How many beats were dropped because the previous tick was still running. */
  get skippedBeats(): number {
    return this.skipped;
  }

  async tickOnce(): Promise<number> {
    if (this.running) {
      this.skipped += 1;
      return 0;
    }
    this.running = true;
    try {
      return await this.options.tick();
    } catch (error: unknown) {
      // A market that stops moving is better than an API that falls over. The
      // next beat tries again.
      this.options.onError?.(error);
      return 0;
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tickOnce(), this.options.intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
