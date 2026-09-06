import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { PostgresDiscordCommandAuditRepository } from './command-audit.repository';
import { createPostgresDiscordRateLimiter } from './rate-limiter';
import { isDiscordCommandName } from './interactions';

const DATABASE_URL = databaseUrl();
const UNKNOWN_USER = '00000000-0000-4000-8000-000000000000';

/** A fresh bucket per run: the limiter's state is a row that outlives a test. */
function snowflake(): string {
  return String(100_000_000_000_000_000n + BigInt(Math.floor(Math.random() * 1e15)));
}

/**
 * The application role has to be able to reach every function this PR added,
 * and every refusal has to come from the function rather than from a missing
 * grant. 047 shipped a read path with no functions at all and answered 42501
 * in production; this is the check that would have caught it.
 */
describe.skipIf(!DATABASE_URL)('the Discord surface against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('spends a fixed window and then refuses, in the database', async () => {
    const limiter = createPostgresDiscordRateLimiter({
      pool,
      isCommandName: isDiscordCommandName,
      limit: 2,
      windowMs: 60_000,
    });
    const request = { userId: snowflake(), guildId: snowflake(), command: 'balance' };

    await expect(limiter.consume(request)).resolves.toBe(true);
    await expect(limiter.consume(request)).resolves.toBe(true);
    await expect(limiter.consume(request)).resolves.toBe(false);
    // Still refused, and the counter has not overflowed past the limit.
    await expect(limiter.consume(request)).resolves.toBe(false);
  });

  it('counts each member separately', async () => {
    const limiter = createPostgresDiscordRateLimiter({
      pool,
      isCommandName: isDiscordCommandName,
      limit: 1,
      windowMs: 60_000,
    });
    const guildId = snowflake();
    await expect(limiter.consume({ userId: snowflake(), guildId, command: 'daily' })).resolves.toBe(
      true,
    );
    await expect(limiter.consume({ userId: snowflake(), guildId, command: 'daily' })).resolves.toBe(
      true,
    );
  });

  it('refuses a bucket key that is not a guild and a member', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT public.discord_rate_limit_consume($1,$2,$3) AS allowed', [
        'everyone',
        5,
        10,
      ]),
    );
    expect((error as { code?: string }).code).toBe('22023');
    expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
  });

  it('calls outbox_claim_pending with the declared signature', async () => {
    const claimed = await pool.query(
      'SELECT id::text,event_type,channel_key,safe_context FROM public.outbox_claim_pending($1)',
      [1],
    );
    expect(Array.isArray(claimed.rows)).toBe(true);
  });

  it('reports an event that is already settled rather than failing it twice', async () => {
    const settled = await pool.query<{ state: string }>(
      'SELECT public.outbox_record_delivery_failure($1,$2,$3) AS state',
      [randomUUID(), 'delivery request failed', false],
    );
    expect(settled.rows[0]?.state).toBe('settled');
  });

  it('hands back nothing for an untried claim that does not exist', async () => {
    const released = await pool.query<{ released: boolean | null }>(
      'SELECT public.outbox_release_claim_untried($1) AS released',
      [randomUUID()],
    );
    expect(released.rows[0]?.released ?? null).toBeNull();
  });

  it('refuses to audit a command for somebody who is not an active member', async () => {
    const audit = new PostgresDiscordCommandAuditRepository(pool);
    const error = await rejectionOf(() =>
      audit.record({
        actorUserId: UNKNOWN_USER,
        command: 'balance',
        guildId: '123456789012345678',
        targetUserId: null,
        idempotencyKey: randomUUID(),
        outcome: 'completed',
      }),
    );
    expect((error as { code?: string }).code).toBe('42501');
    expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
  });

  it('refuses to audit a command name it does not recognise', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT public.discord_record_command_audit($1,$2,$3,$4,$5,$6)', [
        UNKNOWN_USER,
        'promote',
        '123456789012345678',
        null,
        randomUUID(),
        'completed',
      ]),
    );
    expect((error as { code?: string }).code).toBe('22023');
  });
});
