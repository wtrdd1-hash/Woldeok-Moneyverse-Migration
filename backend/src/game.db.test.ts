import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl, isMissingGrant, rejectionOf } from './testing/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BusinessService } from './business/business.service';
import { PostgresBusinessRepository } from './business/business.repository';
import { SeasonService } from './season/season.service';
import { PostgresSeasonRepository } from './season/season.repository';
import { StockService } from './stock/stock.service';
import { PostgresStockRepository } from './stock/stock.repository';

const DATABASE_URL = databaseUrl();
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

/**
 * Drives every read and command of the three game modules against real
 * functions. A signature that moved in a migration surfaces here; against a
 * double it would not.
 */
describe.skipIf(!DATABASE_URL)('game modules against a real database', () => {
  let pool: Pool;
  let stocks: StockService;
  let businesses: BusinessService;
  let seasons: SeasonService;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 3 });
    stocks = new StockService(new PostgresStockRepository(pool));
    businesses = new BusinessService(new PostgresBusinessRepository(pool));
    seasons = new SeasonService(new PostgresSeasonRepository(pool));
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('stocks', () => {
    /**
     * These four reads were refused with 42501 in the original: they queried
     * virtual_stocks, virtual_stock_positions and virtual_stock_trades
     * directly, and 023-virtual-stock-game.sql had revoked all three from
     * moneyverse_app on purpose. 047-virtual-stock-read-functions.sql adds
     * the read functions the write path always had.
     * See docs/findings/stock-reads-lack-grants.md.
     */
    it('lists active stocks through a function', async () => {
      await expect(stocks.list()).resolves.toBeInstanceOf(Array);
    });

    it('reads an empty portfolio for an unknown user', async () => {
      await expect(stocks.portfolio(UNKNOWN)).resolves.toEqual([]);
    });

    it('reads empty trade history for an unknown user', async () => {
      await expect(stocks.history(UNKNOWN)).resolves.toEqual([]);
    });

    it('reads price history through a function', async () => {
      await expect(stocks.priceHistory(randomUUID())).resolves.toBeInstanceOf(Array);
    });

    /**
     * The market screen's preview lines, for every listed stock at once
     * (055). The development machine has no PostgreSQL server, so this is
     * where the function's SQL is executed at all — a lateral that does not
     * parse or an array cast the planner refuses shows up here and nowhere
     * earlier.
     */
    it('reads every listed stock\'s preview series in one call', async () => {
      const series = await stocks.sparkSeries(40);
      expect(series).toBeInstanceOf(Array);
      for (const row of series) {
        expect(typeof row.stock_id).toBe('string');
        expect(row.prices).toBeInstanceOf(Array);
        // Prices stay strings: a bigint rounded into a double draws two
        // distinct prices at the same height.
        for (const price of row.prices) expect(typeof price).toBe('string');
      }
    });

    it('clamps a nonsensical series length rather than refusing it', async () => {
      await expect(stocks.sparkSeries(-5)).resolves.toBeInstanceOf(Array);
      await expect(stocks.sparkSeries(10_000)).resolves.toBeInstanceOf(Array);
      await expect(stocks.sparkSeries('forty')).resolves.toBeInstanceOf(Array);
    });

    // The point of the fix: the reads work, and the tables stay unreadable.
    // If a later change grants the role SELECT to make some query easier,
    // this is what notices.
    it('still cannot read the underlying tables directly', async () => {
      for (const table of ['virtual_stocks', 'virtual_stock_positions', 'virtual_stock_trades']) {
        await expect(
          pool.query(`SELECT 1 FROM public.${table} LIMIT 1`),
          `${table} became readable`,
        ).rejects.toMatchObject({ code: '42501' });
      }
    });

    it('keeps OAuth identities unreadable by the application role', async () => {
      await expect(pool.query('SELECT 1 FROM public.identities LIMIT 1')).rejects.toMatchObject({
        code: '42501',
      });
    });

    // The operator check now lives in the function rather than in the route,
    // so a caller who reaches this method without the role is still refused.
    it('refuses the admin catalogue to a caller with no operator role', async () => {
      await expect(stocks.adminList(UNKNOWN)).rejects.toMatchObject({ code: '42501' });
    });

    it('bounds the trade history limit inside the function', async () => {
      await expect(
        pool.query('SELECT * FROM public.stock_my_trades($1, $2)', [UNKNOWN, 500]),
      ).rejects.toMatchObject({ code: '22023' });
    });

    it('refuses a trade on a stock that does not exist', async () => {
      await expect(
        stocks.trade({
          userId: UNKNOWN,
          stockId: randomUUID(),
          side: 'buy',
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
      ).rejects.toThrow();
    });

    it('rejects an unknown side before querying', async () => {
      await expect(
        stocks.trade({
          userId: UNKNOWN,
          stockId: randomUUID(),
          side: 'hold',
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
      ).rejects.toThrow();
    });
  });

  describe('businesses', () => {
    it('lists the catalogue', async () => {
      await expect(businesses.catalog()).resolves.toBeInstanceOf(Array);
    });

    it('reads no holdings for an unknown user', async () => {
      await expect(businesses.mine(UNKNOWN)).resolves.toEqual([]);
    });

    it('refuses a purchase of a type that does not exist', async () => {
      await expect(
        businesses.purchase(UNKNOWN, {
          businessTypeId: randomUUID(),
          idempotencyKey: randomUUID(),
        }),
      ).rejects.toThrow();
    });

    it('refuses to settle an ownership that does not exist', async () => {
      await expect(
        businesses.settle(UNKNOWN, { ownershipId: randomUUID(), idempotencyKey: randomUUID() }),
      ).rejects.toThrow();
    });
  });

  describe('seasons', () => {
    it('lists active events', async () => {
      await expect(seasons.events()).resolves.toBeInstanceOf(Array);
    });

    it('reads a leaderboard for an unknown event', async () => {
      await expect(seasons.leaderboard(randomUUID())).resolves.toBeInstanceOf(Array);
    });

    it('refuses to consume an event that does not exist', async () => {
      await expect(
        seasons.consume(UNKNOWN, {
          eventId: randomUUID(),
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
      ).rejects.toThrow();
    });
  });

  // Every refusal from a *command* must come from the function's own logic.
  // Error 42501 there would mean the role lost an EXECUTE grant. The stock
  // reads above are the documented exception and are deliberately absent.
  it('commands are refused by the functions themselves, never by a missing grant', async () => {
    const attempts: readonly (() => Promise<unknown>)[] = [
      () =>
        stocks.trade({
          userId: UNKNOWN,
          stockId: randomUUID(),
          side: 'buy',
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
      () =>
        businesses.purchase(UNKNOWN, {
          businessTypeId: randomUUID(),
          idempotencyKey: randomUUID(),
        }),
      () => businesses.settle(UNKNOWN, { ownershipId: randomUUID(), idempotencyKey: randomUUID() }),
      () =>
        seasons.consume(UNKNOWN, {
          eventId: randomUUID(),
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
    ];
    for (const attempt of attempts) {
      const error = await rejectionOf(attempt);
      expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
    }
  });
});
