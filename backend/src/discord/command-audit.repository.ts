import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import type { DiscordCommandAuditEntry } from './interactions';

/**
 * One row on the audit chain for every slash command.
 *
 * `admin_record_audit_event` is the app-facing audit entry point and it
 * demands the actor hold an administrator role — right for the console, wrong
 * here, because the members running /daily and /send hold none, so every
 * command would have failed with 42501 and gone unrecorded.
 * `discord_record_command_audit` (066) appends through the same hash-chained
 * primitive with a shape gate in place of the role gate.
 *
 * The arguments are re-validated here even though the interaction handler
 * already parsed them, exactly as the identity repository re-checks a
 * snowflake: this is the last place before a SECURITY DEFINER function, and
 * the function's own checks are the second half of the same pair, not a
 * reason to skip the first.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SNOWFLAKE = /^\d{16,22}$/;
const COMMANDS = new Set(['balance', 'history', 'daily', 'send']);
const OUTCOMES = new Set(['completed', 'rejected', 'failed']);

export class DiscordCommandAuditInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordCommandAuditInputError';
  }
}

function uuid(value: unknown, name: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new DiscordCommandAuditInputError(`${name} must be a UUID`);
  }
  return value.toLowerCase();
}

// public.discord_record_command_audit($1,$2,$3,$4,$5,$6)
// (packages/database/migrations/061-discord-bot-revival.sql)
interface CommandAuditRow {
  audit_id: string | null;
}

@Injectable()
export class PostgresDiscordCommandAuditRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async record(entry: DiscordCommandAuditEntry): Promise<string | null> {
    const actorUserId = uuid(entry?.actorUserId, 'actor user id');
    const idempotencyKey = uuid(entry?.idempotencyKey, 'idempotency key');
    const targetUserId =
      entry.targetUserId === null || entry.targetUserId === undefined
        ? null
        : uuid(entry.targetUserId, 'target user id');
    if (typeof entry.command !== 'string' || !COMMANDS.has(entry.command)) {
      throw new DiscordCommandAuditInputError('command must be one of the registered commands');
    }
    if (typeof entry.guildId !== 'string' || !SNOWFLAKE.test(entry.guildId)) {
      throw new DiscordCommandAuditInputError('guild id must be an exact snowflake');
    }
    if (typeof entry.outcome !== 'string' || !OUTCOMES.has(entry.outcome)) {
      throw new DiscordCommandAuditInputError('outcome must be completed, rejected or failed');
    }

    const row = await queryOne<CommandAuditRow>(
      this.pool,
      'SELECT public.discord_record_command_audit($1,$2,$3,$4,$5,$6)::text AS audit_id',
      [
        actorUserId,
        entry.command,
        entry.guildId,
        targetUserId,
        idempotencyKey,
        entry.outcome,
      ],
    );
    return row?.audit_id ?? null;
  }
}
