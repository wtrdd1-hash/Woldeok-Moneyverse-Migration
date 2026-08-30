import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 094, executed.
 *
 * The gate is the whole feature. A profile picture is served from a URL that
 * anybody can hold, so what decides whether the bytes come back is
 * `member_profile_image_visible` and nothing else -- there is no session
 * guard on the route, deliberately, because a public profile's picture has to
 * be readable by somebody who is not signed in.
 *
 * So every case here is somebody asking for somebody else's image with a key
 * they already have, which is the only interesting question.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

const KEY = '11111111-2222-4333-8444-555555555555.png';
const OTHER_KEY = '99999999-8888-4777-8666-555555555555.webp';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)('profile images against a real database', () => {
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

  const member = async (client: PoolClient): Promise<string> => {
    const id = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
    return id;
  };

  const setImage = async (client: PoolClient, actor: string, key: string) => {
    const { rows } = await client.query<{ image_path: string; replaced_key: string | null }>(
      'SELECT image_path, replaced_key FROM public.member_set_profile_image($1, $2)',
      [actor, key],
    );
    return rows[0];
  };

  const visible = async (
    client: PoolClient,
    viewer: string | null,
    key: string,
  ): Promise<boolean> => {
    const { rows } = await client.query<{ visible: boolean }>(
      'SELECT public.member_profile_image_visible($1, $2) AS visible',
      [viewer, key],
    );
    return rows[0]?.visible === true;
  };

  const setVisibility = async (
    client: PoolClient,
    actor: string,
    profile: string,
    fields: Record<string, string>,
  ) => {
    await client.query(
      `UPDATE public.member_profiles
       SET visibility = $2::public.profile_visibility, field_visibility = $3::jsonb
       WHERE user_id = $1`,
      [actor, profile, JSON.stringify(fields)],
    );
  };

  it('stores the servable path and reports nothing replaced the first time', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const first = await setImage(client, owner, KEY);
      expect(first?.image_path).toBe(`/media/profile/${KEY}`);
      expect(first?.replaced_key).toBeNull();
    });
  });

  it('hands back the key it replaced, so the caller can delete that file', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      await setImage(client, owner, KEY);
      const second = await setImage(client, owner, OTHER_KEY);
      expect(second?.replaced_key).toBe(KEY);
    });
  });

  // An address the member typed points at somebody else's server. Reporting
  // it as replaced would have this application deleting a file it never wrote.
  it('reports nothing to delete when the previous image was an address', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      await client.query(
        `INSERT INTO public.member_profiles (user_id, image_url) VALUES ($1, $2)`,
        [owner, 'https://example.test/somebody-elses.png'],
      );
      const next = await setImage(client, owner, KEY);
      expect(next?.replaced_key).toBeNull();
    });
  });

  it('clears the image and reports the key that was freed', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      await setImage(client, owner, KEY);
      const { rows } = await client.query<{ replaced_key: string | null }>(
        'SELECT replaced_key FROM public.member_clear_profile_image($1)',
        [owner],
      );
      expect(rows[0]?.replaced_key).toBe(KEY);
      const { rows: after } = await client.query<{ image_url: string | null }>(
        'SELECT image_url FROM public.member_profiles WHERE user_id = $1',
        [owner],
      );
      expect(after[0]?.image_url).toBeNull();
    });
  });

  it('refuses a key that is not the shape the store generates', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const error = await rejectionOf(() => setImage(client, owner, '../../etc/passwd'));
      expect(code(error)).toBe('22023');
    });
  });

  it('refuses to set an image for somebody who is not an active member', async () => {
    await rolledBack(async (client) => {
      const error = await rejectionOf(() =>
        setImage(client, '00000000-0000-4000-8000-000000000000', KEY),
      );
      expect(code(error)).toBe('28000');
    });
  });

  describe('who may be served the bytes', () => {
    it('always answers the owner, whatever they chose', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'private', { imageUrl: 'private' });
        expect(await visible(client, owner, KEY)).toBe(true);
      });
    });

    it('withholds a private image from another member', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const stranger = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'members', { imageUrl: 'private' });
        expect(await visible(client, stranger, KEY)).toBe(false);
      });
    });

    it('shows a members-only image to a member and not to a visitor', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const other = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'members', { imageUrl: 'members' });
        expect(await visible(client, other, KEY)).toBe(true);
        expect(await visible(client, null, KEY)).toBe(false);
      });
    });

    it('shows a public image to somebody who is not signed in', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'public', { imageUrl: 'public' });
        expect(await visible(client, null, KEY)).toBe(true);
      });
    });

    // A profile withheld entirely withholds its picture too. Without the
    // second gate a member could hide their profile and still have their
    // photograph served to anybody holding the address.
    it('withholds the image of a profile that is itself withheld', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const other = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'members', { profile: 'private', imageUrl: 'public' });
        expect(await visible(client, other, KEY)).toBe(false);
      });
    });

    it('withholds the image of a member who is no longer active', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const other = await member(client);
        await setImage(client, owner, KEY);
        await setVisibility(client, owner, 'public', { imageUrl: 'public' });
        // `users_deleted_at_matches_status` requires the timestamp to move
        // with the status: a deleted account with no deletion time is a row
        // this schema refuses, and setting one without the other is the
        // mistake the constraint exists to catch.
        await client.query(
          `UPDATE public.users
           SET status = 'deleted'::public.user_status, deleted_at = clock_timestamp()
           WHERE id = $1`,
          [owner],
        );
        expect(await visible(client, other, KEY)).toBe(false);
      });
    });

    it('answers false for a key nobody is using and for a malformed one', async () => {
      await rolledBack(async (client) => {
        const other = await member(client);
        expect(await visible(client, other, KEY)).toBe(false);
        expect(await visible(client, other, '../../etc/passwd')).toBe(false);
      });
    });
  });
});
