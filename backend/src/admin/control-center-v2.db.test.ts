import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 125, executed: the control centre's functions decide who may act.
 *
 * 117 granted them to the application role without asking who was calling
 * and without revoking them from PUBLIC. What is asserted here is the part a
 * unit test cannot see: the refusal comes from the function, the audit row
 * is written, and no other principal on the cluster can call the levers.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the control centre against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the policy row and the banking tables unreadable by the application role', async () => {
    for (const table of ['admin_economy_policy_v2', 'virtual_bank_bonds', 'virtual_bank_deposit_trackers']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('grants the levers to the application role and to nobody else', async () => {
    const signatures = [
      'public.admin_toggle_killswitch(text, boolean, uuid)',
      'public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid)',
      'public.admin_inspect_user_assets_v2(uuid, uuid)',
      'public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid)',
      'public.auth_bind_bootstrap_google_admin(text, text, uuid)',
    ];
    const { rows } = await pool.query<{ signature: string; app: boolean; other: boolean }>(
      `SELECT signature,
              has_function_privilege('moneyverse_app', signature, 'EXECUTE') AS app,
              has_function_privilege('moneyverse_status_collector', signature, 'EXECUTE') AS other
       FROM unnest($1::text[]) AS signature`,
      [signatures],
    );
    const held = new Map(rows.map((row) => [row.signature, row]));
    for (const signature of signatures.slice(0, 4)) {
      expect(held.get(signature)?.app, `${signature} for the application`).toBe(true);
      // The status collector stands in for PUBLIC: any other login principal.
      expect(held.get(signature)?.other, `${signature} for another principal`).toBe(false);
    }
    // Unused, and it hands out the superadmin designation by e-mail.
    expect(held.get(signatures[4]!)?.app).toBe(false);
  });

  it('refuses every lever to a caller with no role, from inside the function', async () => {
    const toggle = await rejectionOf(() =>
      pool.query('SELECT public.admin_toggle_killswitch($1, $2, $3::uuid)', ['market', true, UNKNOWN]),
    );
    expect(code(toggle)).toBe('42501');
    const knobs = await rejectionOf(() =>
      pool.query('SELECT public.admin_update_economic_knobs_v2($1,$2,$3,$4,$5::uuid)', [5, 300, 1500, 10, UNKNOWN]),
    );
    expect(code(knobs)).toBe('42501');
    const inspect = await rejectionOf(() =>
      pool.query('SELECT public.admin_inspect_user_assets_v2($1::uuid, $2::uuid)', [UNKNOWN, UNKNOWN]),
    );
    expect(code(inspect)).toBe('42501');
    const override = await rejectionOf(() =>
      pool.query('SELECT public.admin_override_user_asset_v2($1::uuid,$2,$3::bigint,$4,$5,$6::uuid,$7::uuid)', [
        UNKNOWN, 'cash', 100, 'credit_grant', 'a stranger moving money', UNKNOWN, randomUUID(),
      ]),
    );
    expect(code(override)).toBe('42501');
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('who may act, and what is recorded', () => {
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
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row WHERE account_row.owner_user_id = $1`,
        [id],
      );
      return id;
    };

    const roled = async (client: PoolClient, role: string): Promise<string> => {
      const id = await member(client);
      await client.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [id, role]);
      return id;
    };

    const cash = async (client: PoolClient, actor: string): Promise<string> => {
      const { rows } = await client.query<{ available_amount: string }>(
        `SELECT balance_row.available_amount::text
         FROM public.account_balances AS balance_row
         JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
         WHERE account_row.owner_user_id = $1 AND account_row.account_type = 'USER_CASH'::public.account_type`,
        [actor],
      );
      return rows[0]?.available_amount ?? '0';
    };

    it('refuses the money lever and the kill switch to an operator, and lets the superadmin through with an audit row', async () => {
      await rolledBack(async (client) => {
        const operator = await roled(client, 'operator');
        const superadmin = await roled(client, 'superadmin');
        const target = await member(client);

        // A refusal aborts the transaction the fixture lives in, so each
        // expected one is bracketed by a savepoint (as economy-console does).
        await client.query('SAVEPOINT operator_money');
        const refused = await rejectionOf(() =>
          client.query('SELECT public.admin_override_user_asset_v2($1::uuid,$2,$3::bigint,$4,$5,$6::uuid,$7::uuid)', [
            target, 'cash', 500, 'credit_grant', 'operator trying the money lever', operator, randomUUID(),
          ]),
        );
        expect(code(refused)).toBe('42501');
        await client.query('ROLLBACK TO SAVEPOINT operator_money');

        await client.query('SAVEPOINT operator_switch');
        const refusedSwitch = await rejectionOf(() =>
          client.query('SELECT public.admin_toggle_killswitch($1, $2, $3::uuid)', ['market', true, operator]),
        );
        expect(code(refusedSwitch)).toBe('42501');
        await client.query('ROLLBACK TO SAVEPOINT operator_switch');

        const key = randomUUID();
        const { rows } = await client.query<{ result: { success: boolean; new_balance: number } }>(
          'SELECT public.admin_override_user_asset_v2($1::uuid,$2,$3::bigint,$4,$5,$6::uuid,$7::uuid) AS result',
          [target, 'cash', 500, 'credit_grant', 'superadmin granting for the test', superadmin, key],
        );
        expect(rows[0]?.result.success).toBe(true);
        expect(await cash(client, target)).toBe('500');

        const audit = await client.query<{ action: string; target_id: string; request_id: string }>(
          `SELECT action, target_id::text, request_id::text FROM public.audit_logs
           WHERE actor_user_id = $1 AND action = 'economy.asset.overridden'`,
          [superadmin],
        );
        expect(audit.rows).toEqual([{ action: 'economy.asset.overridden', target_id: target, request_id: key }]);
      });
    });

    it('lets an operator inspect a member but not reprice the economy', async () => {
      await rolledBack(async (client) => {
        const operator = await roled(client, 'operator');
        const target = await member(client);
        const { rows } = await client.query<{ result: { user_id: string } }>(
          'SELECT public.admin_inspect_user_assets_v2($1::uuid, $2::uuid) AS result',
          [operator, target],
        );
        expect(rows[0]?.result.user_id).toBe(target);
        await client.query('SAVEPOINT operator_knobs');
        const refused = await rejectionOf(() =>
          client.query('SELECT public.admin_update_economic_knobs_v2($1,$2,$3,$4,$5::uuid)', [5, 300, 1500, 10, operator]),
        );
        expect(code(refused)).toBe('42501');
        await client.query('ROLLBACK TO SAVEPOINT operator_knobs');
      });
    });

    it('records the knobs before and after, and the switch it threw', async () => {
      await rolledBack(async (client) => {
        const superadmin = await roled(client, 'superadmin');
        await client.query('SELECT public.admin_update_economic_knobs_v2($1,$2,$3,$4,$5::uuid)', [7, 300, 1500, 10, superadmin]);
        await client.query('SELECT public.admin_toggle_killswitch($1, $2, $3::uuid)', ['market', true, superadmin]);
        const audit = await client.query<{ action: string; metadata: Record<string, unknown> }>(
          `SELECT action, metadata FROM public.audit_logs WHERE actor_user_id = $1 ORDER BY created_at`,
          [superadmin],
        );
        expect(audit.rows.map((row) => row.action)).toEqual(['economy.knobs.updated', 'economy.killswitch.toggled']);
        expect(audit.rows[0]?.metadata).toMatchObject({ to: { depositBps: 7 } });
        expect(audit.rows[1]?.metadata).toMatchObject({ scope: 'market', active: true });
      });
    });
  });
});
