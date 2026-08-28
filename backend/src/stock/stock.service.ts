import { Injectable } from '@nestjs/common';
import type {
  StockAdminRow,
  StockCorporateActionInput,
  StockCorporateActionResultRow,
  StockCreateInput,
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
}

@Injectable()
export class StockService {
  readonly repository: StockRepository;

  constructor(repository: StockRepository) {
    this.repository = repository;
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

  trade(input: StockTradeInput): Promise<StockTradeResultRow> {
    return this.repository.trade(input);
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
}
