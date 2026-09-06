import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { NO_MENTIONS, withoutMentions } from './mentions';

/**
 * Delivers outbox events to Discord, and knows when to stop trying.
 *
 * The ledger writes an `outbox_events` row inside the same transaction as the
 * postings, which is what makes an announcement impossible to lose and
 * impossible to send for a transaction that rolled back. Everything after that
 * is this loop: claim a lease, post, mark delivered.
 *
 * What it now does that it did not before, each of which was a way for the
 * previous version to stall forever:
 *
 *   - The `fetch` is inside a try/catch. A DNS failure used to escape
 *     `runOnce` with the whole claimed batch still leased for two minutes.
 *   - A failure is recorded. `delivery_attempts` counted up with no ceiling
 *     and no terminal state, so an event Discord will never accept was retried
 *     for the life of the deployment.
 *   - A 429 is obeyed rather than slept through. Discord says how long to wait
 *     in `retry-after`; a fixed delay against a bucket that is still empty is
 *     how a bot earns a longer ban.
 *   - The message depends on the event type. One line reading
 *     "머니버스 이벤트: shop.purchase.completed" told a reader nothing.
 *
 * The claim function exposes a small, database-built `safe_context` only for
 * activity events. It never exposes the original request, headers, cookies,
 * query values or body.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE = /^[a-z][a-z0-9_.]{2,79}$/;
const CHANNEL_KEY = /^[a-z][a-z0-9_-]{1,31}$/;
const SNOWFLAKE = /^\d{16,22}$/;
const DISCORD_API_ORIGIN = 'https://discord.com';
const REQUEST_TIMEOUT_MS = 10_000;
/** Discord's own ceiling for a global 429; longer than this is a bug upstream. */
const MAX_BACKOFF_MS = 15 * 60_000;

// public.outbox_claim_pending($1)
// (packages/database/migrations/061-discord-bot-revival.sql)
interface OutboxEventRow {
  id: string;
  event_type: string;
  channel_key: string;
  safe_context: unknown;
}

// public.outbox_record_delivery_failure($1,$2,$3)
interface DeliveryFailureRow {
  state: string | null;
}

/** The subset of the global `fetch` signature this worker actually calls. */
export type FetchLike = (
  url: string,
  init: RequestInit,
) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
}>;

/**
 * One headline per event type.
 *
 * Korean, because the channel is read by members, and deliberately without an
 * amount or a name: the worker is not given the payload, and a channel that
 * announces who moved how much is a different product decision from a channel
 * that says the economy is alive. `discord_outbox_routes` decides which of
 * these are announced at all.
 */
const HEADLINES: Readonly<Record<string, string>> = Object.freeze({
  'wallet.transfer.completed': '송금이 완료되었습니다.',
  'game.daily_reward.claimed': '출석 보상이 지급되었습니다.',
  'game.work_reward.claimed': '작업 보상이 지급되었습니다.',
  'shop.purchase.completed': '상점 구매가 완료되었습니다.',
  'business.purchased': '사업체를 인수했습니다.',
  'business.daily_settled': '사업체 정산이 완료되었습니다.',
  'bank.loan.issued': '대출이 실행되었습니다.',
  'bank.loan.repaid': '대출이 상환되었습니다.',
  'bank.balance.moved': '은행 잔액이 이동했습니다.',
  'bank.interest.accrued': '예금 이자가 지급되었습니다.',
  'season.event.consumed': '시즌 이벤트 참여가 기록되었습니다.',
  'stock.trade.completed': '주식 거래가 체결되었습니다.',
  'casino.coin.played': '동전 게임 결과가 기록되었습니다.',
  'activity.api_request': '웹 API 요청이 기록되었습니다.',
  'activity.admin_request': '관리자 페이지 요청이 기록되었습니다.',
  'activity.client_event': '웹 화면 활동이 기록되었습니다.',
});

/**
 * The message for one event.
 *
 * A type with no headline keeps the line the previous worker sent for
 * everything, because an event this deployment does not recognise is still
 * worth announcing as itself rather than as a lie. Both lines go through the
 * mention filter: the type is regex-checked and the id is a UUID, so nothing
 * can reach `@everyone` today — the filter is there so the next person to add
 * a payload-derived field does not have to remember.
 */
function safeText(value: unknown, maximum: number): string | null {
  if (typeof value !== 'string') return null;
  const normalised = value.replace(/[\r\n\t]+/g, ' ').trim();
  return normalised ? normalised.slice(0, maximum) : null;
}

