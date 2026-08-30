import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

/**
 * One budget per member per guild, counted in the database.
 *
 * The interaction endpoint is public by Discord's design, so the limiter in
 * front of it is the only thing between a leaked application id and a member's
 * wallet being asked to move money five times a second. The bundled
 * `Map`-based limiter counted per process, which is a budget multiplied by
 * however many application instances exist — and that is precisely why
 * `config.ts` refused to enable this endpoint in production at all.
 *
 * `discord_rate_limit_consume` (066) counts in a row and takes the row lock in
 * the same statement, so two instances racing on the same member cannot both
 * read four and both write five. Redis would do the same job; PostgreSQL is
 * already in the compose file, already the place this codebase puts shared
 * state, and does not add a service that can be down on its own.
 */

const SNOWFLAKE = /^\d{16,22}$/;

export interface DiscordRateLimiter {
  consume(request: {
    userId: unknown;
    guildId: unknown;
    command: unknown;
  }): Promise<boolean>;
}

// public.discord_rate_limit_consume($1,$2,$3)
// (packages/database/migrations/061-discord-bot-revival.sql)
interface RateLimitConsumeRow {
  allowed: boolean | null;
}

function exactSnowflake(value: unknown): string | null {
  return typeof value === 'string' && SNOWFLAKE.test(value) ? value : null;
}

export function createPostgresDiscordRateLimiter({
  pool,
  isCommandName,
  limit = 5,
  windowMs = 10_000,
  onError,
}: {
  pool: Queryable;
  /** The allowlist the interaction handler dispatches on, passed in so this
   * module does not carry a second copy of the command names that would have
   * to be kept in step with it. */
  isCommandName: (value: string) => boolean;
  limit?: number;
  windowMs?: number;
  onError?: (error: unknown) => void;
}): DiscordRateLimiter {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('a PostgreSQL pool is required');
  }
  if (typeof isCommandName !== 'function') {
    throw new TypeError('a command allowlist is required');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new TypeError('limit must be an integer between 1 and 100');
  }
  if (!Number.isSafeInteger(windowMs) || windowMs < 1_000 || windowMs > 3_600_000) {
    throw new TypeError('window must be between 1000ms and one hour');
  }
  const windowSeconds = Math.max(1, Math.round(windowMs / 1_000));

  return Object.freeze({
    async consume({
      userId,
      guildId,
      command,
    }: {
      userId: unknown;
      guildId: unknown;
      command: unknown;
    }): Promise<boolean> {
      const normalizedUserId = exactSnowflake(userId);
      const normalizedGuildId = exactSnowflake(guildId);
      if (
        !normalizedUserId ||
        !normalizedGuildId ||
        typeof command !== 'string' ||
        !isCommandName(command)
      ) {
        return false;
      }
      // A member gets one shared budget in each guild rather than an
      // independent quota per command name, so adding a command later cannot
      // dilute the limit on the ones that move money.
      const bucketKey = `${normalizedGuildId}:${normalizedUserId}`;
      try {
        const row = await queryOne<RateLimitConsumeRow>(
          pool,
          'SELECT public.discord_rate_limit_consume($1,$2,$3) AS allowed',
          [bucketKey, limit, windowSeconds],
        );
        return row?.allowed === true;
      } catch (error: unknown) {
        // A limiter that cannot reach its counter must refuse. Answering
        // "allowed" during a database blip would lift the throttle on exactly
        // the endpoint that has no other gate in front of it, and the member
        // sees the same "try again shortly" reply either way.
        onError?.(error);
        return false;
      }
    },
  });
}
