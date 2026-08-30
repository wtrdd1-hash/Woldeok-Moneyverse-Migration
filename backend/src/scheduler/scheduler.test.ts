import { describe, expect, it } from 'vitest';
import { Scheduler, type SchedulerJob } from './scheduler';

/**
 * The runner holds one decision -- which connection a job needs -- and one
 * behaviour worth testing without a database: a job that fails must still
 * close its window, or the next tick claims it again and the failure repeats
 * every five minutes forever.
 */
const silent = { log: () => {}, warn: () => {}, error: () => {} };

interface Call {
  sql: string;
  values: readonly unknown[];
}

function connection(handler: (sql: string, values: readonly unknown[]) => unknown[]) {
  const calls: Call[] = [];
  return {
    calls,
    query: async (sql: string, values?: readonly unknown[]) => {
      calls.push({ sql, values: values ?? [] });
      return { rows: handler(sql, values ?? []) as never[] };
    },
  };
}

const job: SchedulerJob = {
  job: 'test.job',
  cadence: 'daily',
  notBefore: 0,
  connection: 'app',
  statement: 'SELECT 1',
};

describe('the scheduler', () => {
  it('does nothing when the window is already claimed', async () => {
    const app = connection((sql) =>
      sql.includes('schedule_claim_run') ? [{ claimed: false, period_key: '2026-08-31' }] : [],
    );
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: [job],
    }).tick();

    expect(app.calls).toHaveLength(1);
    expect(app.calls[0]?.sql).toContain('schedule_claim_run');
  });

  it('closes the window as failed when the job throws', async () => {
    const app = connection((sql) => {
      if (sql.includes('schedule_claim_run')) return [{ claimed: true, period_key: '2026-08-31' }];
      if (sql === 'SELECT 1') throw new Error('the job blew up');
      return [];
    });
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: [job],
    }).tick();

    const finish = app.calls.find((call) => call.sql.includes('schedule_finish_run'));
    // Not left running: a window nobody closed is claimed forever, and one
    // that is retried every tick writes the same failure 288 times a day.
    expect(finish?.values[2]).toBe('failed');
    expect(String(finish?.values[3])).toContain('the job blew up');
  });

  it('skips a reconciler job when no reconciler credential was given', async () => {
    const app = connection(() => []);
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: [{ ...job, connection: 'reconciler' }],
    }).tick();

    // Not even claimed: claiming a window it cannot run would mark the day
    // done and skip it on the deployment that does have the credential.
    expect(app.calls).toHaveLength(0);
  });

  it('runs the work on the connection the job names', async () => {
    const app = connection((sql) =>
      sql.includes('schedule_claim_run') ? [{ claimed: true, period_key: '2026-08-31' }] : [],
    );
    const reconciler = connection(() => [{ integrity_ok: true }]);
    await new Scheduler({
      app: app as never,
      reconciler: reconciler as never,
      intervalMs: 1000,
      logger: silent,
      jobs: [{ ...job, connection: 'reconciler' }],
    }).tick();

    expect(reconciler.calls.map((call) => call.sql)).toStrictEqual(['SELECT 1']);
    expect(app.calls.some((call) => call.sql.includes('schedule_finish_run'))).toBe(true);
  });
});
