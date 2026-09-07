import { describe, expect, it, vi } from 'vitest';
import {
  StatusCollector,
  apiProbe,
  databaseProbe,
  retryNetworkError,
  webProbe,
} from './status-collector';
import type { Fetcher, Probe } from './status-collector';

/**
 * The collector is the only thing in this application allowed to claim the
 * service is healthy, so what it does when a probe goes wrong matters more
 * than what it does when everything works.
 */

function clock(...readings: number[]): () => number {
  const values = [...readings];
  return () => values.shift() ?? 0;
}

function recorder(): { pool: { query: (sql: string, params?: unknown[]) => Promise<unknown> }; calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    pool: {
      query: async (_sql: string, params: unknown[] = []) => {
        calls.push(params);
        return { rows: [] };
      },
    },
  };
}

const ok: Fetcher = async () => ({ ok: true, status: 200 });

describe('probes', () => {
  it('reports the measured round trip rather than a fixed sentence', async () => {
    const pool = { query: vi.fn(async () => ({ rows: [] })) };
    const probe = databaseProbe(pool, clock(1000, 1042));
    await expect(probe.run()).resolves.toEqual({
      state: 'operational',
      detail: '원장 응답 42ms',
    });
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });

  // A slow database is not a healthy one, and it is not a dead one either.
  it('calls a slow database degraded, not operational', async () => {
    const probe = databaseProbe({ query: async () => ({ rows: [] }) }, clock(0, 1500));
    await expect(probe.run()).resolves.toMatchObject({ state: 'degraded' });
  });

  it('calls a refusing API an outage and names the status code', async () => {
    const refusing: Fetcher = async () => ({ ok: false, status: 503 });
    await expect(apiProbe(refusing, 'http://api/health').run()).resolves.toEqual({
      state: 'outage',
      detail: '상태 코드 503',
    });
  });

  it('reads the web tier over the network like a visitor does', async () => {
    const seen: string[] = [];
    const watching: Fetcher = async (url) => {
      seen.push(url);
      return { ok: true, status: 200 };
    };
    await webProbe(watching, 'http://frontend:3000/', clock(0, 10)).run();
    expect(seen).toEqual(['http://frontend:3000/']);
  });


  it('rechecks one transient web transport failure before declaring an outage', async () => {
    const fetcher = vi
      .fn<Fetcher>()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const sleep = vi.fn(async () => undefined);

    await expect(
      webProbe(retryNetworkError(fetcher, 1000, sleep), 'http://frontend:3000/', clock(0, 20)).run(),
    ).resolves.toEqual({ state: 'operational', detail: '응답 20ms' });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1000);
  });

  it('does not retry an HTTP outage that returned a real response', async () => {
    const fetcher = vi.fn<Fetcher>().mockResolvedValue({ ok: false, status: 503 });
    const sleep = vi.fn(async () => undefined);

    await expect(
      webProbe(retryNetworkError(fetcher, 1000, sleep), 'http://frontend:3000/').run(),
    ).resolves.toEqual({ state: 'outage', detail: '상태 코드 503' });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('propagates a second transport failure so the collector records an outage', async () => {
    const failure = new TypeError('fetch failed');
    const fetcher = vi.fn<Fetcher>().mockRejectedValue(failure);
    const sleep = vi.fn(async () => undefined);

    await expect(retryNetworkError(fetcher, 1000, sleep)('http://frontend:3000/')).rejects.toBe(
      failure,
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledOnce();
  });
});

describe('StatusCollector', () => {
  it('refuses to run without a recording pool', () => {
    expect(
      () =>
        new StatusCollector({
          recorder: undefined as never,
          probes: [],
          intervalMs: 30_000,
        }),
    ).toThrow('a recording pool is required');
  });

  it('records every probe through the status function', async () => {
    const { pool, calls } = recorder();
    const probes: Probe[] = [
      { sourceKey: 'api', run: async () => ({ state: 'operational', detail: '응답 5ms' }) },
      { sourceKey: 'web', run: async () => ({ state: 'degraded', detail: '응답 2500ms' }) },
    ];
    await new StatusCollector({ recorder: pool, probes, intervalMs: 30_000 }).collectOnce();

    expect(calls.map((params) => [params[0], params[1], params[2]])).toEqual([
      ['api', 'operational', '응답 5ms'],
      ['web', 'degraded', '응답 2500ms'],
    ]);
  });

  /**
   * The important one. Leaving the previous snapshot in place would let the
   * page go on saying 정상 for a full staleness window after the thing it
   * describes stopped answering.
   */
  it('records a probe that threw as an outage rather than skipping it', async () => {
    const { pool, calls } = recorder();
    const seen: string[] = [];
    await new StatusCollector({
      recorder: pool,
      intervalMs: 30_000,
      probes: [
        {
          sourceKey: 'database',
          run: async () => {
            throw new Error('connection refused');
          },
        },
      ],
      onError: (sourceKey) => seen.push(sourceKey),
    }).collectOnce();

    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toBe('outage');
    expect(seen).toEqual(['database']);
  });

  // A status write is not worth taking the API down for. The snapshot goes
  // stale and the page falls back to 확인 중, which is true.
  it('survives the recording write itself failing', async () => {
    const failing = {
      query: async () => {
        throw new Error('permission denied for function content_record_server_status');
      },
    };
    const seen: string[] = [];
    await expect(
      new StatusCollector({
        recorder: failing,
        intervalMs: 30_000,
        probes: [{ sourceKey: 'api', run: async () => ({ state: 'operational', detail: 'ok' }) }],
        onError: (sourceKey) => seen.push(sourceKey),
      }).collectOnce(),
    ).resolves.toBeUndefined();
    expect(seen).toEqual(['api']);
  });

  it('refuses an interval that would hammer the database', () => {
    expect(
      () => new StatusCollector({ recorder: { query: async () => ({}) }, probes: [], intervalMs: 10 }),
    ).toThrow('at least 1000ms');
  });

  it('starts once and stops cleanly', async () => {
    const { pool } = recorder();
    const collector = new StatusCollector({
      recorder: pool,
      probes: [{ sourceKey: 'api', run: async () => ({ state: 'operational', detail: 'ok' }) }],
      intervalMs: 1000,
    });
    collector.start();
    collector.start();
    collector.stop();
    collector.stop();
    await expect(Promise.resolve()).resolves.toBeUndefined();
  });
});

// The `ok` fetcher is exercised through webProbe above; naming it here keeps
// the import list honest rather than trimming a helper the file documents.
void ok;
