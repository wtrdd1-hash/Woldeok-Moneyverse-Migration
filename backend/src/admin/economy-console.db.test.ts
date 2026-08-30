import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';

/**
 * Migrations 084 and 087, executed, from the angle the economy console
 * depends on.
 *
 * Two properties carry most of the weight. The functions must be *reachable*
 * by `moneyverse_app` -- a refusal that says "permission denied for function"
 * is a lost GRANT and would take every route in this module to a 500 in
 * production while every unit test kept passing. And
 * `admin_economy_dashboard` must return exactly one row on an economy where
 * nothing has happened yet: a zero-row read would make the route answer 200
 * with an empty body, which a screen cannot tell apart from a healthy economy
 * holding nothing.
 *
 * Skips without DATABASE_URL. CI is the only place any of this runs.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

/** Every OUT parameter of `admin_economy_dashboard`, in the order 087 lists them. */
const DASHBOARD_COLUMNS = [
  'm2_amount',
  'member_cash_amount',
  'member_bank_amount',
  'escrow_amount',
  'net_mint_issuance_amount',
  'sink_absorbed_amount',
  'issued_1h',
  'issued_24h',
  'issued_7d',
  'burned_24h',
  'net_issued_24h',
  'top_holder_share',
  'member_count',
  'reconciliation_ok',
  'reconciliation_at',
  'failed_outbox_count',
  'open_alert_count',
  'running_job_count',
] as const;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the economy console against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the payout record out of the application role', async () => {
    for (const table of ['admin_bulk_payouts', 'admin_bulk_payout_items', 'admin_alerts']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(
        String((error as { message?: string }).message),
        `${table} must be reachable only through a function`,
      ).toMatch(/permission denied/i);
    }
  });

  /**
   * The refusals below are the security model working, and every one of them
   * must be a *role* refusal rather than a lost GRANT. Both arrive as 42501
   * and only the message separates them, which is why `isMissingGrant` exists
   * and why asserting the code alone would not be enough.
   */
  it('lets the application role reach every function this module calls', async () => {
    const attempts: readonly (readonly [string, () => Promise<unknown>])[] = [
      [
        'admin_economy_dashboard',
        () => pool.query('SELECT * FROM public.admin_economy_dashboard($1)', [UNKNOWN]),
      ],
      [
        'admin_list_alerts',
        () => pool.query('SELECT * FROM public.admin_list_alerts($1, 30)', [UNKNOWN]),
      ],
      [
        'admin_acknowledge_alert',
        () =>
          pool.query('SELECT public.admin_acknowledge_alert($1, $2, $3)', [
            UNKNOWN,
            UNKNOWN,
            'acknowledging an alert that belongs to nobody',
          ]),
      ],
      [
        'admin_preview_bulk_payout',
        () =>
          pool.query('SELECT * FROM public.admin_preview_bulk_payout($1, $2::jsonb, 100)', [
            UNKNOWN,
            '{}',
          ]),
      ],
      [
        'admin_execute_bulk_payout',
        () =>
          pool.query('SELECT * FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4)', [
            randomUUID(),
            UNKNOWN,
            '{}',
            'a batch nobody is authorised to run',
          ]),
      ],
      [
        'admin_bulk_payout_report',
        () =>
          pool.query('SELECT * FROM public.admin_bulk_payout_report($1, $2)', [UNKNOWN, UNKNOWN]),
      ],
    ];

    for (const [name, attempt] of attempts) {
      const error = await rejectionOf(attempt);
      expect(error, `${name} refused nobody at all`).not.toBeNull();
      expect(isMissingGrant(error), `${name} is missing its GRANT EXECUTE`).toBe(false);
      expect(code(error), `${name} refused with the wrong code`).toBe('42501');
    }
  });

  /**
   * The bound the repository mirrors. 084 checks the amount before it checks
   * the role, so this holds for a caller who is nobody -- and if the order
   * ever reverses, this test says so rather than the operator finding out
   * that a typo reads as a permission problem.
   */
  it('refuses an amount outside 1 to 1000000 before it asks who is calling', async () => {
    for (const amount of [0, -1, 1_000_001]) {
      const error = await rejectionOf(() =>
        pool.query('SELECT * FROM public.admin_preview_bulk_payout($1, $2::jsonb, $3::bigint)', [
          UNKNOWN,
          '{}',
          amount,
        ]),
      );
      expect(code(error), `${amount} was not refused as an invalid amount`).toBe('22023');
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('paying and acknowledging', () => {
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

    const member = async (client: PoolClient, withWallet = true): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      if (withWallet) {
        await client.query(
          `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)`,
          [id],
        );
        await client.query(
          `INSERT INTO public.account_balances (account_id)
           SELECT account_row.id FROM public.accounts AS account_row
           WHERE account_row.owner_user_id = $1`,
          [id],
        );
      }
      return id;
    };

    const roled = async (client: PoolClient, role: string): Promise<string> => {
      const id = await member(client);
      await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [
        id,
        role,
      ]);
      return id;
    };

    const raise = async (client: PoolClient, summary: string): Promise<string> => {
      const dedupe = randomUUID();
      await client.query(
        `SELECT public.admin_raise_alert('economy.console.test', 'warning', $1, $2, '{}'::jsonb)`,
        [summary, dedupe],
      );
      const { rows } = await client.query<{ id: string }>(
        `SELECT id::text FROM public.admin_alerts
         WHERE kind = 'economy.console.test' AND dedupe_key = $1`,
        [dedupe],
      );
      return rows[0]?.id as string;
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

    it('answers the dashboard with one row and every column the console reads', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        const { rows } = await client.query<Record<string, unknown>>(
          'SELECT * FROM public.admin_economy_dashboard($1)',
          [approver],
        );
        // A zero-row read here would make the route answer 200 with an empty
        // body, and a screen cannot tell that apart from an idle economy.
        expect(rows).toHaveLength(1);
        for (const column of DASHBOARD_COLUMNS) {
          expect(Object.keys(rows[0] ?? {}), `the dashboard lost ${column}`).toContain(column);
        }
      });
    });

    it('follows its own alerts in the open count', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        const open = async (): Promise<bigint> => {
          const { rows } = await client.query<{ open_alert_count: string }>(
            `SELECT board.open_alert_count::text AS open_alert_count
             FROM public.admin_economy_dashboard($1) AS board`,
            [approver],
          );
          return BigInt(rows[0]?.open_alert_count ?? '0');
        };

        const before = await open();
        const alert = await raise(client, 'issuance ran ahead of the week for the console test');
        expect(await open()).toBe(before + 1n);

        const { rows: acknowledged } = await client.query<{ acknowledged: boolean }>(
          'SELECT public.admin_acknowledge_alert($1, $2, $3) AS acknowledged',
          [approver, alert, 'read the ledger and the spike is a seeded batch'],
        );
        expect(acknowledged[0]?.acknowledged).toBe(true);
        expect(await open(), 'an acknowledged alert must leave the open count').toBe(before);
      });
    });

    it('acknowledges once, and says so plainly the second time', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        const alert = await raise(client, 'a second press must change nothing');
        const acknowledge = async (id: string): Promise<boolean> => {
          const { rows } = await client.query<{ acknowledged: boolean }>(
            'SELECT public.admin_acknowledge_alert($1, $2, $3) AS acknowledged',
            [approver, id, 'acknowledged during the economy console test'],
          );
          return rows[0]?.acknowledged as boolean;
        };

        expect(await acknowledge(alert)).toBe(true);
        expect(await acknowledge(alert), 'the second press must not re-acknowledge').toBe(false);
        // The same false answers for an alert that does not exist. The
        // function draws no line between the two and neither does the route.
        expect(await acknowledge(UNKNOWN)).toBe(false);
      });
    });

    it('refuses an acknowledgement from a member with no administrative role', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        const stranger = await member(client);
        const alert = await raise(client, 'a member must not be able to clear this');

        await client.query('SAVEPOINT before_refusal');
        const error = await rejectionOf(() =>
          client.query('SELECT public.admin_acknowledge_alert($1, $2, $3)', [
            stranger,
            alert,
            'clearing an alert I have no standing to clear',
          ]),
        );
        expect(code(error)).toBe('42501');
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');

        const { rows } = await client.query<{ acknowledged: boolean }>(
          'SELECT public.admin_acknowledge_alert($1, $2, $3) AS acknowledged',
          [approver, alert, 'acknowledged by somebody who holds the role'],
        );
        expect(rows[0]?.acknowledged).toBe(true);
      });
    });

    it('lists what is still open ahead of what has been dealt with', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        // Everything already open in this database is cleared first, so the
        // ordering under test is about these two rows and not about however
        // many alerts the fixtures happen to carry. Rolled back with the rest.
        await client.query(
          `UPDATE public.admin_alerts SET acknowledged_at = pg_catalog.clock_timestamp()
           WHERE acknowledged_at IS NULL`,
        );

        const older = await raise(client, 'the older alert, left open');
        const newer = await raise(client, 'the newer alert, acknowledged');
        await client.query('SELECT public.admin_acknowledge_alert($1, $2, $3)', [
          approver,
          newer,
          'dealt with immediately during the console test',
        ]);

        const { rows } = await client.query<{ alert_id: string }>(
          'SELECT alert.alert_id::text AS alert_id FROM public.admin_list_alerts($1, 200) AS alert',
          [approver],
        );
        const positions = rows.map((row) => row.alert_id);
        expect(positions[0], 'an open alert must be the first thing an operator sees').toBe(older);
        expect(positions.indexOf(newer)).toBeGreaterThan(0);
      });
    });

    it('clamps the alert limit rather than refusing it', async () => {
      await rolledBack(async (client) => {
        const approver = await roled(client, 'approver');
        await raise(client, 'one alert is enough to prove the limit is honoured');
        for (const limit of [0, -5, null, 100000]) {
          const { rows } = await client.query(
            'SELECT * FROM public.admin_list_alerts($1, $2::integer)',
            [approver, limit],
          );
          expect(rows.length, `a limit of ${limit} was not clamped`).toBeGreaterThanOrEqual(1);
          expect(rows.length).toBeLessThanOrEqual(200);
        }
      });
    });

    /**
     * The case the controller maps to 403. A batch key is a receipt, and the
     * second administrator to send it is not being told "already done" -- they
     * are being told the receipt is not theirs, which is a different fact and
     * the only one that stops one operator reading another's payout.
     *
     * The second caller is an approver rather than a second superadmin: 057
     * indexes the superadmin designation to exactly one row, and 084 checks
     * who owns the receipt before it checks who may run a batch at all. That
     * order is what this asserts -- the refusal must name the receipt, not
     * the role.
     */
    it('refuses a batch key that belongs to another administrator', async () => {
      await rolledBack(async (client) => {
        const first = await roled(client, 'superadmin');
        const second = await roled(client, 'approver');
        const paid = await member(client);
        const filter = JSON.stringify({ userIds: [paid] });
        const key = randomUUID();

        await client.query(
          `SELECT * FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4)`,
          [key, first, filter, 'the first administrator ran this batch'],
        );

        await client.query('SAVEPOINT before_refusal');
        const error = await rejectionOf(() =>
          client.query(
            `SELECT * FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4)`,
            [key, second, filter, 'a second administrator reusing the same key'],
          ),
        );
        expect(code(error)).toBe('28000');
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');

        expect(await cash(client, paid), 'the refused retry must not have paid again').toBe('100');
      });
    });

    /**
     * 14.9 asks for a record of which targets succeeded, which failed and
     * which were excluded, each with a reason. The counts alone are a summary
     * line; these rows are the record, and the console has no other way to
     * show a member why they were left out.
     */
    it('reports an outcome for every target, with the reason a member was left out', async () => {
      await rolledBack(async (client) => {
        const admin = await roled(client, 'superadmin');
        const paid = await member(client);
        const walletless = await member(client, false);
        const filter = JSON.stringify({ userIds: [paid, walletless] });

        const { rows: batch } = await client.query<{
          payout_id: string;
          paid_count: number;
          skipped_count: number;
        }>(
          `SELECT result.payout_id::text AS payout_id, result.paid_count, result.skipped_count
           FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 250, $4) AS result`,
          [randomUUID(), admin, filter, 'a grant for everybody who worked this month'],
        );
        expect(batch[0]?.paid_count).toBe(1);
        expect(batch[0]?.skipped_count).toBe(1);

        const { rows: report } = await client.query<{
          user_id: string;
          outcome: string;
          detail: string;
          transaction_id: string | null;
        }>(
          `SELECT item.user_id::text AS user_id, item.outcome, item.detail,
                  item.transaction_id::text AS transaction_id
           FROM public.admin_bulk_payout_report($1, $2) AS item`,
          [admin, batch[0]?.payout_id],
        );
        expect(report).toHaveLength(2);

        const paidRow = report.find((row) => row.user_id === paid);
        const skippedRow = report.find((row) => row.user_id === walletless);
        expect(paidRow?.outcome).toBe('paid');
        expect(typeof paidRow?.transaction_id, 'a paid row must name the ledger entry').toBe(
          'string',
        );
        expect(skippedRow?.outcome).toBe('skipped');
        expect(skippedRow?.detail).toContain('no active cash account');
        expect(await cash(client, paid)).toBe('250');
      });
    });

    it('shows the payout report only to an administrator', async () => {
      await rolledBack(async (client) => {
        const admin = await roled(client, 'superadmin');
        const stranger = await member(client);
        const target = await member(client);
        const { rows } = await client.query<{ payout_id: string }>(
          `SELECT result.payout_id::text AS payout_id
           FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, 100, $4) AS result`,
          [
            randomUUID(),
            admin,
            JSON.stringify({ userIds: [target] }),
            'a batch whose report a member must not read',
          ],
        );

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_bulk_payout_report($1, $2)', [
            stranger,
            rows[0]?.payout_id,
          ]),
        );
        expect(code(error)).toBe('42501');
      });
    });
  });
});
