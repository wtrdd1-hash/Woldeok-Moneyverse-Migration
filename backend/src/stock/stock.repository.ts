import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { WldAmount } from '@moneyverse/contract';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Number.isSafeInteger(value) alone does not narrow `value: unknown` to
// `number` (it has no type predicate), so the `typeof` check is required to
// let TypeScript treat the comparisons after this guard as safe; it does not
// change which values pass, since isSafeInteger already rejects anything
// that is not a number.
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const uuid = (value: unknown, name: string): string => {
  if (typeof value !== 'string' || !UUID.test(value)) throw new Error(`${name} must be a UUID`);
  return value;
};

export class StockInputError extends Error {}

// Raw rows from public.virtual_stocks (see migrations
// 023-virtual-stock-game.sql and 034-virtual-stock-price-history.sql).
// current_price/day_open_price are bigint columns cast to text and are WLD
// amounts, so they are branded WldAmount here rather than left as plain
// strings.
export interface StockRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly current_price: WldAmount;
  readonly day_open_price: WldAmount;
  readonly active: boolean;
  readonly updated_at: Date;
}

// virtual_stock_positions joined with virtual_stocks (see migration
// 023-virtual-stock-game.sql). quantity is a share count, not money, so it
// stays a plain string like season's points/entries tallies; average_cost,
// market_value and current_price are WLD amounts.
export interface StockPortfolioRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: string;
  readonly average_cost: WldAmount;
  readonly market_value: WldAmount;
  readonly current_price: WldAmount;
}

// virtual_stock_trades joined with virtual_stocks (see migration
// 023-virtual-stock-game.sql). quantity is a share count; unit_price,
// gross_amount and tax_amount are WLD amounts.
export interface StockHistoryRow {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly unit_price: WldAmount;
  readonly gross_amount: WldAmount;
  readonly tax_amount: WldAmount;
  readonly created_at: Date;
}

// public.stock_price_history() (see migration
// 034-virtual-stock-price-history.sql). price is a bigint WLD amount.
export interface StockPriceHistoryRow {
  readonly recorded_at: Date;
  readonly price: WldAmount;
}

// public.stock_trade() (see migrations 024/032/033-virtual-stock-*.sql).
// unit_price/gross_amount/tax_amount/current_price are all WLD amounts.
export interface StockTradeResultRow {
  readonly trade_id: string;
  readonly unit_price: WldAmount;
  readonly gross_amount: WldAmount;
  readonly tax_amount: WldAmount;
  readonly current_price: WldAmount;
}

export interface StockCreateResultRow {
  readonly id: string;
}

export interface StockUpdateResultRow {
  readonly changed: boolean;
}

// public.stock_admin_corporate_action() (see migration
// 040-virtual-stock-corporate-actions.sql).
export interface StockCorporateActionResultRow {
  readonly corporate_action_id: string;
  readonly replayed: boolean;
}

// Every input below arrives as parsed JSON from an HTTP body (see
// src/server.js), so fields are `unknown` and re-validated exactly as the
// pre-conversion code did — this file adds types, not new checks.
export interface StockTradeInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly side: unknown;
  readonly quantity: unknown;
  readonly idempotencyKey?: unknown;
}

export interface StockCreateInput {
  readonly userId: unknown;
  readonly symbol: unknown;
  readonly name: unknown;
  readonly description?: unknown;
  readonly price: unknown;
}

export interface StockUpdateInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly active?: unknown;
}

export interface StockCorporateActionInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly action: unknown;
  readonly factor: unknown;
  readonly idempotencyKey?: unknown;
}

