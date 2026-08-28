/**
 * The market's once-a-second push.
 *
 * The prices are the same for everybody, so they go out as one broadcast
 * rather than as one poll per reader per second. That is the whole reason
 * this exists: a market that moves every second and a page that polls it is
 * a page that asks the same question sixty times a minute and is told the
 * same thing fifty-nine of them.
 *
 * The socket server is created outside Nest — the lobby attaches it to the
 * HTTP listener after the routes are configured — so this is the seam between
 * the two. It holds a function, not a server, which is also what makes the
 * ticker testable without one.
 *
 * Only prices travel. The float moves only when somebody trades, and the
 * names and descriptions never do, so a reader keeps what the page loaded
 * with and this carries the two numbers that changed.
 */
export type MarketEmit = (event: string, payload: unknown) => void;

export const MARKET_PRICES_EVENT = 'market:prices';

export interface LivePriceRow {
  readonly id: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

export class MarketBroadcast {
  private emit: MarketEmit | null = null;
  private listening: () => boolean = () => false;

  /** Called once, from the bootstrap that owns the socket server. */
  attach(emit: MarketEmit, hasListeners: () => boolean): void {
    this.emit = emit;
    this.listening = hasListeners;
  }

  /**
   * Whether it is worth reading the prices at all.
   *
   * The ticker asks before querying, so a deployment nobody is watching pays
   * for the walk and nothing else.
   */
  get shouldPublish(): boolean {
    return this.emit !== null && this.listening();
  }

  publish(prices: readonly LivePriceRow[]): void {
    if (!this.emit || prices.length === 0) return;
    this.emit(MARKET_PRICES_EVENT, {
      prices: prices.map((row) => ({
        id: row.id,
        price: row.current_price,
        open: row.day_open_price,
      })),
    });
  }
}
