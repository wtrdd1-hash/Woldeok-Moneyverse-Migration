import { Injectable } from '@nestjs/common';
import type {
  StockCandleRow,
  StockCorporateActionInput,
  StockCorporateActionResultRow,
  StockCreateInput,
  StockCreateResultRow,
  StockHistoryRow,
  StockPortfolioRow,
  StockMarketRow,
  StockPriceHistoryRow,
  StockRangeRow,
  StockRow,
  StockTradeInput,
  StockTradeResultRow,
  StockUpdateInput,
  StockUpdateResultRow,
} from './stock.repository';

// StockService adds no validation of its own — every check lives in
// PostgresStockRepository, which owns the SQL and the money-shaped
// invariants (see postgres-stock-repository.ts). This interface exists so
// the service can be constructed with a test double without importing pg.
export interface StockRepository {
  list(): Promise<readonly StockMarketRow[]>;
  dailyCandles(stockId: unknown, days?: unknown): Promise<readonly StockCandleRow[]>;
  priceRange(stockId: unknown): Promise<StockRangeRow | null>;
  liveTick(): Promise<number>;
  adminList(actorUserId: unknown): Promise<readonly StockRow[]>;
  portfolio(userId: unknown): Promise<readonly StockPortfolioRow[]>;
  history(userId: unknown, limit?: unknown): Promise<readonly StockHistoryRow[]>;
  priceHistory(stockId: unknown, limit?: unknown): Promise<readonly StockPriceHistoryRow[]>;
  trade(input: StockTradeInput): Promise<StockTradeResultRow>;
  create(input: StockCreateInput): Promise<StockCreateResultRow>;
  update(input: StockUpdateInput): Promise<StockUpdateResultRow>;
  corporateAction(input: StockCorporateActionInput): Promise<StockCorporateActionResultRow>;
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

  dailyCandles(stockId: unknown, days?: unknown): Promise<readonly StockCandleRow[]> {
    return this.repository.dailyCandles(stockId, days);
  }

  priceRange(stockId: unknown): Promise<StockRangeRow | null> {
    return this.repository.priceRange(stockId);
  }

  /** One step of the market. The ticker owns the schedule; this owns nothing. */
  liveTick(): Promise<number> {
    return this.repository.liveTick();
  }

  adminList(actorUserId: unknown): Promise<readonly StockRow[]> {
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
}
