/**
 * High-Performance Multi-Room Realtime Broadcasting Engine.
 *
 * Provides:
 * 1. Market 1-second price ticks (`market:prices` in room `market`)
 * 2. 150ms Batched Orderbook depth ticks (`stock:orderbook` in room `orderbook:{stockId}`)
 * 3. Trade execution feed (`stock:trade` in room `stock:{stockId}`)
 * 4. User private wallet & push notifications (`wallet:balance`, `notification:push` in room `user:{userId}`)
 * 5. Admin control tower live metrics (`admin:stats`, `admin:alert` in room `admin:control-tower`)
 */
export type MarketEmit = (event: string, payload: unknown) => void;
export type RoomEmit = (room: string, event: string, payload: unknown) => void;

export const MARKET_PRICES_EVENT = 'market:prices';
export const STOCK_ORDERBOOK_EVENT = 'stock:orderbook';
export const STOCK_TRADE_EVENT = 'stock:trade';
export const WALLET_BALANCE_EVENT = 'wallet:balance';
export const NOTIFICATION_PUSH_EVENT = 'notification:push';
export const ADMIN_STATS_EVENT = 'admin:stats';

/** Standard Rooms */
export const MARKET_ROOM = 'market';
export const ADMIN_CONTROL_TOWER_ROOM = 'admin:control-tower';

export const MARKET_SUBSCRIBE_EVENT = 'market:subscribe';
export const MARKET_UNSUBSCRIBE_EVENT = 'market:unsubscribe';
export const ORDERBOOK_SUBSCRIBE_EVENT = 'orderbook:subscribe';
export const ORDERBOOK_UNSUBSCRIBE_EVENT = 'orderbook:unsubscribe';
export const STOCK_SUBSCRIBE_EVENT = 'stock:subscribe';
export const STOCK_UNSUBSCRIBE_EVENT = 'stock:unsubscribe';

export interface LivePriceRow {
  readonly id: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

export interface OrderbookDepthEntry {
  readonly price: string;
  readonly quantity: number;
  readonly total: string;
}

export interface LiveOrderbookPayload {
  readonly stockId: string;
  readonly bids: readonly OrderbookDepthEntry[];
  readonly asks: readonly OrderbookDepthEntry[];
  readonly spreadBps: number;
  readonly buyRatio: number;
  readonly sellRatio: number;
}

export interface LiveTradePayload {
  readonly id: string;
  readonly stockId: string;
  readonly price: string;
  readonly quantity: number;
  readonly side: 'BUY' | 'SELL';
  readonly timestamp: string;
}

export interface LiveWalletPayload {
  readonly userId: string;
  readonly wldBalance: number;
  readonly availableWld: number;
  readonly lockedInStocksWld?: number;
  readonly lockedInDerivativesWld?: number;
  readonly totalNetWorthWld: number;
  readonly lastUpdated: string;
}

export class MarketBroadcast {
  private emit: MarketEmit | null = null;
  private roomEmit: RoomEmit | null = null;
  private listening: () => boolean = () => false;
  private roomListening: (room: string) => boolean = () => false;
  private currentSequence = 0;

  // 150ms Orderbook Coalescing Buffer
  private orderbookBuffer = new Map<string, LiveOrderbookPayload>();
  private orderbookTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_WINDOW_MS = 150;

  /** Called once, from the bootstrap that owns the socket server. */
  attach(
    emit: MarketEmit,
    hasListeners: () => boolean,
    roomEmit?: RoomEmit,
    hasRoomListeners?: (room: string) => boolean,
  ): void {
    this.emit = emit;
    this.listening = hasListeners;
    if (roomEmit) this.roomEmit = roomEmit;
    if (hasRoomListeners) this.roomListening = hasRoomListeners;
  }

  /** Current monotonic broadcast sequence number. */
  get sequence(): number {
    return this.currentSequence;
  }

  resetSequence(): void {
    this.currentSequence = 0;
  }

  get shouldPublish(): boolean {
    return this.emit !== null && this.listening();
  }

  shouldPublishRoom(room: string): boolean {
    return this.roomEmit !== null && this.roomListening(room);
  }

  publish(prices: readonly LivePriceRow[]): void {
    if (!this.emit || prices.length === 0) return;
    this.currentSequence += 1;
    this.emit(MARKET_PRICES_EVENT, {
      sequence: this.currentSequence,
      prices: prices.map((row) => ({
        id: row.id,
        price: row.current_price,
        open: row.day_open_price,
      })),
    });
  }

  /**
   * 150ms Coalesced Orderbook Publisher.
   * Batches high-frequency orderbook changes to prevent React render jank.
   */
  publishOrderbook(payload: LiveOrderbookPayload): void {
    if (!this.roomEmit) return;
    const room = `orderbook:${payload.stockId}`;
    if (!this.roomListening(room)) return;

    this.orderbookBuffer.set(payload.stockId, payload);
    if (!this.orderbookTimer) {
      this.orderbookTimer = setTimeout(() => {
        this.flushOrderbookBuffer();
      }, this.BATCH_WINDOW_MS);
    }
  }

  private flushOrderbookBuffer(): void {
    this.orderbookTimer = null;
    if (!this.roomEmit) {
      this.orderbookBuffer.clear();
      return;
    }

    for (const [stockId, payload] of this.orderbookBuffer.entries()) {
      const room = `orderbook:${stockId}`;
      this.currentSequence += 1;
      this.roomEmit(room, STOCK_ORDERBOOK_EVENT, {
        sequence: this.currentSequence,
        ...payload,
      });
    }
    this.orderbookBuffer.clear();
  }

  /**
   * Immediate Trade Execution Stream.
   */
  publishTrade(payload: LiveTradePayload): void {
    if (!this.roomEmit) return;
    const room = `stock:${payload.stockId}`;
    this.currentSequence += 1;
    this.roomEmit(room, STOCK_TRADE_EVENT, {
      sequence: this.currentSequence,
      ...payload,
    });
  }

  /**
   * Targeted User Wallet & Balance Update.
   */
  publishUserWallet(payload: LiveWalletPayload): void {
    if (!this.roomEmit) return;
    const room = `user:${payload.userId}`;
    this.currentSequence += 1;
    this.roomEmit(room, WALLET_BALANCE_EVENT, {
      sequence: this.currentSequence,
      ...payload,
    });
  }

  /**
   * Targeted User In-App Push Notification.
   */
  publishUserNotification(userId: string, notification: {
    readonly id: string;
    readonly title: string;
    readonly message: string;
    readonly type?: 'info' | 'success' | 'warning' | 'alert';
    readonly href?: string;
  }): void {
    if (!this.roomEmit) return;
    const room = `user:${userId}`;
    this.currentSequence += 1;
    this.roomEmit(room, NOTIFICATION_PUSH_EVENT, {
      sequence: this.currentSequence,
      ...notification,
      sentAt: new Date().toISOString(),
    });
  }

  /**
   * Admin Control Tower Realtime Metrics Stream.
   */
  publishAdminStats(stats: Record<string, unknown>): void {
    if (!this.roomEmit) return;
    this.currentSequence += 1;
    this.roomEmit(ADMIN_CONTROL_TOWER_ROOM, ADMIN_STATS_EVENT, {
      sequence: this.currentSequence,
      stats,
      timestamp: new Date().toISOString(),
    });
  }
}