function koreaTime(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(parsed);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value;
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  const time = `${part('hour')}:${part('minute')}:${part('second')}`;
  return `${date} ${time} (한국시간)`;
}

function deviceSummary(value: string | null): string | null {
  if (!value) return null;
  const browser = /Edg\//.test(value)
    ? 'Edge'
    : /OPR\//.test(value)
      ? 'Opera'
      : /Firefox\//.test(value)
        ? 'Firefox'
        : /Chrome\//.test(value)
          ? 'Chrome'
          : /Safari\//.test(value)
            ? 'Safari'
            : /bot|crawler|spider/i.test(value)
              ? 'Bot'
              : '기타 브라우저';
  const platform = /Android/.test(value)
    ? 'Android'
    : /iPhone|iPad|iOS/.test(value)
      ? 'iOS'
      : /Windows/.test(value)
        ? 'Windows'
        : /Mac OS X/.test(value)
          ? 'macOS'
          : /Linux/.test(value)
            ? 'Linux'
            : '기타 기기';
  return `${platform} · ${browser}`;
}

function activityMessage(event: {
  id: string;
  event_type: string;
  safe_context?: unknown;
}): string | null {
  if (
    !event.event_type.startsWith('activity.') ||
    !event.safe_context ||
    typeof event.safe_context !== 'object'
  )
    return null;
  const context = event.safe_context as Record<string, unknown>;
  const userId = safeText(context.userId, 36);
  const nickname = safeText(context.nickname, 80) ?? (userId ? '회원' : '비로그인');
  const method = safeText(context.method, 12);
  const path = safeText(context.path, 500);
  const requestId = safeText(context.requestId, 36);
  const occurredAt = safeText(context.occurredAt, 40);
  const network = safeText(context.network, 64);
  const device = deviceSummary(safeText(context.userAgent, 500));
  const status =
    typeof context.status === 'number' && Number.isInteger(context.status) ? context.status : null;
  const durationMs =
    typeof context.durationMs === 'number' && Number.isInteger(context.durationMs)
      ? Math.max(0, context.durationMs)
      : null;
  const activity = safeText(context.activity, 40);
  const targetLabel = safeText(context.targetLabel, 120);
  const activityLabels: Readonly<Record<string, string>> = {
    page_view: '페이지 접속',
    page_dwell: '페이지 체류',
    button_click: '버튼 클릭',
    form_submit: '양식 제출',
    navigation: '페이지 이동',
  };
  const country = safeText(context.country, 2) ?? '확인 불가';
  const lines = [event.event_type === 'activity.admin_request' ? '[ADMIN 요청]' : '[WEB 요청]'];
  lines.push(`사용자: ${nickname}${userId ? ` (${userId})` : ''}`);
  if (method && path) lines.push(`요청: ${method} ${path}`);
  else if (path)
    lines.push(`화면: ${path}${activity ? ` · ${activityLabels[activity] ?? activity}` : ''}`);
  if (targetLabel) lines.push(`대상: ${targetLabel}`);
  if (status !== null)
    lines.push(`응답: ${status}${durationMs !== null ? ` · ${durationMs}ms` : ''}`);
  lines.push(`접속 국가: ${country}`);
  if (network) lines.push(`접속망: ${network}`);
  if (device) lines.push(`기기: ${device}`);
  const localTime = koreaTime(occurredAt);
  if (localTime) lines.push(`시각: ${localTime}`);
  lines.push(`요청 ID: ${requestId ?? event.id}`);
  return lines.join('\n');
}

export function messageFor(event: {
  id: string;
  event_type: string;
  safe_context?: unknown;
}): string {
  const type = EVENT_TYPE.test(event.event_type) ? event.event_type : 'unknown';
  const activity = activityMessage({ ...event, event_type: type });
  if (activity) return withoutMentions(activity);
  const headline = HEADLINES[type] ?? `머니버스 이벤트: ${type}`;
  return withoutMentions(`${headline}\n영수증: ${event.id}`);
}

function positiveMilliseconds(seconds: unknown): number | null {
  if (typeof seconds !== 'string' || !/^\d{1,6}(\.\d{1,3})?$/.test(seconds)) return null;
  const value = Math.ceil(Number(seconds) * 1_000);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.min(value, MAX_BACKOFF_MS);
}

/**
 * How long Discord asked this bot to wait, in milliseconds.
 *
 * `retry-after` is the documented answer to a 429 and is seconds, possibly
 * fractional. `x-ratelimit-reset-after` carries the same number for the bucket
 * that is about to be exhausted, which is what lets the worker stop *before*
 * being told to. Neither header is trusted as a number without being read as
 * one first: a proxy can return anything.
 */
