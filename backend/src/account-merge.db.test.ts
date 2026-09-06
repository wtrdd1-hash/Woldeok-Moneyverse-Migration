import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL)('forked account merge boundaries', () => {
  let app: Pool;

  beforeAll(() => {
    app = new Pool({ connectionString: DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await app.end();
  });

  it('does not expose account merge history or execution to the application role', async () => {
    const tableError = await rejectionOf(() =>
      app.query('SELECT * FROM public.admin_account_merge_events'),
    );
    expect(String((tableError as { message?: string }).message)).toMatch(/permission denied/i);

    const functionError = await rejectionOf(() =>
      app.query(
        'SELECT * FROM public.admin_merge_forked_member_account($1,$1,$1,$1)',
        [randomUUID()],
      ),
    );
    expect(String((functionError as { message?: string }).message)).toMatch(/permission denied/i);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('merge transaction', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    it('moves balances through the ledger and preserves the surviving display name', async () => {
      await rolledBack(async (client) => {
        const keep = randomUUID();
        const merge = randomUUID();
        const key = randomUUID();
        await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [keep, merge]);
        await client.query(
          `INSERT INTO public.identities(user_id,provider,provider_subject,display_name)
           VALUES ($1,'discord',$3,'chosen-name'),($2,'google',$4,'provider-name')`,
          [keep, merge, `keep-${keep}`, `merge-${merge}`],
        );
        await client.query(
          "INSERT INTO public.user_roles(user_id,role) VALUES ($1,'superadmin')",
          [keep],
        );
        await client.query(
          `INSERT INTO public.accounts(account_type,owner_user_id)
           VALUES ('USER_CASH',$1),('USER_BANK',$1),('USER_CASH',$2),('USER_BANK',$2)`,
          [keep, merge],
        );
        await client.query(
          `INSERT INTO public.account_balances(account_id)
           SELECT id FROM public.accounts WHERE owner_user_id IN ($1,$2)`,
          [keep, merge],
        );
        await client.query(
          `SELECT public.economy_post_transaction(
             $1,'TEST_MINT',$2,NULL,
             jsonb_build_array(
               jsonb_build_object('accountId',(SELECT id FROM public.accounts WHERE system_key='mint'),'amount',250,'direction','credit'),
               jsonb_build_object('accountId',(SELECT id FROM public.accounts WHERE owner_user_id=$3 AND account_type='USER_CASH'),'amount',250,'direction','debit')
             ),'test.merge.seeded','{}'::jsonb)`,
          [randomUUID(), keep, merge],
        );

        const first = await client.query<{
          transferred_amount: string;
          replayed: boolean;
        }>('SELECT * FROM public.admin_merge_forked_member_account($1,$2,$2,$3)', [
          key,
          keep,
          merge,
        ]);
        expect(first.rows[0]).toMatchObject({ transferred_amount: '250', replayed: false });

        const balances = await client.query<{ owner_user_id: string; available_amount: string }>(
          `SELECT account_row.owner_user_id::text, balance_row.available_amount::text
           FROM public.accounts AS account_row
           JOIN public.account_balances AS balance_row ON balance_row.account_id=account_row.id
           WHERE account_row.owner_user_id IN ($1,$2) AND account_row.account_type='USER_CASH'
           ORDER BY account_row.owner_user_id`,
          [keep, merge],
        );
        expect(new Map(balances.rows.map((row) => [row.owner_user_id, row.available_amount]))).toEqual(
          new Map([
            [keep, '250'],
            [merge, '0'],
          ]),
        );
        expect(
          await client.query('SELECT display_name FROM public.identities WHERE user_id=$1 ORDER BY display_name', [
            keep,
          ]),
        ).toMatchObject({ rows: [{ display_name: 'chosen-name' }, { display_name: 'provider-name' }] });
        expect(
          await client.query('SELECT status::text FROM public.users WHERE id=$1', [merge]),
        ).toMatchObject({ rows: [{ status: 'deleted' }] });

        const replay = await client.query<{ replayed: boolean }>(
          'SELECT replayed FROM public.admin_merge_forked_member_account($1,$2,$2,$3)',
          [key, keep, merge],
        );
        expect(replay.rows[0]?.replayed).toBe(true);
      });
    });
  });
});
