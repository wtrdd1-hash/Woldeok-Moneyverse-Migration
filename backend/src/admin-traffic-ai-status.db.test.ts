import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;


interface TrafficDashboardFixture {
  readonly granularity: 'day' | 'month' | 'year';
  readonly summary: { readonly pageViews: number; readonly uniqueSessions: number };
  readonly series: readonly unknown[];
  readonly sources: readonly { readonly source: string }[];
}

interface AiStatusFixture {
  readonly switchState: string;
  readonly operationalState: string;
  readonly modelReachability: string;
  readonly reviewCount: number;
  readonly shadowReviewCount: number;
  readonly latestShadowReview: Record<string, unknown> | null;
  readonly proposalState: {
    readonly eligible: boolean;
    readonly blockedBy: readonly string[];
    readonly minimumActiveSample: number;
  };
  readonly lastRuns: Record<string, unknown>;
  readonly agents: readonly unknown[];
  readonly shadowAgents: readonly unknown[];
  readonly prompt?: unknown;
  readonly proposal?: unknown;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('administrator traffic and AI status against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it.each([
    ['activity', 'SELECT * FROM public.user_activity_logs LIMIT 1'],
    ['AI shadow', 'SELECT * FROM public.economy_ai_shadow_reviews LIMIT 1'],
  ])('does not expose the raw %s table to the application role', async (_label, statement) => {
    const error = await rejectionOf(() => pool.query(statement));
    expect(errorCode(error)).toBe('42501');
    expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('read models', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    async function rolledBack(body: (client: PoolClient) => Promise<void>): Promise<void> {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    }

    async function user(client: PoolClient, admin = false): Promise<string> {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      if (admin) {
        await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'superadmin')", [id]);
      }
      return id;
    }

    it.each([
      ['activity logs', 'SELECT * FROM public.admin_activity_list_logs($1, 10, 0, NULL, NULL)'],
      ['traffic analytics', "SELECT public.admin_activity_traffic_dashboard($1, 'day', 7)"],
      ['AI status', 'SELECT public.admin_economy_ai_status($1)'],
    ])('rejects a normal member from %s', async (_label, statement) => {
      await rolledBack(async (client) => {
        const member = await user(client);
        const error = await rejectionOf(() => client.query(statement, [member]));
        expect(errorCode(error)).toBe('42501');
      });
    });

    it('aggregates day, month and year traffic and keeps only source hostnames', async () => {
      await rolledBack(async (client) => {
        const admin = await user(client, true);
        await client.query(
          `INSERT INTO public.user_activity_logs
            (user_id, session_id, event_type, path, metadata, created_at)
           VALUES
            ($1, 'qa-session-a', 'page_view', '/guide', '{"referrer":"https://www.google.com/search?q=moneyverse","country":"KR"}', clock_timestamp()),
            (NULL, 'qa-session-b', 'page_view', '/', '{"referrer":"https://discord.com/channels/123","country":"US"}', clock_timestamp()),
            (NULL, 'qa-session-b', 'page_view', '/shop', '{}', clock_timestamp())`,
          [admin],
        );
        for (const granularity of ['day', 'month', 'year'] as const) {
          const { rows } = await client.query<{ dashboard: TrafficDashboardFixture }>(
            'SELECT public.admin_activity_traffic_dashboard($1, $2, $3) AS dashboard',
            [admin, granularity, granularity === 'day' ? 30 : 12],
          );
          const dashboard = rows[0]!.dashboard;
          expect(dashboard.granularity).toBe(granularity);
          expect(dashboard.summary.pageViews).toBeGreaterThanOrEqual(3);
          expect(dashboard.summary.uniqueSessions).toBeGreaterThanOrEqual(2);
          expect(dashboard.series.length).toBeGreaterThan(0);
        }
        const { rows } = await client.query<{ dashboard: TrafficDashboardFixture }>(
          "SELECT public.admin_activity_traffic_dashboard($1, 'day', 30) AS dashboard",
          [admin],
        );
        const sources = rows[0]!.dashboard.sources.map((entry: { source: string }) => entry.source);
        expect(sources).toContain('www.google.com');
        expect(sources).toContain('discord.com');
        expect(sources.some((source: string) => source.includes('/search'))).toBe(false);
      });
    });

    it('reports truthful AI operational and shadow evidence without exposing raw proposals', async () => {
      await rolledBack(async (client) => {
        const admin = await user(client, true);
        await client.query(
          "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'economy_ai_policy_review'",
        );
        await client.query(
          `SELECT public.economy_record_ai_shadow_review(
             '{"eligible":false,"blockedBy":["sample too small"],"adjustments":[]}'::jsonb,
             'agree', 0.91, 'shadow path healthy', '[]'::jsonb,
             'qa-shadow', 'qa-v1',
             '[{"domain":"macro","seat":"A","stage":"independent","model":"qa-a","decision":"agree","confidence":0.91,"rationale":"ok","risks":[],"latencyMs":12,"totalTokens":24}]'::jsonb
           )`,
        );
        const { rows } = await client.query<{ status: AiStatusFixture }>(
          'SELECT public.admin_economy_ai_status($1) AS status',
          [admin],
        );
        const status = rows[0]!.status;
        expect(status.switchState).toBe('enabled');
        expect(status.operationalState).toBeTruthy();
        expect(status.modelReachability).toBe('healthy');
        expect(status.shadowReviewCount).toBeGreaterThanOrEqual(1);
        expect(status.latestShadowReview).not.toBeNull();
        expect(status.proposalState.minimumActiveSample).toBeGreaterThan(0);
        expect(Array.isArray(status.proposalState.blockedBy)).toBe(true);
        expect(Array.isArray(status.agents)).toBe(true);
        expect(Array.isArray(status.shadowAgents)).toBe(true);
        expect(status.lastRuns).toBeTruthy();
        expect(status).not.toHaveProperty('prompt');
        expect(status).not.toHaveProperty('proposal');
        expect(status.latestShadowReview).not.toHaveProperty('proposal');
        expect(status.latestShadowReview).not.toHaveProperty('council_evidence');

        await client.query(
          `INSERT INTO public.scheduled_job_runs
             (job, period_key, started_at, finished_at, status, detail)
           VALUES
             ('economy.ai_shadow_health', 'qa-failed', clock_timestamp(), clock_timestamp(), 'failed',
              '{"error":"qa model failure"}'::jsonb)`,
        );
        const { rows: failedRows } = await client.query<{ status: AiStatusFixture }>(
          'SELECT public.admin_economy_ai_status($1) AS status',
          [admin],
        );
        expect(failedRows[0]!.status.operationalState).toBe('failed');
      });
    });
  });
});
