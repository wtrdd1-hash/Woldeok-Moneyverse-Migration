import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from './testing/database';

/**
 * Migration 097, executed.
 *
 * The bug it closes was invisible from any single file: `member_profiles`
 * stored the name a member chose, `member_profile_view` read it, and every
 * other reader in the schema went to `identities.display_name` instead. Each
 * half looked right. The member saw their name change on one screen and
 * nowhere else.
 *
 * So the assertions here are about agreement between readers, not about one
 * of them, and the soft-delete rule 046 established is re-asserted because
 * 097 rewrites the function that carries it.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)('the name a member chose', () => {
  let migrator: Pool;

  beforeAll(() => {
    migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await migrator.end();
  });

  const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
    const client = await migrator.connect();
    try {
      await client.query('BEGIN');
      await body(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };

  /** A member with an OAuth identity, which is the name they start with. */
  const member = async (client: PoolClient, oauthName: string): Promise<string> => {
    const id = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
    await client.query(
      `INSERT INTO public.identities (user_id, provider, provider_subject, display_name)
       VALUES ($1, 'discord', $2, $3)`,
      [id, `9${randomUUID().replace(/-/g, '').slice(0, 17)}`, oauthName],
    );
    return id;
  };

  const boardName = async (client: PoolClient, actor: string): Promise<string | null> => {
    const { rows } = await client.query<{ name: string | null }>(
      'SELECT public.member_board_author_name($1) AS name',
      [actor],
    );
    return rows[0]?.name ?? null;
  };

  it('starts from the OAuth name when no profile row exists', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client, 'OAuth이름');
      expect(await boardName(client, actor)).toBe('OAuth이름');
    });
  });

  /** The whole bug, in one assertion. */
  it('shows the chosen name on the board once the member sets one', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client, 'OAuth이름');
      await client.query(
        'INSERT INTO public.member_profiles (user_id, display_name) VALUES ($1, $2)',
        [actor, '내가고른이름'],
      );
      expect(await boardName(client, actor)).toBe('내가고른이름');
    });
  });

  /**
   * The profile screen and the board must not be able to disagree. Before 097
   * they always did, for every member who had ever set a name.
   */
  it('agrees with what the profile screen shows the member', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client, 'OAuth이름');
      await client.query(
        'INSERT INTO public.member_profiles (user_id, display_name) VALUES ($1, $2)',
        [actor, '내가고른이름'],
      );
      const { rows } = await client.query<{ display_name: string }>(
        'SELECT display_name FROM public.member_profile_view($1, $1)',
        [actor],
      );
      expect(await boardName(client, actor)).toBe(rows[0]?.display_name);
    });
  });

  // Clearing the field is how a member goes back to their sign-in name, which
  // is what the form's own description promises.
  it('falls back to the OAuth name when the chosen one is cleared', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client, 'OAuth이름');
      await client.query(
        'INSERT INTO public.member_profiles (user_id, display_name) VALUES ($1, NULL)',
        [actor],
      );
      expect(await boardName(client, actor)).toBe('OAuth이름');
    });
  });

  /**
   * 046's rule, re-asserted because 097 rewrote the function that carries it.
   * A member who closes their account must not leave a name behind, and that
   * has to hold for the chosen name as much as for the OAuth one.
   */
  it('names a closed account with the placeholder, chosen name and all', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client, 'OAuth이름');
      await client.query(
        'INSERT INTO public.member_profiles (user_id, display_name) VALUES ($1, $2)',
        [actor, '내가고른이름'],
      );
      await client.query(
        `UPDATE public.users SET status = 'deleted', deleted_at = clock_timestamp() WHERE id = $1`,
        [actor],
      );
      expect(await boardName(client, actor)).toBe('사용자');
    });
  });

  it('names a closed account on a leaderboard with that screen’s own placeholder', async () => {
    await rolledBack(async (client) => {
      const { rows } = await client.query<{ name: string | null }>(
        'SELECT coalesce(public.member_public_name($1), $2) AS name',
        [randomUUID(), '참여자'],
      );
      expect(rows[0]?.name).toBe('참여자');
    });
  });

  /**
   * The helper is called from inside other SECURITY DEFINER functions, which
   * run as the owner. Granting it to the application would hand one SQL
   * injection a way to turn a list of user ids into a list of names.
   */
  it('does not let the application role resolve a name by user id', async () => {
    const { rows } = await migrator.query<{ has: boolean }>(
      `SELECT has_function_privilege('moneyverse_app', 'public.member_public_name(uuid)', 'EXECUTE') AS has`,
    );
    expect(rows[0]?.has).toBe(false);
  });
});