export function retryDelayMs(headers: { get(name: string): string | null }): number | null {
  const retryAfter = positiveMilliseconds(headers.get('retry-after'));
  if (retryAfter !== null) return retryAfter;
  return positiveMilliseconds(headers.get('x-ratelimit-reset-after'));
}

function exhausted(headers: { get(name: string): string | null }): boolean {
  return headers.get('x-ratelimit-remaining') === '0';
}

export interface DiscordOutboxWorkerOptions {
  readonly pool: Queryable;
  readonly token: string;
  /** Route key to Discord channel id. `outbox_claim_pending` returns the key. */
  readonly channels: Readonly<Record<string, string>>;
  readonly intervalMs: number;
  readonly batchSize?: number;
  readonly fetchImpl?: FetchLike;
  readonly clock?: () => number;
  readonly onError?: (error: unknown) => void;
}

export interface OutboxRunSummary {
  readonly claimed: number;
  readonly delivered: number;
  readonly failed: number;
  readonly deadLettered: number;
}

const EMPTY_RUN: OutboxRunSummary = Object.freeze({
  claimed: 0,
  delivered: 0,
  failed: 0,
  deadLettered: 0,
});

export class DiscordOutboxWorker {
  private readonly options: DiscordOutboxWorkerOptions;
  private readonly fetch: FetchLike;
  private readonly clock: () => number;
  private readonly batchSize: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private skipped = 0;
  private pausedUntilMs = 0;

  constructor(options: DiscordOutboxWorkerOptions) {
    const { pool, token, channels, intervalMs } = options;
    if (!pool?.query || typeof token !== 'string' || !token) {
      throw new TypeError('a PostgreSQL pool and a Discord bot token are required');
    }
    if (!channels || typeof channels !== 'object' || Object.keys(channels).length === 0) {
      throw new TypeError('at least one outbox channel is required');
    }
    for (const [key, channelId] of Object.entries(channels)) {
      if (!CHANNEL_KEY.test(key) || typeof channelId !== 'string' || !SNOWFLAKE.test(channelId)) {
        throw new TypeError('every outbox channel must be a route key and an exact snowflake');
      }
    }
    if (!Number.isSafeInteger(intervalMs) || intervalMs < 1_000) {
      throw new TypeError('interval must be at least 1000ms');
    }
    const batchSize = options.batchSize ?? 20;
    if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 100) {
      throw new TypeError('batch size must be between 1 and 100');
    }
    const fetchImpl = options.fetchImpl ?? fetch;
    if (typeof fetchImpl !== 'function') throw new TypeError('a fetch implementation is required');
    const clock = options.clock ?? Date.now;
    if (typeof clock !== 'function') throw new TypeError('clock must be a function');

