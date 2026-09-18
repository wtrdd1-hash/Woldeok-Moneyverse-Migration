import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from './testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

const jobSelection = [
  { jobType: 'developer', assignments: 70 },
  { jobType: 'trader', assignments: 5 },
  { jobType: 'entertainer', assignments: 5 },
  { jobType: 'detective', assignments: 5 },
  { jobType: 'miner', assignments: 5 },
  { jobType: 'farmer', assignments: 4 },
  { jobType: 'artisan', assignments: 3 },
  { jobType: 'civil_servant', assignments: 3 },
];

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)(
  'adaptive profession limits against a real database',
  () => {
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
    it('registers eight bounded profession knobs without changing the seeded limits', async () => {
      await rolledBack(async (client) => {
        const { rows: knobs } = await client.query<{ count: string }>(
          `SELECT count(*)::text AS count
           FROM public.economy_policy_knobs
           WHERE knob_key LIKE 'jobs.assignment_daily_limit_delta.%'
             AND auto_adjustable`,
        );
        expect(knobs[0]?.count).toBe('8');

        const { rows: tasks } = await client.query<{ mismatches: string; active_count: string }>(
          `SELECT count(*) FILTER (WHERE daily_limit <> baseline_daily_limit)::text AS mismatches,
                  count(*) FILTER (WHERE active)::text AS active_count
           FROM public.work_task_catalog
           WHERE job_type::text IN (
             'developer','trader','entertainer','detective',
             'miner','farmer','artisan','civil_servant'
           )`,
        );
        expect(tasks[0]?.mismatches).toBe('0');
        expect(Number(tasks[0]?.active_count)).toBeGreaterThanOrEqual(24);
      });
    });

    it('keeps tightening disabled by default and enforces a two-task floor when enabled', async () => {
      await rolledBack(async (client) => {
        const key = 'jobs.assignment_daily_limit_delta.developer';
        await client.query('SAVEPOINT tightening_disabled');
        await expect(
          client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [
            JSON.stringify({ [key]: -1 }),
          ]),
        ).rejects.toMatchObject({ code: '55000' });
        await client.query('ROLLBACK TO SAVEPOINT tightening_disabled');

        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_job_limit_tightening'",
        );
        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [
          JSON.stringify({ [key]: -1 }),
        ]);
        const { rows: tightened } = await client.query<{ ok: boolean; minimum: number }>(
          `SELECT bool_and(daily_limit = greatest(2, baseline_daily_limit - 1)) AS ok,
                  min(daily_limit)::integer AS minimum
           FROM public.work_task_catalog WHERE job_type = 'developer'::public.work_job_type`,
        );
        expect(tightened[0]?.ok).toBe(true);
        expect(tightened[0]?.minimum).toBeGreaterThanOrEqual(2);

        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [
          JSON.stringify({ [key]: 0 }),
        ]);
        const { rows: restored } = await client.query<{ ok: boolean }>(
          `SELECT bool_and(daily_limit = greatest(2, baseline_daily_limit)) AS ok
           FROM public.work_task_catalog WHERE job_type = 'developer'::public.work_job_type`,
        );
        expect(restored[0]?.ok).toBe(true);
      });
    });
    const seedMetrics = async (
      client: PoolClient,
      selection: readonly { jobType: string; assignments: number }[] = jobSelection,
    ): Promise<void> => {
      await client.query(
        "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_auto_policy'",
      );
      for (let day = 0; day < 7; day += 1) {
        await client.query(
          `INSERT INTO public.economy_metric_snapshots (
             metric_date, m2_amount, issued_amount, burned_amount, burn_to_issue_percent,
             work_issued_amount, work_issue_share_percent, new_member_count,
             new_member_median_holdings, top_decile_share_percent, bank_share_percent,
             active_member_count, trading_member_count, purchasing_member_count,
             job_selection, sample_sufficient
           ) VALUES (
             DATE '1994-04-01' + $1::integer, 1000000, 10000, 7000, 70,
             8000, 80, 5, 5000, 40, 30, 40, 12, 10, $2::jsonb, true
           )`,
          [day, JSON.stringify(selection)],
        );
      }
    };

    it('uses repeat-decay soft control before tightening a dominant profession', async () => {
      await rolledBack(async (client) => {
        await seedMetrics(client);
        await client.query(
          "UPDATE public.economy_policy_knobs SET current_value = 20 WHERE knob_key = 'work.repeat_decay_percent'",
        );
        const { rows: first } = await client.query<{
          proposal: { adjustments: { knob: string }[] };
        }>('SELECT public.economy_propose_policy_adjustment(7) AS proposal');
        const firstKnobs = first[0]!.proposal.adjustments.map((entry) => entry.knob);
        expect(firstKnobs).toContain('work.repeat_decay_percent');
        expect(firstKnobs).not.toContain('jobs.assignment_daily_limit_delta.developer');

        await client.query(
          "UPDATE public.economy_policy_knobs SET current_value = 25 WHERE knob_key = 'work.repeat_decay_percent'",
        );
        const { rows: guarded } = await client.query<{
          proposal: { adjustments: { knob: string; to: number }[] };
        }>('SELECT public.economy_propose_policy_adjustment(7) AS proposal');
        expect(guarded[0]!.proposal.adjustments).not.toContainEqual(
          expect.objectContaining({ knob: 'jobs.assignment_daily_limit_delta.developer', to: -1 }),
        );

        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_job_limit_tightening'",
        );
        const { rows: enabled } = await client.query<{
          proposal: { adjustments: { knob: string; to: number }[] };
        }>('SELECT public.economy_propose_policy_adjustment(7) AS proposal');
        expect(enabled[0]!.proposal.adjustments).toContainEqual(
          expect.objectContaining({ knob: 'jobs.assignment_daily_limit_delta.developer', to: -1 }),
        );
      });
    });
    it('automatically relaxes a restrictive profession delta after concentration clears', async () => {
      await rolledBack(async (client) => {
        const balanced = [
          { jobType: 'developer', assignments: 20 },
          { jobType: 'trader', assignments: 14 },
          { jobType: 'entertainer', assignments: 13 },
          { jobType: 'detective', assignments: 12 },
          { jobType: 'miner', assignments: 11 },
          { jobType: 'farmer', assignments: 10 },
          { jobType: 'artisan', assignments: 10 },
          { jobType: 'civil_servant', assignments: 10 },
        ];
        await seedMetrics(client, balanced);
        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_job_limit_tightening'",
        );
        await client.query('SELECT public.economy_apply_policy_values($1::jsonb)', [
          JSON.stringify({ 'jobs.assignment_daily_limit_delta.developer': -1 }),
        ]);

        const { rows } = await client.query<{
          evidence: { adjustments: { knob: string; to: number; rules: string[] }[] };
        }>('SELECT public.economy_profession_limit_adjustments(7) AS evidence');
        expect(rows[0]!.evidence.adjustments).toContainEqual(
          expect.objectContaining({
            knob: 'jobs.assignment_daily_limit_delta.developer',
            to: 0,
            rules: ['profession_recovered_relax_limit'],
          }),
        );
      });
    });
  },
);
