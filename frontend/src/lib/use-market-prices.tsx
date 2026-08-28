'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { LiveRefresh } from '@/components/live-refresh';
import { acquireSiteSocket, releaseSiteSocket } from '@/lib/site-socket';

/**
 * The market, as it moves.
 *
 * The prices change once a second and are the same for everybody, so they
 * arrive as one broadcast on the socket the lobby already runs rather than as
 * a poll per reader per second. What the server sends is only the two numbers
 * that changed; everything else on the page — names, descriptions, the float —
 * is what the server rendered, and stays.
 *
 * It connects to this origin, not to the API: the edge routes `/socket.io/`
 * through, which is what keeps the session a same-origin cookie.
 *
 * The prices live in a store rather than in React state, and that is the
 * whole design. State on the provider meant every broadcast re-rendered the
 * entire subtree — on the market screen that is both tables and every dialog,
 * sixty times a minute, which is enough work to make the page stutter and
 * navigation away from it feel stuck. With a store, a tick wakes only the
 * components reading the stock that actually moved: the snapshot for every
 * other stock is the same object it was, so React bails out before rendering.
 *
 * The slower refresh underneath is for everything the socket does not carry.
 * A trade moves the float and somebody's holdings, and neither is worth a
 * message a second; asking the server again every half minute is.
 */
export interface Quote {
  readonly price: string;
  readonly open: string;
}

interface PricePayload {
  readonly prices?: readonly {
    readonly id?: unknown;
    readonly price?: unknown;
    readonly open?: unknown;
  }[];
}

/** How often to ask the server for what the socket does not send. */
const REFRESH_MS = 30_000;

const INTEGER = /^\d+$/;

class QuoteStore {
  private readonly quotes = new Map<string, Quote>();
  private readonly listeners = new Set<() => void>();
  /** Bumped only when a stock is seen for the first time. */
  private known = 0;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly quote = (stockId: string): Quote | undefined => this.quotes.get(stockId);

  readonly count = (): number => this.known;

  /**
   * Replaces only the stocks whose figures actually changed.
   *
   * Returning the same object for an unchanged stock is what lets
   * `useSyncExternalStore` skip the render — rebuilding the map every tick
   * would hand every reader a new reference and re-render the lot.
   */
  apply(payload: PricePayload): void {
    let moved = false;
    for (const row of payload?.prices ?? []) {
      // The payload crosses a socket, so it is checked rather than trusted: a
      // price that is not a run of digits would reach BigInt() downstream and
      // throw inside a render.
      if (
        typeof row?.id !== 'string' ||
        typeof row.price !== 'string' ||
        typeof row.open !== 'string' ||
        !INTEGER.test(row.price) ||
        !INTEGER.test(row.open)
      ) {
        continue;
      }
      const previous = this.quotes.get(row.id);
      if (previous && previous.price === row.price && previous.open === row.open) continue;
      if (!previous) this.known += 1;
      this.quotes.set(row.id, { price: row.price, open: row.open });
      moved = true;
    }
    if (!moved) return;
    for (const listener of this.listeners) listener();
  }
}

const MarketStore = createContext<QuoteStore | null>(null);

// A subscribe that never fires, for the case where there is no provider above.
const NEVER = (_listener: () => void): (() => void) => () => undefined;

export function MarketPricesProvider({ children }: { readonly children: React.ReactNode }) {
  const [store] = useState(() => new QuoteStore());

  useEffect(() => {
    // The socket the lobby already runs, shared. The prices go to a room
    // rather than to everybody, so this asks to be in it — and asks again
    // after a reconnect, because a reconnect is a new socket with no rooms.
    const socket = acquireSiteSocket();
    const apply = (payload: PricePayload) => store.apply(payload);
    const subscribe = () => socket.emit('market:subscribe');

    socket.on('market:prices', apply);
    socket.on('connect', subscribe);
    if (socket.connected) subscribe();

    return () => {
      socket.off('market:prices', apply);
      socket.off('connect', subscribe);
      // Only the room is left. The socket is shared, and the lobby on the
      // same page is still using it.
      if (socket.connected) socket.emit('market:unsubscribe');
      releaseSiteSocket();
    };
  }, [store]);

  return (
    <MarketStore.Provider value={store}>
      {/* Everything the socket does not carry: the float, holdings, the trade
          history. None of it is worth a message a second; all of it is worth
          asking about every half minute. */}
      <LiveRefresh everyMs={REFRESH_MS} />
      {children}
    </MarketStore.Provider>
  );
}

/**
 * The live quote for one stock, or the one the server rendered.
 *
 * The fallback is what makes this safe to use in a page that must render
 * before any socket exists: the first paint is the server's figure, and the
 * socket only ever replaces it with a newer one. The server snapshot is
 * always undefined, so the server and the first client render agree.
 */
export function useQuote(stockId: string, fallback: Quote): Quote {
  const store = useContext(MarketStore);
  const live = useSyncExternalStore(
    store ? store.subscribe : NEVER,
    () => store?.quote(stockId),
    () => undefined,
  );
  return live ?? fallback;
}

/** Whether a live price has arrived at all, for the "실시간" marker. */
export function useMarketConnected(): boolean {
  const store = useContext(MarketStore);
  const known = useSyncExternalStore(
    store ? store.subscribe : NEVER,
    () => store?.count() ?? 0,
    () => 0,
  );
  return known > 0;
}
