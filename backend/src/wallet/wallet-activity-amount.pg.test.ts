import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';
const URL = process.env.MV_A1025_TEST_DATABASE_URL;
const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const BIG = '900719925474099312345';
describe.skipIf(!URL)('isolated PG17 wallet WLD amount floor', () => {
  it('filters owner-only exact NUMERIC before pagination, respects direction and rolls back', async () => {
    const pool = new Pool({ connectionString: URL, connectionTimeoutMillis: 2500 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [OWNER, OTHER]);
      const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
      const b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      const s = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
      await client.query(`INSERT INTO public.accounts(id,account_type,owner_user_id,system_key) VALUES
        ($1,'USER_CASH',$4,NULL),($2,'USER_CASH',$5,NULL),($3,'SINK',NULL,'MV_A1025_ISOLATED_SINK')`, [a,b,s,OWNER,OTHER]);
      for (const [n, actor, account, amount] of [[1,OWNER,a,BIG],[2,OWNER,a,'9'],[3,OTHER,b,'900719925474099312346']] as const) {
        const id = `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
        await client.query(`INSERT INTO public.ledger_transactions(id,idempotency_key,type,actor_user_id,request_hash,created_at)
          VALUES($1,gen_random_uuid(),'USER_TO_USER',$2,decode(repeat('aa',32),'hex'),$3)`, [id,actor,`2026-10-28T00:00:0${n}Z`]);
        await client.query(`INSERT INTO public.ledger_postings(transaction_id,account_id,amount,direction)
          VALUES($1,$2,$4,'debit'),($1,$3,$4,'credit')`, [id,account,s,amount]);
      }
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new PostgresWalletRepository(client);
      const asOf = new Date('2026-10-29T00:00:00Z');
      const filtered = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, minAmount: BIG, direction: 'in' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.net_amount).toBe(BIG);
      const higher = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, minAmount: '900719925474099312346' });
      expect(higher).toHaveLength(0);
      const foreign = await repo.activityTransactionsForUser(OTHER, { asOf, since: null, minAmount: BIG });
      expect(foreign).toHaveLength(1);
      expect(foreign[0]?.net_amount).toBe('900719925474099312346');
      const { rows } = await client.query(`SELECT has_table_privilege(current_user,'public.ledger_transactions','INSERT') AS ledger_insert,
        has_table_privilege(current_user,'public.ledger_postings','DELETE') AS posting_delete`);
      expect(rows[0]?.ledger_insert).toBe(false);
      expect(rows[0]?.posting_delete).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