    this.options = options;
    this.fetch = fetchImpl;
    this.clock = clock;
    this.batchSize = batchSize;
  }

  /** How many beats were dropped because the previous run was still going. */
  get skippedBeats(): number {
    return this.skipped;
  }

  /** When the worker will next talk to Discord, if a 429 pushed it back. */
  get pausedUntil(): number {
    return this.pausedUntilMs;
  }

  private async recordFailure(
    id: string,
    reason: string,
    permanent: boolean,
  ): Promise<'dead_letter' | 'retry' | 'settled'> {
    const row = await queryOne<DeliveryFailureRow>(
      this.options.pool,
      'SELECT public.outbox_record_delivery_failure($1,$2,$3) AS state',
      [id, reason, permanent],
    );
    const state = row?.state;
    return state === 'dead_letter' || state === 'settled' ? state : 'retry';
  }

  /**
   * One delivery attempt, with the network failure turned into a value.
   *
   * The previous worker had no try/catch here at all, so a DNS failure escaped
   * `runOnce` with the whole claimed batch still leased for two minutes and
   * nothing recorded anywhere. Returning the failure rather than throwing it
   * is what lets the caller decide between "this event" and "this batch".
   */
  private async post(
    channelId: string,
    event: OutboxEventRow,
  ): Promise<
    | { sent: true; ok: boolean; status: number; headers: { get(name: string): string | null } }
    | { sent: false; error: unknown }
  > {
    try {
      const response = await this.fetch(
        `${DISCORD_API_ORIGIN}/api/v10/channels/${channelId}/messages`,
        {
          method: 'POST',
          headers: {
            authorization: `Bot ${this.options.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            content: messageFor(event),
            allowed_mentions: NO_MENTIONS,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
      return { sent: true, ok: response.ok, status: response.status, headers: response.headers };
    } catch (error: unknown) {
      return { sent: false, error };
    }
  }

  private async releaseUntried(ids: readonly string[]): Promise<void> {
    for (const id of ids) {
      // One failed release must not strand the rest: the lease expires in two
      // minutes either way, so this is a courtesy, not a correctness step.
      try {
        await this.options.pool.query('SELECT public.outbox_release_claim_untried($1)', [id]);
      } catch (error: unknown) {
        this.options.onError?.(error);
      }
    }
  }

  private pauseFor(delayMs: number | null): void {
    const delay = delayMs ?? this.options.intervalMs;
    this.pausedUntilMs = this.clock() + Math.min(delay, MAX_BACKOFF_MS);
  }

  async runOnce(): Promise<OutboxRunSummary> {
    if (this.running) {
      this.skipped += 1;
      return EMPTY_RUN;
    }
    if (this.clock() < this.pausedUntilMs) return EMPTY_RUN;
    this.running = true;
    try {
      return await this.deliverBatch();
    } catch (error: unknown) {
      // Claiming failed, or the database went away mid-batch. The lease
      // expires on its own; the next beat tries again.
      this.options.onError?.(error);
      return EMPTY_RUN;
    } finally {
      this.running = false;
    }
  }

  private async deliverBatch(): Promise<OutboxRunSummary> {
    const rows = await queryRows<OutboxEventRow>(
      this.options.pool,
      'SELECT id::text,event_type,channel_key,safe_context FROM public.outbox_claim_pending($1)',
      [this.batchSize],
    );
    let delivered = 0;
    let failed = 0;
    let deadLettered = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const event = rows[index];
      if (!event || !UUID.test(event.id)) continue;

      const channelId = this.options.channels[event.channel_key];
      if (!channelId) {
        // The route names a key this deployment did not configure. That is an
        // operator error rather than a Discord refusal, so it retries and ends
        // up in the dead letter with a reason that names the missing key.
        const state = await this.recordFailure(
          event.id,
          `no channel configured for route ${event.channel_key}`,
          false,
        );
        failed += 1;
        if (state === 'dead_letter') deadLettered += 1;
        continue;
      }

      const attempt = await this.post(channelId, event);
      if (!attempt.sent) {
        // Transport, not content: the next event would fail the same way, so
        // stop the batch and hand back every lease that was never used.
        this.options.onError?.(attempt.error);
        const state = await this.recordFailure(event.id, 'delivery request failed', false);
        failed += 1;
        if (state === 'dead_letter') deadLettered += 1;
        await this.releaseUntried(rows.slice(index + 1).map((row) => row.id));
        this.pauseFor(null);
        break;
      }

      if (attempt.status === 429) {
        this.pauseFor(retryDelayMs(attempt.headers));
        const state = await this.recordFailure(event.id, 'rate limited by Discord', false);
        failed += 1;
        if (state === 'dead_letter') deadLettered += 1;
        await this.releaseUntried(rows.slice(index + 1).map((row) => row.id));
        break;
      }

      if (attempt.status >= 500) {
        // Discord's problem, not this event's. Give the rest back rather than
        // burning an attempt each on a server that is already unwell.
        const state = await this.recordFailure(event.id, `discord ${attempt.status}`, false);
        failed += 1;
        if (state === 'dead_letter') deadLettered += 1;
        await this.releaseUntried(rows.slice(index + 1).map((row) => row.id));
        this.pauseFor(null);
        break;
      }

      if (!attempt.ok) {
        // 401, 403, 404: a revoked token, a channel the bot cannot post in, a
        // channel that no longer exists. Repeating the request cannot change
        // any of those, so this one goes straight to the dead letter and the
        // batch continues — the next event may be routed elsewhere.
        const state = await this.recordFailure(event.id, `discord ${attempt.status}`, true);
        failed += 1;
        if (state === 'dead_letter') deadLettered += 1;
        continue;
      }

      await this.options.pool.query('SELECT public.outbox_mark_delivered($1)', [event.id]);
      delivered += 1;

      // Told, before being refused, that this bucket has nothing left. Stop
      // here rather than spend the next request earning a 429.
      if (exhausted(attempt.headers)) {
        this.pauseFor(retryDelayMs(attempt.headers));
        await this.releaseUntried(rows.slice(index + 1).map((row) => row.id));
        break;
      }
    }

    return { claimed: rows.length, delivered, failed, deadLettered };
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.runOnce(), this.options.intervalMs);
    // An announcement is never a reason to keep the process alive.
    this.timer.unref?.();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
