import { describe, expect, it } from 'vitest';
import { SCHEDULER_JOBS, Scheduler, type SchedulerJob } from './scheduler';

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
  it('schedules non-authoritative AI shadow health daily after the metric snapshot window opens', () => {
    const shadow = SCHEDULER_JOBS.find((candidate) => candidate.job === 'economy.ai_shadow_health');
    expect(shadow).toMatchObject({
      cadence: 'daily',
      notBefore: 15,
      connection: 'app',
    });
    expect(shadow?.statement).toBeUndefined();
  });

  it('schedules work.auto_tune_policy hourly to rebalance caps and reward decay', () => {
    const autoTune = SCHEDULER_JOBS.find((candidate) => candidate.job === 'work.auto_tune_policy');
    expect(autoTune).toMatchObject({
      cadence: 'hourly',
      notBefore: 10,
      connection: 'app',
    });
    expect(autoTune?.statement).toBeUndefined();
  });

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

    expect(app.calls).toHaveLength(0);
  });

  it('runs a named handler instead of SQL for external jobs', async () => {
    const app = connection((sql) =>
      sql.includes('schedule_claim_run') ? [{ claimed: true, period_key: '2026-W38' }] : [],
    );
    let handled = 0;
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: [
        { job: 'economy.ai_policy_review', cadence: 'weekly', notBefore: 20, connection: 'app' },
      ],
      handlers: {
        'economy.ai_policy_review': async () => {
          handled += 1;
          return { reviewed: true, status: 'review_agree' };
        },
      },
    }).tick();

    expect(handled).toBe(1);
    const finish = app.calls.find((call) => call.sql.includes('schedule_finish_run'));
    expect(finish?.values[2]).toBe('succeeded');
    expect(String(finish?.values[3])).toContain('review_agree');
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

describe('bounded outbox retention cleanup', () => {
  const sweep = SCHEDULER_JOBS.find((candidate) => candidate.job === 'system.outbox_sweep');

  it('uses parameterized, ordered deletion batches instead of a whole-table delete', () => {
    expect(sweep).toMatchObject({
      cadence: 'daily',
      connection: 'app',
      batchLimit: 2000,
      maxBatches: 25,
    });
    expect(sweep?.statement).toContain('LIMIT $1');
    expect(sweep?.statement).toContain('ORDER BY delivered_at, id');
    expect(sweep?.statement).toContain('RETURNING 1');
  });

  it('commits short batches, stops when a batch is partial, and records totals', async () => {
    const batchCounts = ['2000', '2000', '17'];
    const app = connection((sql) => {
      if (sql.includes('schedule_claim_run')) return [{ claimed: true, period_key: '2026-10-14' }];
      if (sql.includes('WITH expired AS MATERIALIZED')) return [{ deleted: batchCounts.shift() }];
      return [];
    });
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: sweep ? [sweep] : [],
    }).tick();

    const deletes = app.calls.filter((call) => call.sql.includes('WITH expired AS MATERIALIZED'));
    expect(deletes).toHaveLength(3);
    expect(deletes.map((call) => call.values)).toStrictEqual([[2000], [2000], [2000]]);
    const finish = app.calls.find((call) => call.sql.includes('schedule_finish_run'));
    expect(finish?.values[2]).toBe('succeeded');
    expect(JSON.parse(String(finish?.values[3]))).toMatchObject({
      deleted: 4017,
      batches: 3,
      limitReached: false,
    });
  });

  it('caps the number of batches even when the queue has more expired records', async () => {
    const app = connection((sql) => {
      if (sql.includes('schedule_claim_run')) return [{ claimed: true, period_key: '2026-10-14' }];
      if (sql.includes('WITH expired AS MATERIALIZED')) return [{ deleted: '2000' }];
      return [];
    });
    await new Scheduler({
      app: app as never,
      reconciler: null,
      intervalMs: 1000,
      logger: silent,
      jobs: sweep ? [sweep] : [],
    }).tick();

    expect(
      app.calls.filter((call) => call.sql.includes('WITH expired AS MATERIALIZED')),
    ).toHaveLength(25);
    const finish = app.calls.find((call) => call.sql.includes('schedule_finish_run'));
    expect(finish?.values[2]).toBe('succeeded');
    expect(JSON.parse(String(finish?.values[3]))).toMatchObject({
      deleted: 50000,
      batches: 25,
      limitReached: true,
    });
  });
});
