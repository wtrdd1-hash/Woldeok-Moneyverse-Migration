import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migrations 079-080, executed.
 *
 * Two things here are privacy controls rather than features: what a profile
 * shows to whom, and a casino self-exclusion. Both were stored and neither
 * was applied, which is the failure mode that matters -- a member who sets a
 * limit believes it is holding.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('member profiles against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the profile tables unreadable by the application role', async () => {
    for (const table of ['member_profiles', 'member_titles', 'user_titles', 'casino_self_limits']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('who may see what', () => {
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

    const member = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      return id;
    };

    it('shows a member who has never opened the screen on the declared default', async () => {
      // Nothing wrote `member_profiles` before this migration, so every read
      // -- including a member's own -- answered "profile is not available".
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);

        const { rows } = await client.query<{ visibility: string }>(
          'SELECT profile.visibility::text FROM public.member_profile_view($1, $2) AS profile',
          [viewer, subject],
        );
        expect(rows[0]?.visibility).toBe('members');
      });
    });

    it('keeps a private profile to its owner', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        await client.query(
          "SELECT * FROM public.member_update_profile($1, 'private', 'Quiet', NULL, '{}'::jsonb, NULL)",
          [subject],
        );

        // A savepoint, because a failed statement aborts the transaction and
        // everything after it would answer 25P02 instead of what it was asked.
        await client.query('SAVEPOINT before_refusal');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.member_profile_view($1, $2)', [viewer, subject]),
        );
        expect(code(error)).toBe('28000');
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');

        const { rows } = await client.query<{ display_name: string }>(
          'SELECT profile.display_name FROM public.member_profile_view($1, $2) AS profile',
          [subject, subject],
        );
        expect(rows[0]?.display_name).toBe('Quiet');
      });
    });

    it('applies a per-field setting rather than storing it and ignoring it', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        await client.query(
          `SELECT * FROM public.member_update_profile(
             $1, 'public', 'Open', 'https://example.test/a.png',
             '{"imageUrl": "private"}'::jsonb, NULL)`,
          [subject],
        );

        const { rows: other } = await client.query<{ image_url: string | null }>(
          'SELECT profile.image_url FROM public.member_profile_view($1, $2) AS profile',
          [viewer, subject],
        );
        expect(other[0]?.image_url).toBeNull();

        const { rows: own } = await client.query<{ image_url: string | null }>(
          'SELECT profile.image_url FROM public.member_profile_view($1, $2) AS profile',
          [subject, subject],
        );
        expect(own[0]?.image_url).toBe('https://example.test/a.png');
      });
    });

    it('refuses a title the member does not hold', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const error = await rejectionOf(() =>
          client.query(
            "SELECT * FROM public.member_update_profile($1, 'public', NULL, NULL, '{}'::jsonb, 'season_honour')",
            [subject],
          ),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('stops showing a member who is no longer active', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        const viewer = await member(client);
        await client.query(
          "SELECT * FROM public.member_update_profile($1, 'public', 'Gone', NULL, '{}'::jsonb, NULL)",
          [subject],
        );
        await client.query(
          `UPDATE public.users
           SET status = 'deleted'::public.user_status, deleted_at = clock_timestamp()
           WHERE id = $1`,
          [subject],
        );

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.member_profile_view($1, $2)', [viewer, subject]),
        );
        expect(code(error)).toBe('28000');
      });
    });

    it('will not let a locked self-limit be loosened', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        await client.query(
          "SELECT public.member_set_casino_self_limit($1, 100, 100, clock_timestamp() + interval '7 days')",
          [subject],
        );

        const error = await rejectionOf(() =>
          client.query('SELECT public.member_set_casino_self_limit($1, 100000, 100000, NULL)', [
            subject,
          ]),
        );
        expect(code(error)).toBe('55000');
      });
    });

    it('refuses a play past the limit the member set on themselves', async () => {
      await rolledBack(async (client) => {
        const subject = await member(client);
        await client.query(
          `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)`,
          [subject],
        );
        await client.query(
          `INSERT INTO public.account_balances (account_id)
           SELECT id FROM public.accounts WHERE owner_user_id = $1`,
          [subject],
        );
        const { rows: accounts } = await client.query<{ cash: string; mint: string }>(
          `SELECT (SELECT id::text FROM public.accounts WHERE owner_user_id = $1) AS cash,
                  (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
          [subject],
        );
        const { rows: funded } = await client.query<{ economy_post_transaction: string }>(
          `SELECT public.economy_post_transaction(
             $1, 'ADMIN_ADJUSTMENT', $2, NULL,
             jsonb_build_array(
               jsonb_build_object('accountId', $3::uuid, 'amount', 5000, 'direction', 'credit'),
               jsonb_build_object('accountId', $4::uuid, 'amount', 5000, 'direction', 'debit')
             ), 'test.funded', '{}'::jsonb)`,
          [randomUUID(), subject, accounts[0]?.mint, accounts[0]?.cash],
        );

        await client.query('SELECT public.member_set_casino_self_limit($1, 50, 50, NULL)', [
          subject,
        ]);

        // The trigger, not the play function: 060's `casino_play_coin` knows
        // the operator's caps and nothing about the member's own.
        const error = await rejectionOf(() =>
          client.query(
            `INSERT INTO public.virtual_casino_coin_plays
               (idempotency_key, user_id, play_date, choice, outcome,
                stake_amount, net_amount, transaction_id)
             VALUES ($1, $2, (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date,
                     'heads', 'tails', 100, -100, $3)`,
            [randomUUID(), subject, funded[0]?.economy_post_transaction],
          ),
        );
        expect(code(error)).toBe('55000');
      });
    });
  });
});
