'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { LiveRefresh } from '@/components/live-refresh';

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
 * The slower refresh underneath it is for everything the socket does not
 * carry. A trade moves the float and somebody's holdings, and neither is worth
 * a message a second; asking the server again every half minute is.
 */
export interface Quote {
  readonly price: string;
  readonly open: string;
}

interface PricePayload {
  readonly prices?: readonly { readonly id?: unknown; readonly price?: unknown; readonly open?: unknown }[];
}

const MarketPrices = createContext<ReadonlyMap<string, Quote> | null>(null);

/** How often to ask the server for what the socket does not send. */
const REFRESH_MS = 30_000;

const INTEGER = /^\d+$/;

export function MarketPricesProvider({ children }: { readonly children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<ReadonlyMap<string, Quote>>(() => new Map());

  useEffect(() => {
    let socket: Socket | null = io({ transports: ['websocket', 'polling'] });

    socket.on('market:prices', (payload: PricePayload) => {
      const next = new Map<string, Quote>();
      for (const row of payload?.prices ?? []) {
        // The payload crosses a socket, so it is checked rather than trusted:
        // a price that is not a run of digits would reach BigInt() downstream
        // and throw inside a render.
        if (
          typeof row?.id === 'string' &&
          typeof row.price === 'string' &&
          typeof row.open === 'string' &&
          INTEGER.test(row.price) &&
          INTEGER.test(row.open)
        ) {
          next.set(row.id, { price: row.price, open: row.open });
        }
      }
      if (next.size > 0) setQuotes(next);
    });

    return () => {
      socket?.close();
      socket = null;
    };
  }, []);

  return (
    <MarketPrices.Provider value={quotes}>
      {/* Everything the socket does not carry: the float, holdings, the trade
          history. None of it is worth a message a second; all of it is worth
          asking about every half minute. */}
      <LiveRefresh everyMs={REFRESH_MS} />
      {children}
    </MarketPrices.Provider>
  );
}

/**
 * The live quote for one stock, or the one the server rendered.
 *
 * The fallback is what makes this safe to use in a page that must render
 * before any socket exists: the first paint is the server's figure, and the
 * socket only ever replaces it with a newer one.
 */
export function useQuote(stockId: string, fallback: Quote): Quote {
  const quotes = useContext(MarketPrices);
  return quotes?.get(stockId) ?? fallback;
}

/** Whether a live price has arrived at all, for the "실시간" marker. */
export function useMarketConnected(): boolean {
  const quotes = useContext(MarketPrices);
  return (quotes?.size ?? 0) > 0;
}
