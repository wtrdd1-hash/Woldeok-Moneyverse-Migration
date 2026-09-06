import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 098, executed.
 *
 * Review is the whole point: a member may send a photo in, and nobody but
 * them can see it until an operator publishes it. So the cases here are about
 * who can see what and when, and about the gallery list — which had to change
 * to admit a same-origin address at all, and must not have lost the host
 * allowlist while doing it.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

const storageKey = (): string => `${randomUUID().replace(/-/g, '')}.png`;

describe.skipIf(!DATABASE_URL)('member photo submissions', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the photo table unwritable by the application role', async () => {
    const error = await rejectionOf(() =>
      pool.query(
        `INSERT INTO public.photos (storage_key, alt_text, visibility) VALUES ($1, 'x', 'private')`,
        [storageKey()],
      ),
    );
    expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what a submission is visible to', () => {
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

    const visible = async (
      client: PoolClient,
      viewer: string | null,
      key: string,
    ): Promise<boolean> => {
      const { rows } = await client.query<{ visible: boolean }>(
        'SELECT public.content_storage_key_visible($1, $2) AS visible',
        [viewer, key],
      );
      return rows[0]?.visible === true;
    };

    const inGallery = async (client: PoolClient, photoId: string): Promise<boolean> => {
      const { rows } = await client.query<{ count: string }>(
        'SELECT count(*)::text AS count FROM public.content_list_published_photos(100) WHERE photo_id = $1',
        [photoId],
      );
      return rows[0]?.count !== '0';
    };

    /** The review gate, stated as the three readers who must not see a draft. */
    it('shows a draft to its author and to nobody else', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const stranger = await member(client);
        const id = randomUUID();
        const key = storageKey();
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          id,
          key,
          '내가 찍은 사진',
        ]);

        expect(await visible(client, author, key), 'the author').toBe(true);
        expect(await visible(client, stranger, key), 'another member').toBe(false);
        expect(await visible(client, null, key), 'a signed-out visitor').toBe(false);
        expect(await inGallery(client, id), 'the public gallery').toBe(false);
      });
    });

    it('lets an operator publish a member submission through the real command', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const operator = await member(client);
        const id = randomUUID();
        const key = storageKey();
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          id,
          key,
          '내가 찍은 사진',
        ]);
        await client.query(
          `INSERT INTO public.user_roles (user_id, role)
           VALUES ($1, 'operator'::public.admin_role)`,
          [operator],
        );
        const { rows } = await client.query<{ replayed: boolean }>(
          `SELECT replayed FROM public.content_set_photo_publication($1, $2, true, $3, $4)`,
          [operator, id, randomUUID(), randomUUID()],
        );

        expect(rows[0]?.replayed).toBe(false);
        expect(await visible(client, null, key)).toBe(true);
        expect(await inGallery(client, id)).toBe(true);
      });
    });

    /** The address is this deployment's own, so no allowlisted host is needed. */
    it('records the submission as a same-origin media path', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const id = randomUUID();
        const key = storageKey();
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          id,
          key,
          '설명',
        ]);
        const { rows } = await client.query<{ image_url: string; image_host: string | null }>(
          'SELECT image_url, image_host FROM public.photos WHERE id = $1',
          [id],
        );
        expect(rows[0]?.image_url).toBe(`/media/${key}`);
        expect(rows[0]?.image_host).toBeNull();
      });
    });

    /**
     * The allowlist 013 built must survive 098 rewriting the list around it.
     * A published photo naming a host nobody approved still does not appear.
     */
    it('still refuses a published photo on a host the allowlist does not carry', async () => {
      await rolledBack(async (client) => {
        const id = randomUUID();
        const key = storageKey();
        await client.query(
          `INSERT INTO public.photos (id, storage_key, alt_text, visibility, content_state,
             published_at, image_url, image_host)
           VALUES ($1, $2, '설명', 'public', 'published', clock_timestamp(),
                   'https://not-allowed.example/x.png', 'not-allowed.example')`,
          [id, key],
        );
        expect(await inGallery(client, id)).toBe(false);
      });
    });

    it('returns the first receipt for a repeated submission', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const id = randomUUID();
        const key = storageKey();
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          id,
          key,
          '설명',
        ]);
        const { rows } = await client.query<{ replayed: boolean }>(
          'SELECT replayed FROM public.member_submit_photo($1, $2, $3, $4)',
          [author, id, key, '설명'],
        );
        expect(rows[0]?.replayed).toBe(true);
        const { rows: count } = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.photos WHERE uploaded_by = $1',
          [author],
        );
        expect(count[0]?.count).toBe('1');
      });
    });

    it('refuses somebody else’s receipt', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const stranger = await member(client);
        const id = randomUUID();
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          id,
          storageKey(),
          '설명',
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
            stranger,
            id,
            storageKey(),
            '설명',
          ]),
        );
        expect(code(error)).toBe('28000');
      });
    });

    // Every submission costs an operator a review, so the queue is what the
    // cap protects, not the disk.
    it('caps a member at five submissions a day', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        for (let sent = 0; sent < 5; sent += 1) {
          await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
            author,
            randomUUID(),
            storageKey(),
            '설명',
          ]);
        }
        const error = await rejectionOf(() =>
          client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
            author,
            randomUUID(),
            storageKey(),
            '설명',
          ]),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('refuses a member whose account is not active', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        await client.query(
          `UPDATE public.users SET status = 'deleted', deleted_at = clock_timestamp() WHERE id = $1`,
          [author],
        );
        const error = await rejectionOf(() =>
          client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
            author,
            randomUUID(),
            storageKey(),
            '설명',
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('shows a member only their own submissions', async () => {
      await rolledBack(async (client) => {
        const author = await member(client);
        const stranger = await member(client);
        await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [
          author,
          randomUUID(),
          storageKey(),
          '설명',
        ]);
        const { rows } = await client.query('SELECT * FROM public.member_my_photo_submissions($1)', [
          stranger,
        ]);
        expect(rows).toHaveLength(0);
      });
    });
  });
});
