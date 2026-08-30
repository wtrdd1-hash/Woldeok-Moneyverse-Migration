import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migrations 089-092, executed.
 *
 * The engine's whole risk is compounding: a rule that raises a price by 5% a
 * week is inside every bound in 15.4 and outside all of them by summer if it
 * multiplies last week's answer instead of the reference price. Most of what
 * is here is that one property, asked in several ways.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the automatic economy engine against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the engine tables away from the application role', async () => {
    for (const table of [
      'economy_policy_knobs',
      'economy_metric_snapshots',
      'economy_auto_policy_settings',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('proposing and applying', () => {
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

    const superadmin = async (client: PoolClient): Promise<string> => {
      const id = await member(client);
      await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'superadmin')", [
        id,
      ]);
      return id;
    };

    // Compared as numbers: a numeric column keeps the scale it was given, so
    // the same value reads as '100' when seeded and '105.00' after a rounded
    // adjustment, and neither is more correct than the other.
    const knob = async (client: PoolClient, key: string): Promise<number> => {
      const { rows } = await client.query<{ current_value: string }>(
        'SELECT current_value::text FROM public.economy_policy_knobs WHERE knob_key = $1',
        [key],
      );
      return Number(rows[0]?.current_value);
    };

    const clamp = async (client: PoolClient, key: string, desired: number): Promise<number> => {
      const { rows } = await client.query<{ clamped: string }>(
        'SELECT public.economy_clamp_knob($1, $2::numeric)::text AS clamped',
        [key, desired],
      );
      return Number(rows[0]?.clamped);
    };

    const essentialPrice = async (client: PoolClient): Promise<string> => {
      const { rows } = await client.query<{ base_price: string; baseline_price: string }>(
        `SELECT base_price::text, baseline_price::text FROM public.shop_catalog
         WHERE category = 'general' ORDER BY code LIMIT 1`,
      );
      return rows[0]?.base_price as string;
    };

    it('limits one change to the step and never leaves the approved range', async () => {
      await rolledBack(async (client) => {
        // The baseline is 400 and 15.3 allows 8% in one change.
        expect(await clamp(client, 'work.daily_cap', 100000)).toBe(432);
        expect(await clamp(client, 'work.daily_cap', 0)).toBe(368);

        // Near the ceiling the range wins over the step: 470 + 32 is 502 and
        // 15.4 stops at 120% of the baseline.
        await client.query(
          "UPDATE public.economy_policy_knobs SET current_value = 470 WHERE knob_key = 'work.daily_cap'",
        );
        expect(await clamp(client, 'work.daily_cap', 100000)).toBe(480);
      });
    });

    it('prices from the reference price, so applying twice is applying once', async () => {
      await rolledBack(async (client) => {
        const { rows: baseline } = await client.query<{ baseline_price: string }>(
          `SELECT baseline_price::text FROM public.shop_catalog
           WHERE category = 'general' ORDER BY code LIMIT 1`,
        );
        const reference = Number(baseline[0]?.baseline_price);
        expect(reference).toBeGreaterThan(0);

        const values = JSON.stringify({ 'shop.essential_price_percent': 105 });
        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [values]);
        const once = await essentialPrice(client);
        expect(Number(once)).toBe(Math.round(reference * 1.05));

        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [values]);
        expect(await essentialPrice(client)).toBe(once);
      });
    });

    it('ignores a value that is not a number rather than failing the sweep', async () => {
      await rolledBack(async (client) => {
        const before = await knob(client, 'work.daily_cap');
        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [
          JSON.stringify({ 'work.daily_cap': 'as much as possible', 'shop.supply_percent': null }),
        ]);
        expect(await knob(client, 'work.daily_cap')).toBe(before);
      });
    });

    it('applies a version when it becomes active, and again when a rollback restores it', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const { rows: baseline } = await client.query<{ baseline_price: string }>(
          `SELECT baseline_price::text FROM public.shop_catalog
           WHERE category = 'general' ORDER BY code LIMIT 1`,
        );
        const reference = Number(baseline[0]?.baseline_price);

        const version = async (name: string, percent: number): Promise<void> => {
          await client.query(
            `INSERT INTO public.economy_policies (
               version, effective_at, status, payload, origin, new_values, reason
             ) VALUES ($1, clock_timestamp(), 'approved', '{}'::jsonb, 'automatic', $2::jsonb, 'test')`,
            [name, JSON.stringify({ 'shop.essential_price_percent': percent })],
          );
          await client.query('SELECT public.economy_activate_due_policies()');
        };

        await version('test-up', 110);
        expect(Number(await essentialPrice(client))).toBe(Math.round(reference * 1.1));

        await version('test-down', 90);
        expect(Number(await essentialPrice(client))).toBe(Math.round(reference * 0.9));

        // Rollback restores the row, and the row is what the prices follow.
        await client.query('SELECT * FROM public.admin_rollback_economy_policy($1, $2, $3)', [
          randomUUID(),
          admin,
          'the second version was a mistake',
        ]);
        expect(Number(await essentialPrice(client))).toBe(Math.round(reference * 1.1));
      });
    });

    it('keeps the deposit rate inside what the accrual will accept', async () => {
      await rolledBack(async (client) => {
        await client.query(
          `UPDATE public.economy_policy_knobs SET current_value = -2
           WHERE knob_key = 'bank.deposit_rate_delta_bps'`,
        );
        const { rows } = await client.query<{ rate: number }>(
          'SELECT public.bank_auto_interest_rate_bps() AS rate',
        );
        expect(rows[0]?.rate).toBeGreaterThanOrEqual(1);
        expect(rows[0]?.rate).toBeLessThanOrEqual(10);
      });
    });

    it('measures a day once and can be asked again for the same day', async () => {
      await rolledBack(async (client) => {
        const { rows: first } = await client.query<{ recomputed: boolean }>(
          "SELECT recomputed FROM public.economy_record_metric_snapshot((now() AT TIME ZONE 'Asia/Seoul')::date - 1)",
        );
        expect(first[0]?.recomputed).toBe(false);

        const { rows: second } = await client.query<{ recomputed: boolean }>(
          "SELECT recomputed FROM public.economy_record_metric_snapshot((now() AT TIME ZONE 'Asia/Seoul')::date - 1)",
        );
        expect(second[0]?.recomputed).toBe(true);

        const { rows: count } = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.economy_metric_snapshots',
        );
        expect(count[0]?.count).toBe('1');
      });
    });

    it('refuses to measure a day that has not happened', async () => {
      await rolledBack(async (client) => {
        const error = await rejectionOf(() =>
          client.query(
            "SELECT * FROM public.economy_record_metric_snapshot((now() AT TIME ZONE 'Asia/Seoul')::date + 1)",
          ),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('says why it will not run, rather than running quietly', async () => {
      await rolledBack(async (client) => {
        const { rows } = await client.query<{ proposal: Record<string, unknown> }>(
          'SELECT public.economy_propose_policy_adjustment(7) AS proposal',
        );
        const proposal = rows[0]?.proposal as {
          eligible: boolean;
          blockedBy: string[];
        };
        expect(proposal.eligible).toBe(false);
        // Seeded disabled by 059 and still disabled until the 3 gates pass.
        expect(proposal.blockedBy.join(' ')).toMatch(/economy_auto_policy switch/);
        expect(proposal.blockedBy.join(' ')).toMatch(/missing daily metrics/);
      });
    });

    it('adjusts prices upward when a whole week burned less than it issued', async () => {
      await rolledBack(async (client) => {
        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_auto_policy'",
        );
        // Dates well in the past so no reconciliation snapshot this database
        // happens to hold can fall inside the window.
        for (let day = 1; day <= 7; day += 1) {
          await client.query(
            `INSERT INTO public.economy_metric_snapshots (
               metric_date, m2_amount, issued_amount, burned_amount, burn_to_issue_percent,
               work_issued_amount, work_issue_share_percent, new_member_count,
               new_member_median_holdings, top_decile_share_percent, bank_share_percent,
               active_member_count, trading_member_count, purchasing_member_count,
               sample_sufficient
             ) VALUES (
               DATE '2020-01-01' + $1::integer, 1000000, 10000, 2000, 20,
               3000, 30, 4, 5000, 40, 30, 40, 15, 12, true
             )`,
            [day],
          );
        }

        const { rows: baseline } = await client.query<{ baseline_price: string }>(
          `SELECT baseline_price::text FROM public.shop_catalog
           WHERE category = 'general' ORDER BY code LIMIT 1`,
        );
        const reference = Number(baseline[0]?.baseline_price);

        const { rows } = await client.query<{ result: Record<string, unknown> }>(
          'SELECT public.economy_run_auto_policy() AS result',
        );
        const result = rows[0]?.result as {
          applied: boolean;
          version: string;
          adjustments: { knob: string; to: number }[];
          blockedBy?: string[];
        };
        expect(result.blockedBy ?? [], JSON.stringify(result)).toEqual([]);
        expect(result.applied).toBe(true);
        expect(result.adjustments.map((entry) => entry.knob).sort()).toEqual([
          'business.operating_cost_percent',
          'shop.essential_price_percent',
          'shop.general_price_percent',
          'shop.maintenance_percent',
        ]);

        expect(await knob(client, 'shop.essential_price_percent')).toBe(105);
        expect(Number(await essentialPrice(client))).toBe(Math.round(reference * 1.05));

        // The version records what it read and what it changed, and is the
        // row a rollback would return to.
        const { rows: policy } = await client.query<{
          origin: string;
          new_values: Record<string, string>;
          source_metrics: Record<string, unknown>;
        }>(
          `SELECT origin, new_values, source_metrics FROM public.economy_policies
           WHERE version = $1`,
          [result.version],
        );
        expect(policy[0]?.origin).toBe('automatic');
        expect(policy[0]?.new_values['shop.essential_price_percent']).toBe(105);
        expect(policy[0]?.source_metrics['burnBelow50Days']).toBe(7);

        // 15.4: a policy is held for seven days, so a second run this week
        // changes nothing whichever refusal answers first.
        const { rows: again } = await client.query<{ result: { applied: boolean } }>(
          'SELECT public.economy_run_auto_policy() AS result',
        );
        expect(again[0]?.result.applied).toBe(false);
      });
    });

    it('leaves a knob alone once a superadmin takes it off automatic', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        await client.query('SELECT * FROM public.admin_set_policy_knob($1, $2, $3, $4, $5, $6, $7)', [
          randomUUID(),
          admin,
          'shop.essential_price_percent',
          false,
          null,
          null,
          'holding essential prices while the season event runs',
        ]);

        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_auto_policy'",
        );
        for (let day = 1; day <= 7; day += 1) {
          await client.query(
            `INSERT INTO public.economy_metric_snapshots (
               metric_date, m2_amount, issued_amount, burned_amount, burn_to_issue_percent,
               work_issued_amount, work_issue_share_percent, new_member_count,
               new_member_median_holdings, top_decile_share_percent, bank_share_percent,
               active_member_count, trading_member_count, purchasing_member_count,
               sample_sufficient
             ) VALUES (
               DATE '2020-01-01' + $1::integer, 1000000, 10000, 2000, 20,
               3000, 30, 4, 5000, 40, 30, 40, 15, 12, true
             )`,
            [day],
          );
        }

        const { rows } = await client.query<{ result: { adjustments: { knob: string }[] } }>(
          'SELECT public.economy_run_auto_policy() AS result',
        );
        expect(rows[0]?.result.adjustments.map((entry) => entry.knob)).not.toContain(
          'shop.essential_price_percent',
        );
        expect(await knob(client, 'shop.essential_price_percent')).toBe(100);
      });
    });

    it('refuses a knob change from anybody but the superadmin', async () => {
      await rolledBack(async (client) => {
        const stranger = await member(client);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_set_policy_knob($1, $2, $3, $4, $5, $6, $7)', [
            randomUUID(),
            stranger,
            'work.daily_cap',
            false,
            null,
            null,
            'I would like the rewards to stop moving',
          ]),
        );
        expect(code(error)).toBe('42501');
      });
    });

    it('refuses a range that does not contain the value in force', async () => {
      await rolledBack(async (client) => {
        const admin = await superadmin(client);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.admin_set_policy_knob($1, $2, $3, $4, $5, $6, $7)', [
            randomUUID(),
            admin,
            'work.daily_cap',
            null,
            500,
            600,
            'raising the floor above what is being paid today',
          ]),
        );
        expect(code(error)).toBe('22023');
        expect(String((error as { message?: string }).message)).toMatch(/outside the range/);
      });
    });
  });
});
