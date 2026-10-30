import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { StockAlertRepository } from './stock-alert.repository';

// Run only against an isolated, migrator-owned PostgreSQL database.
const url = process.env.MIGRATOR_DATABASE_URL;
const pool = url ? new Pool({ connectionString: url, max: 1 }) : null;
afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('real PostgreSQL owner stock-alert trigger categories', () => {
  it('filters a bounded owner function result without direct app table reads or ledger writes', async () => {
    const client = await pool!.connect();
    const owner = randomUUID();
    const stranger = randomUUID();
    const stock = randomUUID();
    const priceRule = randomUUID();
    const changeRule = randomUUID();
    const strangerRule = randomUUID();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [owner, stranger]);
      await client.query(
        'INSERT INTO public.virtual_stocks(id,symbol,name,initial_price,current_price,day_open_price) VALUES ($1,$2,$3,100,100,100)',
        [stock, `T${randomUUID().replaceAll('-', '').slice(0, 7).toUpperCase()}`, 'Synthetic alert stock'],
      );
      await client.query(`INSERT INTO public.member_stock_alert_rules
        (id,user_id,stock_id,condition_kind,threshold_amount,threshold_bps)
        VALUES ($1,$4,$3,'price_at_or_above',9007199254740993,NULL),
               ($2,$4,$3,'day_change_at_or_below',NULL,-150),
               ($5,$6,$3,'price_at_or_above',100,NULL)`,
      [priceRule, changeRule, stock, owner, strangerRule, stranger]);
      await client.query(`INSERT INTO public.member_stock_alert_events
        (rule_id,user_id,stock_id,condition_kind,threshold_amount,threshold_bps,trigger_price,trigger_day_change_bps)
        VALUES ($1,$4,$3,'price_at_or_above',9007199254740993,NULL,9007199254740994,100),
               ($2,$4,$3,'day_change_at_or_below',NULL,-150,9007199254740995,-200),
               ($5,$6,$3,'price_at_or_above',100,NULL,100,0)`,
      [priceRule, changeRule, stock, owner, strangerRule, stranger]);
      const acl = await client.query<{ direct_read: boolean; function_exec: boolean }>(
        `SELECT has_table_privilege('moneyverse_app','public.member_stock_alert_events','SELECT') AS direct_read,
                has_function_privilege('moneyverse_app','public.stock_alert_events_list(uuid,integer)','EXECUTE') AS function_exec`,
      );
      expect(acl.rows[0]).toEqual({ direct_read: false, function_exec: true });
      await client.query('SET LOCAL ROLE moneyverse_app');
      await client.query('SAVEPOINT no_direct_read');
      await expect(client.query('SELECT * FROM public.member_stock_alert_events')).rejects.toMatchObject({ code: '42501' });
      await client.query('ROLLBACK TO SAVEPOINT no_direct_read');
      const repo = new StockAlertRepository(client);
      const ownerPrice = await repo.events(owner, 30, 'price');
      const ownerChange = await repo.events(owner, 30, 'change');
      const foreignPrice = await repo.events(stranger, 30, 'price');
      expect(ownerPrice).toHaveLength(1);
      expect(ownerChange).toHaveLength(1);
      expect(foreignPrice).toHaveLength(1);
      expect(ownerPrice[0]?.threshold_amount).toBe('9007199254740993');
      expect(ownerPrice[0]?.trigger_price).toBe('9007199254740994');
      expect(ownerChange[0]?.condition_kind).toBe('day_change_at_or_below');
      expect(foreignPrice[0]?.trigger_price).toBe('100');
      expect(await repo.events(owner, 1)).toHaveLength(1);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
