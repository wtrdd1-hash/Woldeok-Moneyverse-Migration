import type { Queryable } from '../core/db';

/**
 * What the deployment can honestly say about itself, recorded on a timer.
 *
 * `/status` had shown 확인 중 for every source since the port, because nothing
 * ever wrote a snapshot: 013 revokes `content_record_server_status` from the
 * application role on purpose, so the page that claims the service is healthy
 * cannot be written by the thing whose health it claims. 050 adds a role that
 * may execute exactly that one function and nothing else, and this collector
 * connects as it.
 *
 * Every probe measures something real and reports what it measured. Nothing
 * here reports `operational` because the code reached this line — a check
 * that cannot fail is not a check, and a green light nobody can trust is
 * worse than 확인 중, which is what the page shows when a snapshot goes stale.
 */

export type StatusState = 'operational' | 'degraded' | 'outage';

export interface Probe {
  readonly sourceKey: string;
  /** Resolves to the state and the sentence the public page will show. */
  run(): Promise<{ readonly state: StatusState; readonly detail: string }>;
}

/** Anything that can answer whether a URL responds, so tests need no network. */
export type Fetcher = (url: string) => Promise<{ readonly ok: boolean; readonly status: number }>;

const NOW = () => Date.now();

/**
 * The round trip to PostgreSQL, measured rather than assumed.
 *
 * Latency is the useful part: a database that answers in 400ms is not down,
 * and a page that only ever says 정상 would never have said so.
 */
export function databaseProbe(pool: Queryable, now: () => number = NOW): Probe {
  return {
    sourceKey: 'database',
    async run() {
      const started = now();
      await pool.query('SELECT 1');
      const elapsed = now() - started;
      return {
        state: elapsed > 1000 ? 'degraded' : 'operational',
        detail: `원장 응답 ${elapsed}ms`,
      };
    },
  };
}

/**
 * The API answering its own health route over the loopback interface.
 *
 * Deliberately an HTTP request rather than an in-process flag: this is the
 * path a caller takes, and a process that is alive but no longer serving is
 * exactly the failure a flag would miss.
 */
export function apiProbe(fetcher: Fetcher, url: string, now: () => number = NOW): Probe {
  return {
    sourceKey: 'api',
    async run() {
      const started = now();
      const response = await fetcher(url);
      const elapsed = now() - started;
      if (!response.ok) {
        return { state: 'outage', detail: `상태 코드 ${response.status}` };
      }
      return {
        state: elapsed > 1000 ? 'degraded' : 'operational',
        detail: `응답 ${elapsed}ms`,
      };
    },
  };
}

/** The web tier, reached the way a visitor reaches it: over the network. */
export function webProbe(fetcher: Fetcher, url: string, now: () => number = NOW): Probe {
  return {
    sourceKey: 'web',
    async run() {
      const started = now();
      const response = await fetcher(url);
      const elapsed = now() - started;
      if (!response.ok) {
        return { state: 'outage', detail: `상태 코드 ${response.status}` };
      }
      return {
        state: elapsed > 2000 ? 'degraded' : 'operational',
        detail: `응답 ${elapsed}ms`,
      };
    },
  };
}

export interface CollectorOptions {
  /** A pool connected as `moneyverse_status_collector`, not as the app role. */
  readonly recorder: Queryable;
  readonly probes: readonly Probe[];
  readonly intervalMs: number;
  readonly onError?: (sourceKey: string, error: unknown) => void;
}

/**
 * Runs the probes on a timer and records each result.
 *
 * A probe that throws is recorded as an outage rather than skipped. Skipping
 * would leave the last good snapshot in place until it went stale, so a
 * database that started refusing connections would read 정상 for three
 * minutes — the one interval where the page most needs to be right.
 */
export class StatusCollector {
  private readonly options: CollectorOptions;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: CollectorOptions) {
    if (!options.recorder?.query) throw new TypeError('a recording pool is required');
    if (options.intervalMs < 1000) throw new TypeError('interval must be at least 1000ms');
    this.options = options;
  }

  async collectOnce(): Promise<void> {
    for (const probe of this.options.probes) {
      let outcome: { state: StatusState; detail: string };
      try {
        outcome = await probe.run();
      } catch (error: unknown) {
        this.options.onError?.(probe.sourceKey, error);
        outcome = { state: 'outage', detail: '확인에 실패했습니다.' };
      }

      try {
        await this.options.recorder.query(
          'SELECT public.content_record_server_status($1,$2,$3,$4)',
          [probe.sourceKey, outcome.state, outcome.detail, new Date()],
        );
      } catch (error: unknown) {
        // Losing the write is not worth taking the process down: the snapshot
        // goes stale and the page falls back to 확인 중, which is true.
        this.options.onError?.(probe.sourceKey, error);
      }
    }
  }

  start(): void {
    if (this.timer) return;
    void this.collectOnce();
    this.timer = setInterval(() => void this.collectOnce(), this.options.intervalMs);
    // Never hold the process open for a status write.
    this.timer.unref?.();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
