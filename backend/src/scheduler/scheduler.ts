import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

/**
 * The periodic work, driven by windows rather than by timers.
 *
 * Every tick asks the database whether this job's current window is
 * unclaimed. The claim is an INSERT against a primary key, so a restart that
 * missed 04:00 catches the window up on the next tick, two processes cannot
 * both run it, and a job that has already run today costs one cheap query.
 *
 * The runner deliberately holds no schedule arithmetic: `schedule_claim_run`
 * decides what window it is in Asia/Seoul, and the job bodies are SQL. What
 * is left here is which connection each job needs, and that is the one thing
 * that cannot live in the database -- reconciliation must run as
 * `moneyverse_reconciler`, because 018 checks the session's login role
 * precisely so that the web role cannot write a snapshot.
 */
export interface SchedulerJob {
  readonly job: string;
  readonly cadence: 'hourly' | 'daily' | 'weekly' | 'monthly';
  /** Minutes into the window before the job may start. */
  readonly notBefore: number;
  readonly connection: 'app' | 'reconciler';
  readonly statement?: string;
}

export const SCHEDULER_JOBS: readonly SchedulerJob[] = [
  {
    job: 'economy.anomaly_sweep',
    cadence: 'hourly',
    notBefore: 5,
    connection: 'app',
    statement: 'SELECT sweep.raised FROM public.economy_run_anomaly_sweep() AS sweep',
  },
  {
    // Evaluates rolling 24h work faucet/sink metrics & cap usage, auto-tuning caps & repeat decay
    job: 'work.auto_tune_policy',
    cadence: 'hourly',
    notBefore: 10,
    connection: 'app',
  },
  {
    job: 'audit.chain_verification',
    cadence: 'daily',
    notBefore: 0,
    connection: 'app',
    statement:
      'SELECT run.status, run.checked_count::text AS checked_count FROM public.audit_run_daily_verification() AS run',
  },
  {
    // Measures yesterday, so it has to have run before the weekly proposal
    // half an hour later reads the week it closes.
    job: 'economy.metric_snapshot',
    cadence: 'daily',
    notBefore: 0,
    connection: 'app',
    statement:
      'SELECT snapshot.snapshot_date::text AS snapshot_date, snapshot.sample_ok FROM public.economy_record_metric_snapshot() AS snapshot',
  },
  {
    // `progression_refresh` is the only writer of `user_progression`, and
    // until this its only caller was a button on the member's own page --
    // so the stage screen, the engagement dashboard's next unlock and the
    // bulk payout's stage filter all answered "not calculated yet" for
    // everybody who had never pressed it. A stage is a consequence of
    // activity that already happened; it belongs on a clock.
    job: 'progression.refresh',
    cadence: 'daily',
    notBefore: 0,
    connection: 'app',
    statement: 'SELECT public.progression_refresh_all()::text AS refreshed',
  },
  {
    // Without this nothing ever sets a loan to `overdue`. 076 added the
    // status, 078 added the sweep that applies it, and 077 records a
    // `maturity_at` on every new loan -- but the sweep had no caller, so a
    // loan stayed `active` past its maturity for ever and the distinction the
    // borrower is shown was decorative. Daily, because a maturity is a date.
    job: 'bank.loan_maturity',
    cadence: 'daily',
    notBefore: 0,
    connection: 'app',
    statement: 'SELECT public.bank_mark_overdue_loans()::text AS marked',
  },
  {
    // 17.4 prices every vehicle and lease by the week, and 075 shipped the
    // `maintenance_cost` column and the receipts table with no function that
    // writes one -- so the 주간 관리비 on a card was a figure nothing ever
    // charged. 104 is the charge; this is what calls it. Weekly at 04:30 KST,
    // the same boundary `shop_charge_weekly_upkeep` computes its receipt week
    // from, so the week the runner claims is the week the receipt is dated.
    job: 'shop.weekly_upkeep',
    cadence: 'weekly',
    notBefore: 30,
    connection: 'app',
    statement:
      'SELECT upkeep.charged_count, upkeep.unpaid_count, upkeep.suspended_count, upkeep.failed_count, upkeep.charged_amount::text AS charged_amount FROM public.shop_charge_weekly_upkeep() AS upkeep',
  },
  {
    // Opt-in automatic fictional-stock scenario generation/publication.
    job: 'stock.ai_scenario_auto',
    cadence: 'hourly',
    notBefore: 25,
    connection: 'app',
  },
  {
    // A daily shadow run proves the configured models are actually reachable
    // even when sample sufficiency blocks policy. It writes only shadow
    // evidence and therefore cannot authorize an automatic economy change.
    job: 'economy.ai_shadow_health',
    cadence: 'daily',
    notBefore: 15,
    connection: 'app',
  },
  {
    // The learned lane reviews the exact eligible classical proposal first.
    // It does not write policy; 200 stores only an append-only review keyed by
    // the proposal hash. Ten minutes leaves room for a slow local model before
    // the deterministic weekly policy window opens.
    job: 'economy.ai_policy_review',
    cadence: 'weekly',
    notBefore: 20,
    connection: 'app',
  },
  {
    // 15.2: Monday 04:30 KST. The dual wrapper preserves the 092 engine and
    // only blocks it when a fresh AI review vetoes this exact proposal.
    job: 'economy.auto_policy',
    cadence: 'weekly',
    notBefore: 30,
    connection: 'app',
    statement: 'SELECT public.economy_run_dual_auto_policy() AS result',
  },
  {
    // Prunes virtual stock price ticks older than 24 hours to prevent table/index bloat.
    job: 'stock.ticks_cleanup',
    cadence: 'daily',
    notBefore: 10,
    connection: 'app',
    statement:
      "WITH deleted AS (DELETE FROM public.virtual_stock_price_ticks WHERE recorded_at < now() - interval '24 hours' RETURNING 1) SELECT count(*)::text AS pruned_ticks FROM deleted",
  },
  {
    // Cleans up delivered outbox events older than 7 days, maintaining lightweight delivery queue indexes.
    job: 'system.outbox_sweep',
    cadence: 'daily',
    notBefore: 5,
    connection: 'app',
    statement:
      "WITH deleted AS (DELETE FROM public.outbox_events WHERE delivered_at IS NOT NULL AND delivered_at < now() - interval '7 days' RETURNING 1) SELECT count(*)::text AS pruned_events FROM deleted",
  },
  {
    job: 'economy.reconciliation',
    cadence: 'daily',
    notBefore: 0,
    connection: 'reconciler',
    statement:
      'SELECT check_row.integrity_ok, check_row.snapshot_id::text AS snapshot_id FROM public.economy_run_reconciliation_check() AS check_row',
  },
];

