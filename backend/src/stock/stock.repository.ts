import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { WldAmount } from '@moneyverse/contract';
import type { LivePriceRow } from './market-broadcast';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Number.isSafeInteger(value) alone does not narrow `value: unknown` to
// `number` (it has no type predicate), so the `typeof` check is required to
// let TypeScript treat the comparisons after this guard as safe; it does not
// change which values pass, since isSafeInteger already rejects anything
// that is not a number.
const positive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
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

/**
 * Share counts (053). Not money — a share is a unit, not an amount — so these
 * stay plain strings the way portfolio quantities do, rather than being
 * branded WldAmount. They are still strings rather than numbers because
 * `shares_outstanding` is a bigint and a billion million shares is past what a
 * double can count exactly.
 */
export interface StockFloat {
  readonly shares_outstanding: string;
  readonly shares_available: string;
}

/** A market row: StockRow plus the day's range and the float. */
export interface StockMarketRow extends Omit<StockRow, 'active'>, StockFloat {
  readonly day_high_price: WldAmount;
  readonly day_low_price: WldAmount;
}

/**
 * The console's row. `holders` and `trades` are what decide whether a stock
 * can be deleted, so they travel with it rather than being discovered by
 * pressing the button.
 */
export interface StockAdminRow extends StockRow, StockFloat {
  readonly holders: number;
  readonly trades: number;
}

/**
 * One candle at whichever width was asked for (053). `bucket_at` is the start
 * of the bucket, so a caller can place it on an axis without knowing how wide
 * it was.
 */
export interface StockIntervalCandleRow {
  readonly bucket_at: Date;
  readonly open_price: WldAmount;
  readonly high_price: WldAmount;
  readonly low_price: WldAmount;
  readonly close_price: WldAmount;
}

/**
 * The widths `stock_candles` accepts, in seconds. Anything else is refused by
 * the function, so the list is repeated here to refuse it a round trip
 * earlier and to give the route something to validate against.
 */
export const CANDLE_INTERVALS = [60, 300, 1800, 3600, 7200, 14400, 86400, 604800] as const;

export type CandleInterval = (typeof CANDLE_INTERVALS)[number];

export const isCandleInterval = (value: unknown): value is CandleInterval =>
  typeof value === 'number' && (CANDLE_INTERVALS as readonly number[]).includes(value);

// The highs and lows a detail view quotes. Every field is null for a stock
// with no candle yet, which is a real state and not an error.
export interface StockRangeRow {
  readonly day_high: WldAmount | null;
  readonly day_low: WldAmount | null;
  readonly year_high: WldAmount | null;
  readonly year_low: WldAmount | null;
  readonly first_trade_date: string | null;
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
  readonly shares?: unknown;
}

export interface StockSetPriceInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly price: unknown;
  readonly idempotencyKey?: unknown;
}

export interface StockDeleteInput {
  readonly userId: unknown;
  readonly stockId: unknown;
  readonly idempotencyKey?: unknown;
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

  // These four reads go through functions rather than querying
  // virtual_stocks, virtual_stock_positions and virtual_stock_trades
  // directly. 023-virtual-stock-game.sql revoked those tables from
  // moneyverse_app deliberately, so the direct queries the original used were
  // refused with 42501 in production; 047-virtual-stock-read-functions.sql
  // supplies the reads the write path always had. See
  // docs/findings/stock-reads-lack-grants.md.

  /**
   * The market screen's list.
   *
   * `stock_market_overview` rather than `stock_list_active`: it is the same
   * set of stocks with today's high and low joined from the candle the ticker
   * maintains, so the screen showing a day's movement is one query.
   */
  async list(): Promise<readonly StockMarketRow[]> {
    return queryRows<StockMarketRow>(
      this.pool,
      'SELECT id::text, symbol, name, description, current_price::text AS current_price, day_open_price::text AS day_open_price, day_high_price::text AS day_high_price, day_low_price::text AS day_low_price, shares_outstanding::text AS shares_outstanding, shares_available::text AS shares_available, updated_at FROM public.stock_market_overview()',
    );
  }

