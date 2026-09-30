import { Injectable } from '@nestjs/common';
import type {
  StockAdminRow,
  StockCorporateActionInput,
  StockCorporateActionResultRow,
  StockCreateInput,
  StockDynamicsRow,
  StockHaltResultRow,
  StockHaltSettlementReceiptRow,
  StockHaltSettlementStatusRow,
  StockMarketEventAdminRow,
  StockMarketEventCancelInput,
  StockMarketEventPublishInput,
  StockMarketEventReceipt,
  StockMarketEventRow,
  StockCreateResultRow,
  StockDeleteInput,
  StockHistoryRow,
  StockIntervalCandleRow,
  StockPortfolioRow,
  StockMarketRow,
  StockPriceHistoryRow,
  StockRangeRow,
  StockSetPriceInput,
  StockSparkSeriesRow,
  StockTradeInput,
  StockTradeResultRow,
  StockUpdateInput,
  StockUpdateResultRow,
  StockWatchlistRow,
} from './stock.repository';
import type { LivePriceRow } from './market-broadcast';

// StockService adds no validation of its own — every check lives in
// PostgresStockRepository, which owns the SQL and the money-shaped
// invariants (see postgres-stock-repository.ts). This interface exists so
// the service can be constructed with a test double without importing pg.
export interface StockRepository {
  list(): Promise<readonly StockMarketRow[]>;
  candles(
    stockId: unknown,
    bucketSeconds: unknown,
    limit?: unknown,
  ): Promise<readonly StockIntervalCandleRow[]>;
  priceRange(stockId: unknown): Promise<StockRangeRow | null>;
  livePrices(): Promise<readonly LivePriceRow[]>;
  liveTick(): Promise<number>;
  adminList(actorUserId: unknown): Promise<readonly StockAdminRow[]>;
  watchlist(userId: unknown): Promise<readonly StockWatchlistRow[]>;
  setWatchlist(userId: unknown, stockId: unknown, watching: unknown): Promise<{ readonly watching: boolean }>;
  portfolio(userId: unknown): Promise<readonly StockPortfolioRow[]>;
  history(userId: unknown, limit?: unknown): Promise<readonly StockHistoryRow[]>;
  priceHistory(stockId: unknown, limit?: unknown): Promise<readonly StockPriceHistoryRow[]>;
  sparkSeries(limit?: unknown): Promise<readonly StockSparkSeriesRow[]>;
  trade(input: StockTradeInput): Promise<StockTradeResultRow>;
  create(input: StockCreateInput): Promise<StockCreateResultRow>;
  update(input: StockUpdateInput): Promise<StockUpdateResultRow>;
  corporateAction(input: StockCorporateActionInput): Promise<StockCorporateActionResultRow>;
  setPrice(input: StockSetPriceInput): Promise<{ readonly price: string }>;
  remove(input: StockDeleteInput): Promise<{ readonly deleted: boolean }>;
  marketEvents(): Promise<readonly StockMarketEventRow[]>;
  adminMarketEvents(actorUserId: unknown, limit?: unknown): Promise<readonly StockMarketEventAdminRow[]>;
  adminDynamics(actorUserId: unknown): Promise<readonly StockDynamicsRow[]>;
  publishMarketEvent(input: StockMarketEventPublishInput): Promise<StockMarketEventReceipt>;
  cancelMarketEvent(input: StockMarketEventCancelInput): Promise<{ readonly cancelled: boolean }>;
  halt(actorUserId: unknown, stockId: unknown, haltEventId?: unknown): Promise<StockHaltResultRow>;
  haltSettlementStatus(actorUserId: unknown, stockId: unknown): Promise<StockHaltSettlementStatusRow>;
  haltSettlementReceipts(userId: unknown): Promise<readonly StockHaltSettlementReceiptRow[]>;
}

import { MarketBroadcast } from './market-broadcast';

@Injectable()
export class StockService {
  readonly repository: StockRepository;
  readonly broadcast?: MarketBroadcast | undefined;

  constructor(repository: StockRepository, broadcast?: MarketBroadcast | undefined) {
    this.repository = repository;
    this.broadcast = broadcast;
  }

  list(): Promise<readonly StockMarketRow[]> {
    return this.repository.list();
  }

  candles(
    stockId: unknown,
    bucketSeconds: unknown,
    limit?: unknown,
  ): Promise<readonly StockIntervalCandleRow[]> {
    return this.repository.candles(stockId, bucketSeconds, limit);
  }

  priceRange(stockId: unknown): Promise<StockRangeRow | null> {
    return this.repository.priceRange(stockId);
  }