@Injectable()
export class PostgresStockRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async list(): Promise<readonly StockRow[]> {
    return queryRows<StockRow>(
      this.pool,
      'SELECT id::text, symbol, name, description, current_price::text AS current_price, day_open_price::text AS day_open_price, active, updated_at FROM public.virtual_stocks WHERE active ORDER BY symbol',
    );
  }

  async adminList(): Promise<readonly StockRow[]> {
    return queryRows<StockRow>(
      this.pool,
      'SELECT id::text, symbol, name, description, current_price::text AS current_price, day_open_price::text AS day_open_price, active, updated_at FROM public.virtual_stocks ORDER BY active DESC, symbol',
    );
  }

  // These methods are deliberately declared `async` even though they could
  // just return the query promise directly: `uuid()` below throws
  // synchronously, and only an `async` function turns that into a rejected
  // promise. A plain function that throws before returning one instead
  // throws synchronously at the call site, which `assert.rejects()` (and
  // any caller expecting a rejected promise) does not catch.
  async portfolio(userId: unknown): Promise<readonly StockPortfolioRow[]> {
    uuid(userId, 'user id');
    return queryRows<StockPortfolioRow>(
      this.pool,
      'SELECT p.stock_id::text, s.symbol, s.name, p.quantity::text, p.average_cost::text, (p.quantity*s.current_price)::text AS market_value, s.current_price::text FROM public.virtual_stock_positions p JOIN public.virtual_stocks s ON s.id=p.stock_id WHERE p.user_id=$1 AND p.quantity>0 ORDER BY s.symbol',
      [userId],
    );
  }

  async history(userId: unknown, limit: unknown = 50): Promise<readonly StockHistoryRow[]> {
    uuid(userId, 'user id');
    const n = typeof limit === 'number' && Number.isSafeInteger(limit) ? Math.min(100, Math.max(1, limit)) : 50;
    return queryRows<StockHistoryRow>(
      this.pool,
      'SELECT t.id::text AS trade_id,s.symbol,t.side,t.quantity::text,t.unit_price::text,t.gross_amount::text,t.tax_amount::text,t.created_at FROM public.virtual_stock_trades t JOIN public.virtual_stocks s ON s.id=t.stock_id WHERE t.user_id=$1 ORDER BY t.created_at DESC LIMIT $2',
      [userId, n],
    );
  }

  async priceHistory(stockId: unknown, limit: unknown = 80): Promise<readonly StockPriceHistoryRow[]> {
    uuid(stockId, 'stock id');
    const n = typeof limit === 'number' && Number.isSafeInteger(limit) ? Math.min(240, Math.max(1, limit)) : 80;
    return queryRows<StockPriceHistoryRow>(
      this.pool,
      'SELECT recorded_at, price::text AS price FROM public.stock_price_history($1,$2)',
      [stockId, n],
    );
  }

  async trade({ userId, stockId, side, quantity, idempotencyKey = randomUUID() }: StockTradeInput): Promise<StockTradeResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    if ((side !== 'buy' && side !== 'sell') || !positive(quantity)) throw new StockInputError('invalid stock trade');
    const row = await queryOne<StockTradeResultRow>(
      this.pool,
      'SELECT trade_id::text, unit_price::text, gross_amount::text, tax_amount::text, current_price::text FROM public.stock_trade($1,$2,$3,$4,$5)',
      [idempotencyKey, userId, stockId, side, quantity],
    );
    // public.stock_trade() always returns exactly one row (a fresh trade or
    // the original idempotent replay); the pre-conversion code trusted that
    // and returned `rows[0]` unchecked, so a database anomaly would have
    // silently resolved to `undefined` instead of failing loudly.
    if (!row) throw new Error('database did not return a trade receipt');
    return row;
  }

  async create({ userId, symbol, name, description = '', price }: StockCreateInput): Promise<StockCreateResultRow> {
    uuid(userId, 'user id');
    if (typeof symbol !== 'string' || !/^[A-Z][A-Z0-9]{1,7}$/.test(symbol) || typeof name !== 'string' || !positive(price)) {
      throw new StockInputError('invalid stock');
    }
    const row = await queryOne<StockCreateResultRow>(
      this.pool,
      'SELECT public.stock_admin_create($1,$2,$3,$4,$5)::text AS id',
      [userId, symbol, name, description, price],
    );
    if (!row) throw new Error('database did not return a new stock id');
    return row;
  }

  async update({ userId, stockId, name = null, description = null, active = null }: StockUpdateInput): Promise<StockUpdateResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    if (name !== null && (typeof name !== 'string' || !name.trim() || name.length > 80)) throw new StockInputError('invalid stock name');
    if (description !== null && (typeof description !== 'string' || description.length > 500)) throw new StockInputError('invalid stock description');
    if (active !== null && typeof active !== 'boolean') throw new StockInputError('invalid stock active value');
    if (name === null && description === null && active === null) throw new StockInputError('stock change required');
    const row = await queryOne<StockUpdateResultRow>(
      this.pool,
      'SELECT public.stock_admin_update($1,$2,$3,$4,$5) AS changed',
      [userId, stockId, name, description, active],
    );
    return row ?? { changed: false };
  }

  async corporateAction({ userId, stockId, action, factor, idempotencyKey = randomUUID() }: StockCorporateActionInput): Promise<StockCorporateActionResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    if (
      (action !== 'split' && action !== 'reverse_split')
      || typeof factor !== 'number'
      || !Number.isSafeInteger(factor)
      || factor < 2
      || factor > 100
    ) {
      throw new StockInputError('invalid stock corporate action');
    }
    const row = await queryOne<StockCorporateActionResultRow>(
      this.pool,
      'SELECT corporate_action_id::text,replayed FROM public.stock_admin_corporate_action($1,$2,$3,$4,$5)',
      [idempotencyKey, userId, stockId, action, factor],
    );
    if (!row?.corporate_action_id || typeof row.replayed !== 'boolean') throw new Error('database did not return a corporate-action receipt');
    return row;
  }
}