  /**
   * Candles at one of the supported widths, oldest first.
   *
   * The width is checked here as well as in the function so an unsupported
   * one is a 400 from this process rather than a 22023 raised in the database
   * and translated back out again.
   */
  async candles(
    stockId: unknown,
    bucketSeconds: unknown,
    limit: unknown = 120,
  ): Promise<readonly StockIntervalCandleRow[]> {
    uuid(stockId, 'stock id');
    if (!isCandleInterval(bucketSeconds)) throw new StockInputError('unsupported candle interval');
    const n =
      typeof limit === 'number' && Number.isSafeInteger(limit)
        ? Math.min(400, Math.max(1, limit))
        : 120;
    return queryRows<StockIntervalCandleRow>(
      this.pool,
      'SELECT bucket_at, open_price::text AS open_price, high_price::text AS high_price, low_price::text AS low_price, close_price::text AS close_price FROM public.stock_candles($1,$2,$3)',
      [stockId, bucketSeconds, n],
    );
  }

  async priceRange(stockId: unknown): Promise<StockRangeRow | null> {
    uuid(stockId, 'stock id');
    return queryOne<StockRangeRow>(
      this.pool,
      'SELECT day_high::text AS day_high, day_low::text AS day_low, year_high::text AS year_high, year_low::text AS year_low, first_trade_date::text AS first_trade_date FROM public.stock_price_range($1)',
      [stockId],
    );
  }

  /**
   * Prices only, for the broadcast. Deliberately not `list()`: that one sums
   * every position to work out the float, which is not worth doing every
   * second to send two numbers per stock.
   */
  async livePrices(): Promise<readonly LivePriceRow[]> {
    return queryRows<LivePriceRow>(
      this.pool,
      'SELECT id::text, current_price::text AS current_price, day_open_price::text AS day_open_price FROM public.stock_live_prices()',
    );
  }

  /**
   * One step of the market, applied by the ticker.
   *
   * Returns how many stocks moved. Zero is a normal answer: the function
   * takes an advisory lock, so a second caller in the same second does
   * nothing rather than applying a second walk.
   */
  async liveTick(): Promise<number> {
    const row = await queryOne<{ moved: string }>(
      this.pool,
      'SELECT public.stock_market_live_tick()::text AS moved',
    );
    return Number(row?.moved ?? 0);
  }

  /**
   * Takes the actor because `stock_admin_list` performs the operator check
   * itself, the same way `business_admin_list` and `season_event_admin_list`
   * do. The original had no parameter and relied on the route having checked
   * the role first; moving the check into the function means a caller cannot
   * reach the full catalogue by finding another path to this method.
   */
  async adminList(actorUserId: unknown): Promise<readonly StockAdminRow[]> {
    uuid(actorUserId, 'actor user id');
    return queryRows<StockAdminRow>(
      this.pool,
      'SELECT id::text, symbol, name, description, current_price::text AS current_price, day_open_price::text AS day_open_price, shares_outstanding::text AS shares_outstanding, shares_available::text AS shares_available, holders, trades, active, updated_at FROM public.stock_admin_list($1)',
      [actorUserId],
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
      'SELECT stock_id::text, symbol, name, quantity::text, average_cost::text, market_value::text, current_price::text FROM public.stock_my_positions($1)',
      [userId],
    );
  }

  async history(userId: unknown, limit: unknown = 50): Promise<readonly StockHistoryRow[]> {
    uuid(userId, 'user id');
    const n =
      typeof limit === 'number' && Number.isSafeInteger(limit)
        ? Math.min(100, Math.max(1, limit))
        : 50;
    return queryRows<StockHistoryRow>(
      this.pool,
      'SELECT trade_id::text, symbol, side, quantity::text, unit_price::text, gross_amount::text, tax_amount::text, created_at FROM public.stock_my_trades($1,$2)',
      [userId, n],
    );
  }

  async priceHistory(
    stockId: unknown,
    limit: unknown = 80,
  ): Promise<readonly StockPriceHistoryRow[]> {
    uuid(stockId, 'stock id');
    const n =
      typeof limit === 'number' && Number.isSafeInteger(limit)
        ? Math.min(240, Math.max(1, limit))
        : 80;
    return queryRows<StockPriceHistoryRow>(
      this.pool,
      'SELECT recorded_at, price::text AS price FROM public.stock_price_history($1,$2)',
      [stockId, n],
    );
  }

