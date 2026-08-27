import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// public.outbox_claim_pending($1) (packages/database/migrations/027-discord-outbox-worker.sql)
interface OutboxEventRow {
  id: string;
  event_type: string;
  payload: unknown;
}

/** The subset of the global `fetch` signature this worker actually calls. */
type FetchLike = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }>;

function messageFor(event: OutboxEventRow): string {
  const type =
    typeof event.event_type === 'string' && /^[a-z0-9._-]{1,80}$/i.test(event.event_type)
      ? event.event_type
      : 'unknown';
  return `머니버스 이벤트: ${type}\n영수증: ${event.id}`;
}

export class DiscordOutboxWorker {
  readonly pool: Queryable;
  readonly token: string;
  readonly channelId: string;
  readonly fetch: FetchLike;

  constructor({
    pool,
    token,
    channelId,
    fetchImpl = fetch,
  }: {
    pool: Queryable;
    token: string;
    channelId: string;
    fetchImpl?: FetchLike;
  }) {
    if (
      !pool?.query ||
      typeof token !== 'string' ||
      !token ||
      typeof channelId !== 'string' ||
      !channelId ||
      typeof fetchImpl !== 'function'
    )
      throw new TypeError('pool, Discord token, channel and fetch are required');
    this.pool = pool;
    this.token = token;
    this.channelId = channelId;
    this.fetch = fetchImpl;
  }

  async runOnce(limit = 20): Promise<{ claimed: number; delivered: number }> {
    const rows = await queryRows<OutboxEventRow>(
      this.pool,
      'SELECT id::text,event_type,payload FROM public.outbox_claim_pending($1)',
      [limit],
    );
    let delivered = 0;
    for (const event of rows) {
      if (!uuid.test(event?.id)) continue;
      const response = await this.fetch(
        `https://discord.com/api/v10/channels/${this.channelId}/messages`,
        {
          method: 'POST',
          headers: { authorization: `Bot ${this.token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ content: messageFor(event) }),
        },
      );
      if (response.status === 429) break;
      if (!response.ok) {
        await this.pool.query('SELECT public.outbox_release_claim($1)', [event.id]);
        continue;
      }
      await this.pool.query('SELECT public.outbox_mark_delivered($1)', [event.id]);
      delivered += 1;
    }
    return { claimed: rows.length, delivered };
  }
}