export interface SchedulerLogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string, stack?: string): void;
}

export interface SchedulerOptions {
  readonly app: Queryable;
  readonly reconciler: Queryable | null;
  readonly intervalMs: number;
  readonly logger: SchedulerLogger;
  readonly jobs?: readonly SchedulerJob[];
  readonly handlers?: Readonly<Record<string, () => Promise<Record<string, unknown>>>>;
}

interface ClaimRow {
  claimed: boolean;
  period_key: string;
}

export class Scheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly options: SchedulerOptions) {}

  private get jobs(): readonly SchedulerJob[] {
    return this.options.jobs ?? SCHEDULER_JOBS;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), this.options.intervalMs);
    // Not unref'd: a deployment whose only remaining work is the schedule
    // should stay up for it.
    void this.tick();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /** One pass over every job. Public so a test can drive it without a timer. */
  async tick(): Promise<void> {
    // Overlapping ticks would each claim a different window and race the same
    // pool; a slow reconciliation must not stack up behind itself.
    if (this.running) return;
    this.running = true;
    try {
      for (const job of this.jobs) {
        await this.runOnce(job);
      }
    } finally {
      this.running = false;
    }
  }

  private async runOnce(job: SchedulerJob): Promise<void> {
    const connection = job.connection === 'reconciler' ? this.options.reconciler : this.options.app;
    if (!connection) return;

    let claim: ClaimRow | null;
    try {
      claim = await queryOne<ClaimRow>(
        this.options.app,
        'SELECT claim.claimed, claim.period_key FROM public.schedule_claim_run($1, $2, $3) AS claim',
        [job.job, job.cadence, job.notBefore],
      );
    } catch (error: unknown) {
      this.options.logger.error(`${job.job}: could not claim a window`, String(error));
      return;
    }

    if (!claim?.claimed) return;

    try {
      const handler = this.options.handlers?.[job.job];
      if (!handler && !job.statement) throw new Error(`no scheduler handler or statement for ${job.job}`);
      const result = handler
        ? await handler()
        : await queryOne<Record<string, unknown>>(connection, job.statement as string, []);
      await this.finish(job, claim.period_key, 'succeeded', result ?? {});
      this.options.logger.log(`${job.job} ${claim.period_key}: done`);
    } catch (error: unknown) {
      // The window stays claimed and is marked failed. It is not retried on
      // the next tick, deliberately: a job that fails every five minutes for
      // a day writes the same alert 288 times, and the failed row is what an
      // operator needs to see.
      const message = error instanceof Error ? error.message : String(error);
      await this.finish(job, claim.period_key, 'failed', { error: message.slice(0, 500) });
      this.options.logger.error(`${job.job} ${claim.period_key}: failed`, message);
    }
  }

  private async finish(
    job: SchedulerJob,
    periodKey: string,
    status: 'succeeded' | 'failed',
    detail: unknown,
  ): Promise<void> {
    try {
      await this.options.app.query(
        'SELECT public.schedule_finish_run($1, $2, $3, $4::jsonb)',
        [job.job, periodKey, status, JSON.stringify(detail ?? {})],
      );
    } catch (error: unknown) {
      this.options.logger.error(`${job.job}: could not record the outcome`, String(error));
    }
  }
}