  livePrices(): Promise<readonly LivePriceRow[]> {
    return this.repository.livePrices();
  }

  /** One step of the market. The ticker owns the schedule; this owns nothing. */
  liveTick(): Promise<number> {
    return this.repository.liveTick();
  }

  adminList(actorUserId: unknown): Promise<readonly StockAdminRow[]> {
    return this.repository.adminList(actorUserId);
  }

  watchlist(userId: unknown): Promise<readonly StockWatchlistRow[]> {
    return this.repository.watchlist(userId);
  }

  setWatchlist(userId: unknown, stockId: unknown, watching: unknown): Promise<{ readonly watching: boolean }> {
    return this.repository.setWatchlist(userId, stockId, watching);
  }

  portfolio(userId: unknown): Promise<readonly StockPortfolioRow[]> {
    return this.repository.portfolio(userId);
  }

  history(userId: unknown, limit?: unknown): Promise<readonly StockHistoryRow[]> {
    return this.repository.history(userId, limit);
  }

  priceHistory(stockId: unknown, limit?: unknown): Promise<readonly StockPriceHistoryRow[]> {
    return this.repository.priceHistory(stockId, limit);
  }

  /** Every listed stock's preview series, for the market screen's cards. */
  sparkSeries(limit?: unknown): Promise<readonly StockSparkSeriesRow[]> {
    return this.repository.sparkSeries(limit);
  }

  async trade(input: StockTradeInput): Promise<StockTradeResultRow> {
    const result = await this.repository.trade(input);
    if (this.broadcast && result) {
      try {
        const side = String(input.side).toLowerCase() === 'sell' ? 'SELL' : 'BUY';
        const quantity = Number(input.quantity) || 0;
        this.broadcast.publishTrade({
          id: result.trade_id || `tr_${Date.now()}`,
          stockId: String(input.stockId),
          price: String(result.unit_price ?? result.current_price ?? '0'),
          quantity,
          side,
          timestamp: new Date().toISOString(),
        });

        if (input.userId) {
          const actionText = side === 'SELL' ? '매도' : '매수';
          this.broadcast.publishUserNotification(String(input.userId), {
            id: `notif_${Date.now()}`,
            title: '주식 주문 체결 완료',
            message: `${actionText} 주문이 정상 체결되었습니다. (수량: ${quantity}주)`,
            type: 'success',
            href: `/stocks/${input.stockId}`,
          });
        }
      } catch {
        // Broadcast failure should never fail the database transaction
      }
    }
    return result;
  }

  create(input: StockCreateInput): Promise<StockCreateResultRow> {
    return this.repository.create(input);
  }

  update(input: StockUpdateInput): Promise<StockUpdateResultRow> {
    return this.repository.update(input);
  }

  corporateAction(input: StockCorporateActionInput): Promise<StockCorporateActionResultRow> {
    return this.repository.corporateAction(input);
  }

  setPrice(input: StockSetPriceInput): Promise<{ readonly price: string }> {
    return this.repository.setPrice(input);
  }

  remove(input: StockDeleteInput): Promise<{ readonly deleted: boolean }> {
    return this.repository.remove(input);
  }

  /** The news that is running (124). */
  marketEvents(): Promise<readonly StockMarketEventRow[]> {
    return this.repository.marketEvents();
  }

  adminMarketEvents(actorUserId: unknown, limit?: unknown): Promise<readonly StockMarketEventAdminRow[]> {
    return this.repository.adminMarketEvents(actorUserId, limit);
  }

  adminDynamics(actorUserId: unknown): Promise<readonly StockDynamicsRow[]> {
    return this.repository.adminDynamics(actorUserId);
  }

  publishMarketEvent(input: StockMarketEventPublishInput): Promise<StockMarketEventReceipt> {
    return this.repository.publishMarketEvent(input);
  }

  cancelMarketEvent(input: StockMarketEventCancelInput): Promise<{ readonly cancelled: boolean }> {
    return this.repository.cancelMarketEvent(input);
  }

  halt(actorUserId: unknown, stockId: unknown, haltEventId?: unknown): Promise<StockHaltResultRow> {
    return this.repository.halt(actorUserId, stockId, haltEventId);
  }

  haltSettlementStatus(actorUserId: unknown, stockId: unknown): Promise<StockHaltSettlementStatusRow> {
    return this.repository.haltSettlementStatus(actorUserId, stockId);
  }

  haltSettlementReceipts(userId: unknown): Promise<readonly StockHaltSettlementReceiptRow[]> {
    return this.repository.haltSettlementReceipts(userId);
  }
}

