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

export interface LiveOrderbookDepth {
  readonly price: string;
  readonly quantity: number;
  readonly total: string;
}

export interface LiveOrderbookData {
  readonly stockId: string;
  readonly bids: readonly LiveOrderbookDepth[];
  readonly asks: readonly LiveOrderbookDepth[];
  readonly spreadBps: number;
  readonly buyRatio: number;
  readonly sellRatio: number;
  readonly updatedAt?: string;
}

export interface LiveTradeData {
  readonly id: string;
  readonly stockId: string;
  readonly price: string;
  readonly quantity: number;
  readonly side: 'BUY' | 'SELL';
  readonly timestamp: string;
}

class OrderbookStore {
  private readonly books = new Map<string, LiveOrderbookData>();
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly get = (stockId: string): LiveOrderbookData | undefined => this.books.get(stockId);

  apply(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const data = payload as LiveOrderbookData;
    if (!data.stockId || !Array.isArray(data.bids) || !Array.isArray(data.asks)) return;

    this.books.set(data.stockId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    for (const listener of this.listeners) listener();
  }
}

class TradeFeedStore {
  private readonly trades = new Map<string, readonly LiveTradeData[]>();
  private readonly listeners = new Set<() => void>();

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly get = (stockId: string): readonly LiveTradeData[] => this.trades.get(stockId) ?? [];

  apply(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const trade = payload as LiveTradeData;
    if (!trade.stockId || !trade.price) return;

    const current = this.trades.get(trade.stockId) ?? [];
    const next = [trade, ...current.slice(0, 49)];
    this.trades.set(trade.stockId, next);
    for (const listener of this.listeners) listener();
  }
}

const globalOrderbookStore = new OrderbookStore();
const globalTradeStore = new TradeFeedStore();

export function MarketPricesProvider({ children }: { readonly children: React.ReactNode }) {
  const [store] = useState(() => new QuoteStore());

  useEffect(() => {
    const socket = acquireSiteSocket();
    const apply = (payload: PricePayload) => store.apply(payload);
    const applyOrderbook = (payload: unknown) => globalOrderbookStore.apply(payload);
    const applyTrade = (payload: unknown) => globalTradeStore.apply(payload);
    const subscribe = () => socket.emit('market:subscribe');

    socket.on('market:prices', apply);
    socket.on('stock:orderbook', applyOrderbook);
    socket.on('stock:trade', applyTrade);
    socket.on('connect', subscribe);
    if (socket.connected) subscribe();

    return () => {
      socket.off('market:prices', apply);
      socket.off('stock:orderbook', applyOrderbook);
      socket.off('stock:trade', applyTrade);
      socket.off('connect', subscribe);
      if (socket.connected) socket.emit('market:unsubscribe');
      releaseSiteSocket();
    };
  }, [store]);

  return (
    <MarketStore.Provider value={store}>
      <LiveRefresh everyMs={REFRESH_MS} />
      {children}
    </MarketStore.Provider>
  );
}

/**
 * The live quote for one stock, or the one the server rendered.
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

/**
 * Live 5D/10D Orderbook hook with useSyncExternalStore isolation.
 */
export function useOrderbook(stockId: string, fallback?: LiveOrderbookData): LiveOrderbookData | undefined {
  useEffect(() => {
    if (!stockId) return;
    const socket = acquireSiteSocket();
    socket.emit('orderbook:subscribe', stockId);
    return () => {
      if (socket.connected) socket.emit('orderbook:unsubscribe', stockId);
      releaseSiteSocket();
    };
  }, [stockId]);

  const live = useSyncExternalStore(
    globalOrderbookStore.subscribe,
    () => globalOrderbookStore.get(stockId),
    () => undefined,
  );
  return live ?? fallback;
}

/**
 * Live Trade execution stream for one stock.
 */
export function useStockTrades(stockId: string): readonly LiveTradeData[] {
  useEffect(() => {
    if (!stockId) return;
    const socket = acquireSiteSocket();
    socket.emit('stock:subscribe', stockId);
    return () => {
      if (socket.connected) socket.emit('stock:unsubscribe', stockId);
      releaseSiteSocket();
    };
  }, [stockId]);

  return useSyncExternalStore(
    globalTradeStore.subscribe,
    () => globalTradeStore.get(stockId),
    () => [],
  );
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
