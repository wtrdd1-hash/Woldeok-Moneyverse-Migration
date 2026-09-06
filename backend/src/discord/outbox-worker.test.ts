import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { DiscordOutboxWorker, messageFor, retryDelayMs } from './outbox-worker';
import type { FetchLike } from './outbox-worker';

const CHANNEL_ID = '123456789012345678';
const EVENT_ID = '11111111-1111-4111-8111-111111111111';

interface ClaimableEvent {
  id: string;
  event_type: string;
  channel_key: string;
}

/**
 * A pool that answers the four statements the worker sends and records every
 * call, so a test can assert what the worker decided rather than what it said.
 */
function fakePool(events: ClaimableEvent[], failures: { claim?: Error } = {}) {
  const calls: { sql: string; values: readonly unknown[] }[] = [];
  const pool: Queryable = {
    async query(sql: string, values: readonly unknown[] = []) {
      calls.push({ sql, values });
      if (sql.includes('outbox_claim_pending')) {
        if (failures.claim) throw failures.claim;
        return { rows: events };
      }
      if (sql.includes('outbox_record_delivery_failure')) {
        // What the function itself decides: permanent means parked, and the
        // attempt ceiling is the database's business, not the worker's.
        return { rows: [{ state: values[2] === true ? 'dead_letter' : 'retry' }] };
      }
      return { rows: [] };
    },
  };
  const sentTo = (fragment: string) => calls.filter((call) => call.sql.includes(fragment));
  return { pool, calls, sentTo };
}

function headers(values: Record<string, string> = {}) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null };
}

function respondWith(
  responses: { ok: boolean; status: number; headers?: Record<string, string> }[],
): { fetchImpl: FetchLike; bodies: unknown[] } {
  const bodies: unknown[] = [];
  let index = 0;
  const fetchImpl: FetchLike = async (_url, init) => {
    bodies.push(JSON.parse(String(init.body)));
    const response = responses[Math.min(index, responses.length - 1)];
    index += 1;
    if (!response) throw new Error('no response configured');
    return { ok: response.ok, status: response.status, headers: headers(response.headers ?? {}) };
  };
  return { fetchImpl, bodies };
}

function workerFor(
  events: ClaimableEvent[],
  fetchImpl: FetchLike,
  options: { clock?: () => number } = {},
) {
  const { pool, sentTo, calls } = fakePool(events);
  const worker = new DiscordOutboxWorker({
    pool,
    token: 'bot-token',
    channels: { default: CHANNEL_ID },
    intervalMs: 5_000,
    fetchImpl,
    ...(options.clock ? { clock: options.clock } : {}),
    onError: () => {},
  });
  return { worker, sentTo, calls };
}

const oneEvent: ClaimableEvent[] = [
  { id: EVENT_ID, event_type: 'shop.purchase.completed', channel_key: 'default' },
];

describe('the Discord outbox message', () => {
  it('says what happened, per event type', () => {
    expect(messageFor({ id: EVENT_ID, event_type: 'shop.purchase.completed' })).toBe(
      `상점 구매가 완료되었습니다.\n영수증: ${EVENT_ID}`,
    );
    expect(messageFor({ id: EVENT_ID, event_type: 'bank.loan.repaid' })).toBe(
      `대출이 상환되었습니다.\n영수증: ${EVENT_ID}`,
    );
    expect(messageFor({ id: EVENT_ID, event_type: 'activity.admin_request' })).toBe(
      `관리자 페이지 요청이 기록되었습니다.\n영수증: ${EVENT_ID}`,
    );
  });

  // An event type this deployment has no headline for is still announced as
  // itself: naming it wrongly would be worse than naming it plainly.
  it('falls back to naming an unrecognised type', () => {
    expect(messageFor({ id: EVENT_ID, event_type: 'quest.completed' })).toBe(
      `머니버스 이벤트: quest.completed\n영수증: ${EVENT_ID}`,
    );
  });

  it('refuses to render a type that does not look like one', () => {
    expect(messageFor({ id: EVENT_ID, event_type: '@everyone' })).toBe(
      `머니버스 이벤트: unknown\n영수증: ${EVENT_ID}`,
    );
  });
});