  async trade({
    userId,
    stockId,
    side,
    quantity,
    idempotencyKey = randomUUID(),
  }: StockTradeInput): Promise<StockTradeResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    if ((side !== 'buy' && side !== 'sell') || !positive(quantity))
      throw new StockInputError('invalid stock trade');
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

  async create({
    userId,
    symbol,
    name,
    description = '',
    price,
    shares = 1000000,
  }: StockCreateInput): Promise<StockCreateResultRow> {
    uuid(userId, 'user id');
    if (
      typeof symbol !== 'string' ||
      !/^[A-Z][A-Z0-9]{1,7}$/.test(symbol) ||
      typeof name !== 'string' ||
      !positive(price) ||
      !positive(shares)
    ) {
      throw new StockInputError('invalid stock');
    }
    const row = await queryOne<StockCreateResultRow>(
      this.pool,
      'SELECT public.stock_admin_create($1,$2,$3,$4,$5,$6)::text AS id',
      [userId, symbol, name, description, price, shares],
    );
    if (!row) throw new Error('database did not return a new stock id');
    return row;
  }

  async update({
    userId,
    stockId,
    name = null,
    description = null,
    active = null,
  }: StockUpdateInput): Promise<StockUpdateResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    if (name !== null && (typeof name !== 'string' || !name.trim() || name.length > 80))
      throw new StockInputError('invalid stock name');
    if (description !== null && (typeof description !== 'string' || description.length > 500))
      throw new StockInputError('invalid stock description');
    if (active !== null && typeof active !== 'boolean')
      throw new StockInputError('invalid stock active value');
    if (name === null && description === null && active === null)
      throw new StockInputError('stock change required');
    const row = await queryOne<StockUpdateResultRow>(
      this.pool,
      'SELECT public.stock_admin_update($1,$2,$3,$4,$5) AS changed',
      [userId, stockId, name, description, active],
    );
    return row ?? { changed: false };
  }

  async corporateAction({
    userId,
    stockId,
    action,
    factor,
    idempotencyKey = randomUUID(),
  }: StockCorporateActionInput): Promise<StockCorporateActionResultRow> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    if (
      (action !== 'split' && action !== 'reverse_split') ||
      typeof factor !== 'number' ||
      !Number.isSafeInteger(factor) ||
      factor < 2 ||
      factor > 100
    ) {
      throw new StockInputError('invalid stock corporate action');
    }
    const row = await queryOne<StockCorporateActionResultRow>(
      this.pool,
      'SELECT corporate_action_id::text,replayed FROM public.stock_admin_corporate_action($1,$2,$3,$4,$5)',
      [idempotencyKey, userId, stockId, action, factor],
    );
    if (!row?.corporate_action_id || typeof row.replayed !== 'boolean')
      throw new Error('database did not return a corporate-action receipt');
    return row;
  }

  /**
   * Sets a price by hand. The day's open moves with it — see 053: the walk
   * clamps to a band around the open, so a price set outside it would be
   * pulled back within the second.
   */
  async setPrice({
    userId,
    stockId,
    price,
    idempotencyKey = randomUUID(),
  }: StockSetPriceInput): Promise<{ readonly price: WldAmount }> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    if (!positive(price) || price < 10) throw new StockInputError('invalid stock price');
    const row = await queryOne<{ price: WldAmount }>(
      this.pool,
      'SELECT public.stock_admin_set_price($1,$2,$3,$4)::text AS price',
      [idempotencyKey, userId, stockId, price],
    );
    if (!row) throw new Error('database did not return the price it set');
    return row;
  }

  /**
   * Removes a stock nobody has held or traded. The function refuses anything
   * else, because the trades are a ledger — see 053.
   */
  async remove({
    userId,
    stockId,
    idempotencyKey = randomUUID(),
  }: StockDeleteInput): Promise<{ readonly deleted: boolean }> {
    uuid(userId, 'user id');
    uuid(stockId, 'stock id');
    uuid(idempotencyKey, 'idempotency key');
    const row = await queryOne<{ deleted: boolean }>(
      this.pool,
      'SELECT public.stock_admin_delete($1,$2,$3) AS deleted',
      [idempotencyKey, userId, stockId],
    );
    return row ?? { deleted: false };
  }
}
