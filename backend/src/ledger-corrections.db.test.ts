import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migrations 083-085, executed.
 *
 * A correction moves money a second time rather than editing the first move,
 * so the cases that matter are the ones that refuse: a transaction with a
 * record attached to it, and a transaction already corrected.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('ledger corrections against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('closes the grants 003 left open on the reward tables', async () => {
    for (const table of ['work_rewards', 'daily_rewards', 'admin_ip_blocks', 'admin_bulk_payouts']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('correcting and closing', () => {
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

    const member = async (client: PoolClient, funds = 0): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id)
         VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [id],
      );
      if (funds > 0) await fund(client, id, funds);
      return id;
    };

    const fund = async (client: PoolClient, actor: string, amount: number): Promise<string> => {
      const { rows } = await client.query<{ cash: string; mint: string }>(
        `SELECT (SELECT id::text FROM public.accounts
                 WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
                (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
        [actor],
      );
      const { rows: posted } = await client.query<{ economy_post_transaction: string }>(
        `SELECT public.economy_post_transaction(
           $1, 'ADMIN_ADJUSTMENT', $2, NULL,
           jsonb_build_array(
             jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
           ), 'test.funded', '{}'::jsonb)`,
        [randomUUID(), actor, rows[0]?.mint, rows[0]?.cash, amount],
      );
      return posted[0]?.economy_post_transaction as string;
    };

    const superadmin = async (client: PoolClient): Promise<string> => {
      const id = await member(client);
      await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'superadmin')", [
        id,
      ]);
      return id;
    };

    const cash = async (client: PoolClient, actor: string): Promise<string> => {
      const { rows } = await client.query<{ available_amount: string }>(
        `SELECT balance_row.available_amount::text
         FROM public.account_balances AS balance_row
         JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
         WHERE account_row.owner_user_id = $1
           AND account_row.account_type = 'USER_CASH'::public.account_type`,
        [actor],
      );
      return rows[0]?.available_amount ?? '0';
    };

    it('moves the money back and links the correction to what it corrects', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const subject = await member(client);
        const original = await fund(client, subject, 500);
        expect(await cash(client, subject)).toBe('500');

        const { rows } = await client.query<{ transaction_id: string; amount: string }>(
          `SELECT correction.transaction_id::text, correction.amount::text
           FROM public.economy_reverse_transaction($1, $2, $3, $4) AS correction`,
          [randomUUID(), admin, original, 'the grant was issued against the wrong campaign'],
        );
        expect(rows[0]?.amount).toBe('500');
        expect(await cash(client, subject)).toBe('0');

        const { rows: linked } = await client.query<{ reverses: string; type: string }>(
          `SELECT reverses_transaction_id::text AS reverses, type
           FROM public.ledger_transactions WHERE id = $1`,
          [rows[0]?.transaction_id],
        );
        expect(linked[0]?.reverses).toBe(original);
        expect(linked[0]?.type).toBe('ADMIN_ADJUSTMENT');
      });
    });

    it('refuses to correct the same transaction twice', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const subject = await member(client);
        const original = await fund(client, subject, 500);
        await client.query('SELECT * FROM public.economy_reverse_transaction($1, $2, $3, $4)', [
          randomUUID(),
          admin,
          original,
          'the grant was issued against the wrong campaign',
        ]);

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.economy_reverse_transaction($1, $2, $3, $4)', [
            randomUUID(),
            admin,
            original,
            'the grant was issued against the wrong campaign',
          ]),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('refuses a transaction whose record would be left behind', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const subject = await member(client, 5000);
        const { rows } = await client.query<{ transaction_id: string }>(
          `SELECT borrowed.transaction_id::text FROM public.bank_borrow($1, $2, 1000) AS borrowed`,
          [randomUUID(), subject],
        );

        // Reversing the money would leave a loan nobody owes.
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.economy_reverse_transaction($1, $2, $3, $4)', [
            randomUUID(),
            admin,
            rows[0]?.transaction_id,
            'trying to unwind a loan by moving its money back',
          ]),
        );
        expect(code(error)).toBe('55000');
        expect(String((error as { message?: string }).message)).toMatch(/virtual_bank_loans/);
      });
    });

    it('freezes an account so nothing further can be posted to it', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const subject = await member(client, 100);
        const { rows } = await client.query<{ id: string }>(
          `SELECT id::text FROM public.accounts
           WHERE owner_user_id = $1 AND account_type = 'USER_CASH'`,
          [subject],
        );

        await client.query('SELECT * FROM public.admin_set_account_status($1, $2, $3, $4, $5)', [
          randomUUID(),
          admin,
          rows[0]?.id,
          'frozen',
          'suspected coordinated transfers pending review',
        ]);

        const error = await rejectionOf(() => fund(client, subject, 50));
        expect(code(error)).toBe('22023');
      });
    });

    it('closes an account, its sessions and its wallets together', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const subject = await member(client, 100);

        const { rows } = await client.query<{
          revoked_sessions: number;
          frozen_accounts: number;
        }>(
          `SELECT closed.revoked_sessions, closed.frozen_accounts
           FROM public.admin_close_account($1, $2, $3, $4) AS closed`,
          [randomUUID(), admin, subject, 'account holder is under fourteen years old'],
        );
        expect(rows[0]?.frozen_accounts).toBe(2);

        const { rows: after } = await client.query<{ status: string; deleted_at: Date }>(
          'SELECT status::text, deleted_at FROM public.users WHERE id = $1',
          [subject],
        );
        expect(after[0]?.status).toBe('deleted');
        expect(after[0]?.deleted_at).not.toBeNull();
      });
    });

    it('blocks an address by network and lifts it again', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const { rows } = await client.query<{ block_id: string }>(
          `SELECT blocked.block_id::text
           FROM public.admin_block_address($1, $2, $3::inet, NULL, $4) AS blocked`,
          [randomUUID(), admin, '203.0.113.0/24', 'repeated automated sign-in attempts'],
        );

        const { rows: inside } = await client.query<{ blocked: boolean }>(
          "SELECT public.security_address_blocked('203.0.113.7'::inet) AS blocked",
        );
        expect(inside[0]?.blocked).toBe(true);

        const { rows: outside } = await client.query<{ blocked: boolean }>(
          "SELECT public.security_address_blocked('198.51.100.7'::inet) AS blocked",
        );
        expect(outside[0]?.blocked).toBe(false);

        await client.query('SELECT * FROM public.admin_lift_address_block($1, $2, $3, $4)', [
          randomUUID(),
          admin,
          rows[0]?.block_id,
          'the source was identified and resolved',
        ]);
        const { rows: lifted } = await client.query<{ blocked: boolean }>(
          "SELECT public.security_address_blocked('203.0.113.7'::inet) AS blocked",
        );
        expect(lifted[0]?.blocked).toBe(false);
      });
    });

    it('pays a batch, records who was skipped, and does not pay twice', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const paid = await member(client);
        const skipped = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [skipped]);

        const filter = JSON.stringify({ userIds: [paid, skipped] });
        const { rows: preview } = await client.query<{
          target_count: string;
          payable_count: string;
          total_amount: string;
        }>(
          `SELECT summary.target_count::text, summary.payable_count::text, summary.total_amount::text
           FROM public.admin_preview_bulk_payout($1, $2::jsonb, 100) AS summary`,
          [admin, filter],
        );
        expect(preview[0]?.target_count).toBe('2');
        // The member with no wallet is visible before the operator confirms.
        expect(preview[0]?.payable_count).toBe('1');
        expect(preview[0]?.total_amount).toBe('100');

        const key = randomUUID();
        const { rows } = await client.query<{ paid_count: number; skipped_count: number }>(
          `SELECT result.paid_count, result.skipped_count
           FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4) AS result`,
          [key, admin, filter, 'monthly community appreciation grant'],
        );
        expect(rows[0]?.paid_count).toBe(1);
        expect(rows[0]?.skipped_count).toBe(1);
        expect(await cash(client, paid)).toBe('100');

        const { rows: replay } = await client.query<{ replayed: boolean }>(
          `SELECT result.replayed
           FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4) AS result`,
          [key, admin, filter, 'monthly community appreciation grant'],
        );
        expect(replay[0]?.replayed).toBe(true);
        expect(await cash(client, paid), 'a retried batch must not pay again').toBe('100');
      });
    });

    it('refuses a filter field nobody declared', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const error = await rejectionOf(() =>
          client.query(
            `SELECT * FROM public.admin_preview_bulk_payout($1, '{"everyone": true}'::jsonb, 100)`,
            [admin],
          ),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('answers 28000 when a work receipt is not the caller’s', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const stranger = await member(client);
        const key = randomUUID();
        await client.query('SELECT * FROM public.economy_claim_work($1, $2)', [key, owner]);

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.economy_claim_work($1, $2)', [key, stranger]),
        );
        expect(code(error)).toBe('28000');
      });
    });
  });
});
