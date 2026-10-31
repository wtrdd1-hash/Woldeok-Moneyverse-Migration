import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

const URL = process.env.MV_A2325_TEST_DATABASE_URL;
const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';

describe.skipIf(!URL)('wallet page totals isolated PostgreSQL 17.11 proof', () => {
  it('sums real owner postings only, retains bank transfers and rolls back all synthetic money', async () => {
    const pool = new Pool({ connectionString: URL, connectionTimeoutMillis: 4000 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [OWNER, FOREIGN]);
      const { rows } = await client.query<{
        id: string;
        account_type: string;
        owner_user_id: string;
      }>(
        `INSERT INTO public.accounts(account_type, owner_user_id)
         VALUES ('USER_CASH', $1), ('USER_BANK', $1), ('USER_CASH', $2), ('USER_BANK', $2)
         RETURNING id, account_type, owner_user_id`,
        [OWNER, FOREIGN],
      );
      const account = (owner: string, type: string) =>
        rows.find((r) => r.owner_user_id === owner && r.account_type === type)!.id;
      await client.query(
        'INSERT INTO public.account_balances(account_id) SELECT id FROM public.accounts WHERE owner_user_id IN ($1,$2)',
        [OWNER, FOREIGN],
      );
      const mint = (
        await client.query<{ id: string }>("SELECT id FROM public.accounts WHERE system_key='mint'")
      ).rows[0]!.id;
      const post = async (
        key: string,
        actor: string,
        first: string,
        second: string,
        amount: string,
      ) => {
        const postings = [
          { accountId: first, direction: 'debit', amount },
          { accountId: second, direction: 'credit', amount },
        ];
        await client.query(
          'SELECT public.economy_post_transaction($1::uuid,$2::text,$3::uuid,$4::text,$5::jsonb,$6::text,$7::jsonb)',
          [
            key,
            'USER_TO_USER',
            actor,
            null,
            JSON.stringify(postings),
            'synthetic_wallet_test',
            '{}',
          ],
        );
      };
      await post(
        '00000000-0000-4000-8000-000000000001',
        OWNER,
        account(OWNER, 'USER_CASH'),
        mint,
        '100',
      );
      await post(
        '00000000-0000-4000-8000-000000000002',
        OWNER,
        account(OWNER, 'USER_BANK'),
        account(OWNER, 'USER_CASH'),
        '40',
      );
      await post(
        '00000000-0000-4000-8000-000000000003',
        FOREIGN,
        account(FOREIGN, 'USER_CASH'),
        mint,
        '30',
      );
      await client.query('SET LOCAL ROLE moneyverse_app');
      const rights = await client.query(
        "SELECT has_table_privilege(current_user,'public.ledger_postings','INSERT') AS insert_allowed, has_table_privilege(current_user,'public.ledger_transactions','UPDATE') AS update_allowed",
      );
      expect(rights.rows[0]).toEqual({ insert_allowed: false, update_allowed: false });
      const service = new WalletService(new PostgresWalletRepository(client), {
        clock: () => new Date(),
      });
      const own = await service.activityPage(OWNER, SESSION);
      expect(own.pageSummary).toEqual({
        scope: 'VISIBLE_PAGE_ONLY',
        transactionCount: 2,
        cashDelta: '60',
        bankDelta: '40',
        netDelta: '100',
      });
      const other = await service.activityPage(FOREIGN, SESSION);
      expect(other.pageSummary).toMatchObject({ transactionCount: 1, netDelta: '30' });
    } finally {
      await client.query('ROLLBACK');
      const remaining = await client.query(
        'SELECT count(*)::int AS n FROM public.users WHERE id IN ($1,$2)',
        [OWNER, FOREIGN],
      );
      expect(remaining.rows[0]?.n).toBe(0);
      client.release();
      await pool.end();
    }
  });
});
