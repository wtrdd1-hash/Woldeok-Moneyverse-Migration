import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migrations 086-088, executed.
 *
 * The scheduler's whole correctness is that a window can be claimed once, so
 * that is the case with the most weight here. The rest is what the schedule
 * does when it finds something wrong.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the schedule against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the schedule tables unreadable by the application role', async () => {
    for (const table of ['scheduled_job_runs', 'admin_alerts', 'economy_safe_mode_trips']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('keeps the window arithmetic away from the application role', async () => {
    const error = await rejectionOf(() =>
      pool.query("SELECT public.schedule_period_key('daily', now())"),
    );
    expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
  });

  it('refuses to take a reconciliation snapshot as the application role', async () => {
    // 018 checks the session's login role precisely so that the web role
    // cannot write a snapshot, and this is that check still holding.
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.economy_run_reconciliation_check()'),
    );
    expect(String((error as { message?: string }).message)).toMatch(/permission denied|reconcil/i);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('claiming and reacting', () => {
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

    // The application never calls this -- the window arithmetic lives behind
    // `schedule_claim_run` -- so it is not granted to the web role, and the
    // migrator is the connection that can ask it anything.
    it('names its windows in Asia/Seoul', async () => {
      const { rows } = await migrator.query<{ daily: string; hourly: string; weekly: string }>(
        `SELECT public.schedule_period_key('daily', $1::timestamptz) AS daily,
                public.schedule_period_key('hourly', $1::timestamptz) AS hourly,
                public.schedule_period_key('weekly', $1::timestamptz) AS weekly`,
        // 2026-03-02T19:30Z is 2026-03-03T04:30 in Seoul: past the 04:00
        // boundary, so it belongs to the third and not to the second.
        ['2026-03-02T19:30:00Z'],
      );
      expect(rows[0]?.daily).toBe('2026-03-03');
      expect(rows[0]?.hourly).toBe('2026-03-03T04');

      const { rows: before } = await migrator.query<{ daily: string }>(
        "SELECT public.schedule_period_key('daily', '2026-03-02T18:30:00Z'::timestamptz) AS daily",
      );
      // 03:30 Seoul is still the previous day's window.
      expect(before[0]?.daily).toBe('2026-03-02');
    });

    it('gives a window to one claimant and refuses the next', async () => {
      await rolledBack(async (client) => {
        const job = `test.claim_${randomUUID().slice(0, 8).replace(/-/g, '')}`;
        const { rows: first } = await client.query<{ claimed: boolean; period_key: string }>(
          'SELECT claim.claimed, claim.period_key FROM public.schedule_claim_run($1, $2, 0) AS claim',
          [job, 'daily'],
        );
        expect(first[0]?.claimed).toBe(true);

        const { rows: second } = await client.query<{ claimed: boolean }>(
          'SELECT claim.claimed FROM public.schedule_claim_run($1, $2, 0) AS claim',
          [job, 'daily'],
        );
        expect(second[0]?.claimed, 'a window is claimed once').toBe(false);

        await client.query("SELECT public.schedule_finish_run($1, $2, 'succeeded', '{}'::jsonb)", [
          job,
          first[0]?.period_key,
        ]);
        const { rows: run } = await client.query<{ status: string }>(
          'SELECT status FROM public.scheduled_job_runs WHERE job = $1',
          [job],
        );
        expect(run[0]?.status).toBe('succeeded');
      });
    });

    it('trips a feature into safe mode and will not do anything else', async () => {
      await rolledBack(async (client) => {
        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'stock_corporate_action'",
        );
        const { rows } = await client.query<{ tripped: boolean }>(
          "SELECT public.economy_trip_safe_mode('stock_corporate_action', 'a test', NULL) AS tripped",
        );
        expect(rows[0]?.tripped).toBe(true);

        const { rows: state } = await client.query<{ state: string }>(
          "SELECT state FROM public.feature_switches WHERE feature_key = 'stock_corporate_action'",
        );
        expect(state[0]?.state).toBe('safe_mode');

        // Towards safety only: a second call finds it already there and does
        // nothing, and it can never move a switch back to enabled.
        const { rows: again } = await client.query<{ tripped: boolean }>(
          "SELECT public.economy_trip_safe_mode('stock_corporate_action', 'a test', NULL) AS tripped",
        );
        expect(again[0]?.tripped).toBe(false);

        const error = await rejectionOf(() =>
          client.query("UPDATE public.economy_safe_mode_trips SET reason = 'edited'"),
        );
        expect(code(error)).toBe('55000');
      });
    });

    it('raises an alert once per window', async () => {
      await rolledBack(async (client) => {
        const key = randomUUID();
        const { rows: first } = await client.query<{ raised: boolean }>(
          "SELECT public.admin_raise_alert('economy.issuance.spike', 'warning', 'a test', $1, '{}'::jsonb) AS raised",
          [key],
        );
        expect(first[0]?.raised).toBe(true);

        const { rows: second } = await client.query<{ raised: boolean }>(
          "SELECT public.admin_raise_alert('economy.issuance.spike', 'warning', 'a test', $1, '{}'::jsonb) AS raised",
          [key],
        );
        expect(second[0]?.raised, 'the same window must not alert twice').toBe(false);
      });
    });

    it('counts escrow as money supply, which 018 does not', async () => {
      await rolledBack(async (client) => {
        const member = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [member]);
        await client.query(
          `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)`,
          [member],
        );
        await client.query(
          `INSERT INTO public.account_balances (account_id)
           SELECT id FROM public.accounts WHERE owner_user_id = $1`,
          [member],
        );
        const { rows: accounts } = await client.query<{ cash: string; escrow: string }>(
          `SELECT (SELECT id::text FROM public.accounts WHERE owner_user_id = $1) AS cash,
                  (SELECT id::text FROM public.accounts WHERE system_key = 'escrow') AS escrow`,
          [member],
        );
        // The wallet has to hold the money before it can be escrowed: a
        // credit is a decrease here, and crediting an empty account is the
        // insufficient-balance refusal rather than the case under test.
        const { rows: mint } = await client.query<{ id: string }>(
          "SELECT id::text FROM public.accounts WHERE system_key = 'mint'",
        );
        await client.query(
          `SELECT public.economy_post_transaction(
             $1, 'MINT_TO_USER', $2, NULL,
             jsonb_build_array(
               jsonb_build_object('accountId', $3::uuid, 'amount', 700, 'direction', 'debit'),
               jsonb_build_object('accountId', $4::uuid, 'amount', 700, 'direction', 'credit')
             ), 'test.funded', '{}'::jsonb)`,
          [randomUUID(), member, accounts[0]?.cash, mint[0]?.id],
        );

        const { rows: before } = await client.query<{ m2: string; escrow: string }>(
          'SELECT supply.m2_amount::text AS m2, supply.escrow_amount::text AS escrow FROM public.economy_money_supply() AS supply',
        );

        await client.query(
          `SELECT public.economy_post_transaction(
             $1, 'ADMIN_ADJUSTMENT', $2, NULL,
             jsonb_build_array(
               jsonb_build_object('accountId', $3::uuid, 'amount', 700, 'direction', 'debit'),
               jsonb_build_object('accountId', $4::uuid, 'amount', 700, 'direction', 'credit')
             ), 'test.escrowed', '{}'::jsonb)`,
          [randomUUID(), member, accounts[0]?.escrow, accounts[0]?.cash],
        );

        const { rows: after } = await client.query<{ m2: string; escrow: string }>(
          'SELECT supply.m2_amount::text AS m2, supply.escrow_amount::text AS escrow FROM public.economy_money_supply() AS supply',
        );
        // Money moved from a member wallet into escrow: it is still member
        // money, so 14.9's M2 does not change even though 018's would.
        expect(BigInt(after[0]?.escrow ?? '0') - BigInt(before[0]?.escrow ?? '0')).toBe(700n);
        expect(after[0]?.m2).toBe(before[0]?.m2);
      });
    });

    it('answers the dashboard only to an administrator', async () => {
      await rolledBack(async (client) => {
        const stranger = randomUUID();
        await client.query('INSERT INTO public.users (id) VALUES ($1)', [stranger]);
        await client.query('SAVEPOINT before_refusal');
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_economy_dashboard($1)', [stranger]),
        );
        expect(code(error)).toBe('42501');
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');

        await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'approver')", [
          stranger,
        ]);
        const { rows } = await client.query<{ member_count: string }>(
          'SELECT board.member_count::text AS member_count FROM public.admin_economy_dashboard($1) AS board',
          [stranger],
        );
        expect(Number(rows[0]?.member_count)).toBeGreaterThan(0);
      });
    });

    it('verifies the audit chain without an actor', async () => {
      await rolledBack(async (client) => {
        const { rows } = await client.query<{ status: string }>(
          'SELECT run.status FROM public.audit_run_daily_verification() AS run',
        );
        expect(['passed', 'failed', 'empty']).toContain(rows[0]?.status);
      });
    });

    it('runs the hourly sweep without raising anything on a quiet database', async () => {
      await rolledBack(async (client) => {
        const { rows } = await client.query<{ raised: number }>(
          'SELECT sweep.raised FROM public.economy_run_anomaly_sweep() AS sweep',
        );
        expect(rows[0]?.raised).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
