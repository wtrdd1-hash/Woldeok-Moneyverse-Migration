import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BusinessService } from './business/business.service';
import { PostgresBusinessRepository } from './business/business.repository';
import { SeasonService } from './season/season.service';
import { PostgresSeasonRepository } from './season/season.repository';
import { StockService } from './stock/stock.service';
import { PostgresStockRepository } from './stock/stock.repository';

function databaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const text = readFileSync(join(__dirname, '../../packages/database/.env'), 'utf8');
    return /^DATABASE_URL=(.+)$/m.exec(text)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

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
     * KNOWN DEFECT, carried over from the original and confirmed live in
     * production on 2026-08-28. See docs/findings/stock-reads-lack-grants.md.
     *
     * These three reads query virtual_stocks, virtual_stock_positions and
     * virtual_stock_trades directly instead of going through a SECURITY
     * DEFINER function, and moneyverse_app holds no privilege on any of them.
     * The port is faithful: the SQL is byte-identical to the original, so the
     * failure is the original's, not the port's.
     *
     * They assert the failure rather than skipping it, so the defect stays
     * visible. When it is fixed, these turn red and must be rewritten to
     * assert success — which is the intended prompt.
     */
    it('list is refused: the role has no privilege on virtual_stocks', async () => {
      await expect(stocks.list()).rejects.toMatchObject({ code: '42501' });
    });

    it('portfolio is refused: the role has no privilege on virtual_stock_positions', async () => {
      await expect(stocks.portfolio(UNKNOWN)).rejects.toMatchObject({ code: '42501' });
    });

    it('history is refused: the role has no privilege on virtual_stock_trades', async () => {
      await expect(stocks.history(UNKNOWN)).rejects.toMatchObject({ code: '42501' });
    });

    // The contrast that identifies the cause: the same module's function-based
    // read works, because EXECUTE is granted where table privileges are not.
    it('reads price history, which goes through a function and works', async () => {
      await expect(stocks.priceHistory(randomUUID())).resolves.toBeInstanceOf(Array);
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
      () =>
        businesses.settle(UNKNOWN, { ownershipId: randomUUID(), idempotencyKey: randomUUID() }),
      () =>
        seasons.consume(UNKNOWN, {
          eventId: randomUUID(),
          quantity: 1,
          idempotencyKey: randomUUID(),
        }),
    ];
    for (const attempt of attempts) {
      const error = await attempt().then(
        () => null,
        (caught: unknown) => caught,
      );
      expect((error as { code?: string } | null)?.code).not.toBe('42501');
    }
  });
});
