import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { createPostgresDiscordRateLimiter } from './rate-limiter';
import { isDiscordCommandName } from './interactions';

const GUILD_ID = '111111111111111111';
const USER_ID = '222222222222222222';

function fakePool(answer: { allowed?: boolean; error?: Error } = { allowed: true }) {
  const calls: unknown[][] = [];
  const pool: Queryable = {
    async query(_sql: string, values: readonly unknown[] = []) {
      calls.push([...values]);
      if (answer.error) throw answer.error;
      return { rows: [{ allowed: answer.allowed ?? true }] };
    },
  };
  return { pool, calls };
}

function limiterFor(
  answer: { allowed?: boolean; error?: Error } = { allowed: true },
  onError?: (error: unknown) => void,
) {
  const { pool, calls } = fakePool(answer);
  const limiter = createPostgresDiscordRateLimiter({
    pool,
    isCommandName: isDiscordCommandName,
    ...(onError ? { onError } : {}),
  });
  return { limiter, calls };
}

/**
 * This limiter is the only gate in front of a public endpoint, so what it does
 * with bad input and with a database that is not answering matters more than
 * what it does on the happy path.
 */
describe('the shared Discord rate limiter', () => {
  it('counts one budget per member per guild', async () => {
    const { limiter, calls } = limiterFor();
    await expect(
      limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'balance' }),
    ).resolves.toBe(true);
    expect(calls[0]).toEqual([`${GUILD_ID}:${USER_ID}`, 5, 10]);

    // The command is not part of the key: adding a command later must not
    // hand every member a fresh budget for it.
    await limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'send' });
    expect(calls[1]?.[0]).toBe(`${GUILD_ID}:${USER_ID}`);
  });

  it('refuses when the counter says the window is spent', async () => {
    const { limiter } = limiterFor({ allowed: false });
    await expect(
      limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'daily' }),
    ).resolves.toBe(false);
  });

  /**
   * The property the in-process limiter could not have: a limiter that cannot
   * reach its counter must deny. Answering "allowed" during a database blip
   * would lift the throttle on exactly the endpoint with no other gate.
   */
  it('fails closed when the database refuses, and says so once', async () => {
    const seen: unknown[] = [];
    const { limiter } = limiterFor({ error: new Error('connection terminated') }, (error) =>
      seen.push(error),
    );
    await expect(
      limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'balance' }),
    ).resolves.toBe(false);
    expect(seen).toHaveLength(1);
  });

  it('refuses anything that is not an exact snowflake, without querying', async () => {
    const { limiter, calls } = limiterFor();
    await expect(
      limiter.consume({ userId: 'someone', guildId: GUILD_ID, command: 'balance' }),
    ).resolves.toBe(false);
    await expect(
      limiter.consume({ userId: USER_ID, guildId: null, command: 'balance' }),
    ).resolves.toBe(false);
    expect(calls).toHaveLength(0);
  });

  // The allowlist is the handler's own, so a command the handler will not
  // dispatch cannot consume a token or reach the database.
  it('refuses a command that is not one of the registered four', async () => {
    const { limiter, calls } = limiterFor();
    await expect(
      limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'admin' }),
    ).resolves.toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('refuses a row that does not answer with a boolean true', async () => {
    const pool: Queryable = {
      async query() {
        return { rows: [{ allowed: null }] };
      },
    };
    const limiter = createPostgresDiscordRateLimiter({
      pool,
      isCommandName: isDiscordCommandName,
    });
    await expect(
      limiter.consume({ userId: USER_ID, guildId: GUILD_ID, command: 'balance' }),
    ).resolves.toBe(false);
  });

  it('refuses to be built with a limit or a window it cannot enforce', () => {
    const { pool } = fakePool();
    expect(() =>
      createPostgresDiscordRateLimiter({ pool, isCommandName: isDiscordCommandName, limit: 0 }),
    ).toThrow('limit must be');
    expect(() =>
      createPostgresDiscordRateLimiter({
        pool,
        isCommandName: isDiscordCommandName,
        windowMs: 10,
      }),
    ).toThrow('window must be');
  });
});
