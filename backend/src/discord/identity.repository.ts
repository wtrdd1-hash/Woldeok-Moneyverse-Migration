import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { EncryptionService } from '../security/encryption.service';

const DISCORD_SNOWFLAKE = /^\d{16,22}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class DiscordIdentityInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordIdentityInputError';
  }
}

function discordSnowflake(value: unknown): string {
  if (typeof value !== 'string' || !DISCORD_SNOWFLAKE.test(value)) {
    throw new DiscordIdentityInputError('Discord user ID must be an exact snowflake');
  }
  return value;
}

function internalUserId(value: string): string {
  if (!UUID.test(value)) {
    throw new Error('database returned an invalid Discord identity user ID');
  }
  return value.toLowerCase();
}

interface DiscordUserForSubjectRow {
  user_id: string | null;
}

/**
 * Read-only identity adapter for the signed Discord Interactions boundary.
 *
 * It deliberately resolves only an exact Discord OAuth subject. It neither
 * exposes profile data nor supports display-name/email lookup, and requires
 * an active account with an acknowledgement of the currently published policy
 * before returning the internal user UUID.
 */
@Injectable()
export class PostgresDiscordIdentityRepository {
  readonly pool: Queryable;
  readonly encryptionService: EncryptionService;

  constructor(pool: Queryable, encryptionService?: EncryptionService) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
    this.encryptionService = encryptionService ?? new EncryptionService();
  }

  async userIdForDiscordUser(discordUserId: unknown): Promise<string | null> {
    const subject = discordSnowflake(discordUserId);
    const encryptedSubject = this.encryptionService.encryptDeterministic(subject) ?? subject;
    const row = await queryOne<DiscordUserForSubjectRow>(
      this.pool,
      'SELECT public.discord_user_for_subject($1)::text AS user_id',
      [encryptedSubject],
    );
    return row?.user_id ? internalUserId(row.user_id) : null;
  }
}
