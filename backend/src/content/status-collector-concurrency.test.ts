import { afterEach, describe, expect, it, vi } from 'vitest';
import { StatusCollector } from './status-collector';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => { resolve = complete; });
  return { promise, resolve };
}

afterEach(() => vi.useRealTimers());

describe('status collector snapshot ordering', () => {
  it('never lets a newer outage be overwritten by an older overlapping green probe', async () => {
    const first = deferred<{ state: 'operational'; detail: string }>();
    const statuses: string[] = [];
    const run = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValue({ state: 'outage', detail: 'connection refused' });
    const collector = new StatusCollector({
      recorder: {
        query: async (_sql: string, params?: unknown[]) => {
          statuses.push(String(params?.[1]));
          return { rows: [] };
        },
      },
      probes: [{ sourceKey: 'web', run }],
      intervalMs: 1000,
    });

    const older = collector.collectOnce();
    const overlapping = collector.collectOnce();
    await overlapping;
    expect(run).toHaveBeenCalledTimes(1);
    expect(statuses).toEqual([]);

    first.resolve({ state: 'operational', detail: '200' });
    await older;
    await collector.collectOnce();
    expect(statuses).toEqual(['operational', 'outage']);
  });

  it('skips timer beats while a previous snapshot is still collecting', async () => {
    vi.useFakeTimers();
    const first = deferred<{ state: 'operational'; detail: string }>();
    const run = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValue({ state: 'outage', detail: 'connection refused' });
    const collector = new StatusCollector({
      recorder: { query: vi.fn(async () => ({ rows: [] })) },
      probes: [{ sourceKey: 'api', run }],
      intervalMs: 1000,
    });
    collector.start();
    await vi.advanceTimersByTimeAsync(3000);
    expect(run).toHaveBeenCalledTimes(1);
    first.resolve({ state: 'operational', detail: '200' });
    await Promise.resolve();
    await Promise.resolve();
    collector.stop();
  });

  it('releases the in-flight guard after a recorder callback fails', async () => {
    const run = vi.fn(async () => ({ state: 'outage' as const, detail: 'offline' }));
    const collector = new StatusCollector({
      recorder: { query: vi.fn(async () => { throw new Error('db unavailable'); }) },
      probes: [{ sourceKey: 'api', run }],
      intervalMs: 1000,
    });
    await collector.collectOnce();
    await collector.collectOnce();
    expect(run).toHaveBeenCalledTimes(2);
  });
});