describe('reading a Discord rate-limit response', () => {
  it('prefers retry-after, in seconds', () => {
    expect(retryDelayMs(headers({ 'retry-after': '2' }))).toBe(2_000);
    expect(retryDelayMs(headers({ 'retry-after': '0.75' }))).toBe(750);
  });

  it('falls back to the bucket reset when there is no retry-after', () => {
    expect(retryDelayMs(headers({ 'x-ratelimit-reset-after': '3' }))).toBe(3_000);
  });

  // A proxy can put anything in a header, and a NaN delay would become an
  // immediate retry against a bucket that is still empty.
  it('ignores a header that is not a number', () => {
    expect(retryDelayMs(headers({ 'retry-after': 'soon' }))).toBeNull();
    expect(retryDelayMs(headers({ 'retry-after': '-5' }))).toBeNull();
    expect(retryDelayMs(headers({}))).toBeNull();
  });
});

describe('DiscordOutboxWorker delivery', () => {
  it('refuses to be built without somewhere to post', () => {
    const { pool } = fakePool([]);
    expect(
      () =>
        new DiscordOutboxWorker({ pool, token: 'bot-token', channels: {}, intervalMs: 5_000 }),
    ).toThrow('at least one outbox channel');
    expect(
      () =>
        new DiscordOutboxWorker({
          pool,
          token: 'bot-token',
          channels: { default: 'general' },
          intervalMs: 5_000,
        }),
    ).toThrow('exact snowflake');
  });

  it('marks a delivered event delivered, and never pings anybody', async () => {
    const { fetchImpl, bodies } = respondWith([{ ok: true, status: 200 }]);
    const { worker, sentTo } = workerFor(oneEvent, fetchImpl);

    await expect(worker.runOnce()).resolves.toEqual({
      claimed: 1,
      delivered: 1,
      failed: 0,
      deadLettered: 0,
    });
    expect(sentTo('outbox_mark_delivered')).toHaveLength(1);
    expect(bodies[0]).toMatchObject({
      allowed_mentions: { parse: [], users: [], roles: [] },
    });
  });

  /**
   * The failure the previous worker had no answer for: the exception escaped
   * `runOnce` with the whole claimed batch still leased for two minutes.
   */
  it('survives a fetch that throws and gives back the leases it did not use', async () => {
    const fetchImpl: FetchLike = async () => {
      throw new Error('getaddrinfo ENOTFOUND discord.com');
    };
    const events: ClaimableEvent[] = [
      ...oneEvent,
      {
        id: '22222222-2222-4222-8222-222222222222',
        event_type: 'bank.loan.issued',
        channel_key: 'default',
      },
    ];
    const { worker, sentTo } = workerFor(events, fetchImpl);

    const summary = await worker.runOnce();
    expect(summary.failed).toBe(1);
    expect(summary.delivered).toBe(0);
    expect(sentTo('outbox_record_delivery_failure')).toHaveLength(1);
    // The second event was claimed and never attempted, so its attempt is
    // handed back rather than counted against the ceiling.
    expect(sentTo('outbox_release_claim_untried')).toHaveLength(1);
    expect(sentTo('outbox_release_claim_untried')[0]?.values[0]).toBe(events[1]?.id);
  });

  it('reports nothing rather than throwing when the claim itself fails', async () => {
    const { pool } = fakePool([], { claim: new Error('connection terminated') });
    const seen: unknown[] = [];
    const worker = new DiscordOutboxWorker({
      pool,
      token: 'bot-token',
      channels: { default: CHANNEL_ID },
      intervalMs: 5_000,
      fetchImpl: async () => ({ ok: true, status: 200, headers: headers() }),
      onError: (error) => seen.push(error),
    });
    await expect(worker.runOnce()).resolves.toEqual({
      claimed: 0,
      delivered: 0,
      failed: 0,
      deadLettered: 0,
    });
    expect(seen).toHaveLength(1);
  });

  /**
   * A 403 or a 404 cannot be fixed by sending the same message again — the
   * channel is gone, or the bot was removed from it. That event is parked
   * permanently, which is what `delivery_attempts` counting up forever never
   * did.
   */
  it('dead-letters a refusal that repeating cannot fix', async () => {
    const { fetchImpl } = respondWith([{ ok: false, status: 403 }, { ok: true, status: 200 }]);
    const events: ClaimableEvent[] = [
      ...oneEvent,
      {
        id: '33333333-3333-4333-8333-333333333333',
        event_type: 'bank.loan.issued',
        channel_key: 'default',
      },
    ];
    const { worker, sentTo } = workerFor(events, fetchImpl);

    const summary = await worker.runOnce();
    expect(summary.deadLettered).toBe(1);
    // Permanent, and the batch carried on: the next event may be routed
    // somewhere the bot can still post.
    expect(sentTo('outbox_record_delivery_failure')[0]?.values[2]).toBe(true);
    expect(summary.delivered).toBe(1);
  });

  it('retries a server error rather than parking it, and stops the batch', async () => {
    const { fetchImpl } = respondWith([{ ok: false, status: 503 }]);
    const events: ClaimableEvent[] = [
      ...oneEvent,
      {
        id: '44444444-4444-4444-8444-444444444444',
        event_type: 'bank.loan.issued',
        channel_key: 'default',
      },
    ];
    const { worker, sentTo } = workerFor(events, fetchImpl);

    const summary = await worker.runOnce();
    expect(summary.failed).toBe(1);
    expect(sentTo('outbox_record_delivery_failure')[0]?.values[2]).toBe(false);
    expect(sentTo('outbox_release_claim_untried')).toHaveLength(1);
  });

  it('waits exactly as long as Discord asked after a 429', async () => {
    let now = 1_000_000;
    const { fetchImpl } = respondWith([
      { ok: false, status: 429, headers: { 'retry-after': '30' } },
    ]);
    const { worker } = workerFor(oneEvent, fetchImpl, { clock: () => now });

    await worker.runOnce();
    expect(worker.pausedUntil).toBe(1_030_000);

    // The next beat does nothing at all rather than earning a longer ban.
    await expect(worker.runOnce()).resolves.toEqual({
      claimed: 0,
      delivered: 0,
      failed: 0,
      deadLettered: 0,
    });

    now = 1_030_001;
    const resumed = await worker.runOnce();
    expect(resumed.claimed).toBe(1);
  });

  it('stops before the bucket empties when Discord says it is the last one', async () => {
    const now = 5_000;
    const { fetchImpl } = respondWith([
      {
        ok: true,
        status: 200,
        headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset-after': '4' },
      },
    ]);
    const events: ClaimableEvent[] = [
      ...oneEvent,
      {
        id: '55555555-5555-4555-8555-555555555555',
        event_type: 'bank.loan.issued',
        channel_key: 'default',
      },
    ];
    const { worker, sentTo } = workerFor(events, fetchImpl, { clock: () => now });

    const summary = await worker.runOnce();
    expect(summary.delivered).toBe(1);
    expect(worker.pausedUntil).toBe(9_000);
    expect(sentTo('outbox_release_claim_untried')).toHaveLength(1);
  });

  /**
   * A route naming a key the deployment never configured is an operator
   * error, not a Discord refusal, so it retries and carries its own
   * explanation into the dead letter.
   */
  it('records a route whose channel this deployment has not configured', async () => {
    const { fetchImpl } = respondWith([{ ok: true, status: 200 }]);
    const { worker, sentTo } = workerFor(
      [{ id: EVENT_ID, event_type: 'shop.purchase.completed', channel_key: 'alerts' }],
      fetchImpl,
    );

    const summary = await worker.runOnce();
    expect(summary.failed).toBe(1);
    expect(summary.delivered).toBe(0);
    expect(sentTo('outbox_record_delivery_failure')[0]?.values[1]).toBe(
      'no channel configured for route alerts',
    );
    expect(sentTo('outbox_record_delivery_failure')[0]?.values[2]).toBe(false);
  });

  it('skips a beat rather than running two batches at once', async () => {
    let release: (() => void) | undefined;
    const inFlight = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fetchImpl: FetchLike = async () => {
      await inFlight;
      return { ok: true, status: 200, headers: headers() };
    };
    const { worker } = workerFor(oneEvent, fetchImpl);

    const first = worker.runOnce();
    await expect(worker.runOnce()).resolves.toEqual({
      claimed: 0,
      delivered: 0,
      failed: 0,
      deadLettered: 0,
    });
    expect(worker.skippedBeats).toBe(1);
    release?.();
    await expect(first).resolves.toMatchObject({ delivered: 1 });
  });

  it('starts once and stops cleanly', () => {
    const fetchImpl = vi.fn<FetchLike>(async () => ({
      ok: true,
      status: 200,
      headers: headers(),
    }));
    const { worker } = workerFor([], fetchImpl);
    worker.start();
    worker.start();
    worker.stop();
    worker.stop();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
