import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { StockAlertRepository } from './stock-alert.repository';

// Only an isolated migrator-owned test database can create fixtures, then impersonate the app role.
const url = process.env.MIGRATOR_DATABASE_URL;
const pool = url ? new Pool({ connectionString: url, max: 1 }) : null;
afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('real PostgreSQL stock alert owner receipt flow', () => {
  it('creates, reads back, isolates, and deletes an alert as the application role', async () => {
    const client = await pool!.connect();
    const actor = randomUUID();
    const stranger = randomUUID();
    const stock = randomUUID();
    const symbol = `T${randomUUID().replaceAll('-', '').slice(0, 7).toUpperCase()}`;
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1), ($2)', [actor, stranger]);
      await client.query(
        'INSERT INTO public.virtual_stocks(id, symbol, name, initial_price, current_price, day_open_price) VALUES ($1,$2,$3,100,100,100)',
        [stock, symbol, 'Isolated synthetic stock'],
      );
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new StockAlertRepository(client);
      const receipt = await repository.create({
        userId: actor, stockId: stock, conditionKind: 'price_at_or_above',
        thresholdAmount: '9007199254740993', cooldownSeconds: 3600,
      });
      expect(receipt.alertId).toMatch(/^[0-9a-f-]{36}$/i);
      const own = await repository.list(actor);
      expect(own).toEqual(expect.arrayContaining([expect.objectContaining({
        alert_id: receipt.alertId, stock_id: stock,
        condition_kind: 'price_at_or_above', threshold_amount: '9007199254740993',
        threshold_bps: null, cooldown_seconds: 3600,
      })]));
      expect(await repository.list(stranger)).toEqual([]);
      expect(await repository.remove(stranger, receipt.alertId)).toEqual({ deleted: false });
      expect((await repository.list(actor)).some((rule) => rule.alert_id === receipt.alertId)).toBe(true);
      expect(await repository.remove(actor, receipt.alertId)).toEqual({ deleted: true });
      expect(await repository.list(actor)).toEqual([]);
      expect(await repository.remove(actor, receipt.alertId)).toEqual({ deleted: false });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
