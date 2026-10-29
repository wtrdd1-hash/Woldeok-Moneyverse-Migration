import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const storageKey = (): string => randomUUID().replaceAll('-', '') + '.png';

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)('owner photo withdrawal SQL 292', () => {
  let app: Pool;
  let migrator: Pool;

  beforeAll(() => {
    app = new Pool({ connectionString: DATABASE_URL!, max: 1 });
    migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL!, max: 1 });
  });
  afterAll(async () => { await app.end(); await migrator.end(); });

  async function rolledBack(work: (client: PoolClient) => Promise<void>) {
    const client = await migrator.connect();
    try {
      await client.query('BEGIN');
      await work(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  async function rejected(client: PoolClient, sql: string, args: unknown[]) {
    await client.query('SAVEPOINT expected_error');
    let error: unknown;
    try {
      await client.query(sql, args);
      throw new Error('expected SQL command to be rejected');
    } catch (caught) {
      error = caught;
    } finally {
      await client.query('ROLLBACK TO SAVEPOINT expected_error');
    }
    return error;
  }

  async function member(client: PoolClient) {
    const id = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
    return id;
  }

  async function submit(client: PoolClient, actor: string) {
    const photo = randomUUID();
    const key = storageKey();
    await client.query('SELECT public.member_submit_photo($1, $2, $3, $4)', [actor, photo, key, 'A test photo']);
    return { photo, key };
  }

  it('withdraws owner draft atomically, revokes media access, fences publication, and replays safely', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const stranger = await member(client);
      const operator = await member(client);
      await client.query("INSERT INTO public.user_roles(user_id, role) VALUES ($1, 'operator'::public.admin_role)", [operator]);
      const { photo, key } = await submit(client, owner);
      const idempotency = randomUUID();

      const unauthorized = await rejected(client,
        'SELECT * FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [stranger, photo, randomUUID()]);
      expect((unauthorized as { code?: string }).code).toBe('55000');
      const absent = await rejected(client,
        'SELECT * FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [stranger, randomUUID(), randomUUID()]);
      expect((absent as { code?: string }).code).toBe('55000');

      const first = await client.query<{ replayed: boolean }>(
        'SELECT replayed FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [owner, photo, idempotency],
      );
      expect(first.rows[0]?.replayed).toBe(false);
      const again = await client.query<{ replayed: boolean }>(
        'SELECT replayed FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [owner, photo, idempotency],
      );
      expect(again.rows[0]?.replayed).toBe(true);

      const keyReuse = await rejected(client,
        'SELECT * FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [owner, randomUUID(), idempotency]);
      expect((keyReuse as { code?: string }).code).toBe('22023');
      const foreignReplay = await rejected(client,
        'SELECT * FROM public.member_withdraw_pending_photo($1,$2,$3)',
        [stranger, photo, idempotency]);
      expect((foreignReplay as { code?: string }).code).toBe('22023');

      const visible = await client.query<{ visible: boolean }>(
        'SELECT public.content_storage_key_visible($1,$2) AS visible', [owner, key],
      );
      expect(visible.rows[0]?.visible).toBe(false);
      const remaining = await client.query<{ count: string }>(
        'SELECT count(*)::text AS count FROM public.photos WHERE id = $1', [photo],
      );
      expect(remaining.rows[0]?.count).toBe('0');

      const pending = await client.query<{ count: string }>(
        'SELECT count(*)::text AS count FROM public.admin_list_pending_photos($1,50) WHERE photo_id=$2',
        [operator, photo]);
      expect(pending.rows[0]?.count).toBe('0');
      const tombstone = await client.query<{ count: string }>(
        'SELECT count(*)::text AS count FROM public.member_photo_withdrawals WHERE photo_id = $1', [photo],
      );
      expect(tombstone.rows[0]?.count).toBe('1');

      const publishError = await rejected(client,
        'SELECT public.content_set_photo_publication($1,$2,true,$3,$4)',
        [operator, photo, randomUUID(), randomUUID()]);
      expect((publishError as { code?: string }).code).toBe('22023');

      const reuseError = await rejected(client,
        'SELECT public.member_submit_photo($1,$2,$3,$4)',
        [owner, photo, storageKey(), 'resubmit']);
      expect((reuseError as { code?: string }).code).toBe('55000');

      // The private bytes must not be reattached under a fresh photo UUID.
      const retiredMedia = await rejected(client,
        'SELECT public.member_submit_photo($1,$2,$3,$4)',
        [stranger, randomUUID(), key, 'reattach withdrawn bytes']);
      expect((retiredMedia as { code?: string }).code).toBe('55000');
    });
  });

  it('refuses a published photo without deleting it', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const operator = await member(client);
      await client.query("INSERT INTO public.user_roles(user_id, role) VALUES ($1, 'operator'::public.admin_role)", [operator]);
      const { photo } = await submit(client, owner);
      await client.query('SELECT public.content_set_photo_publication($1,$2,true,$3,$4)',
        [operator, photo, randomUUID(), randomUUID()]);
      const denied = await rejected(client,
        'SELECT public.member_withdraw_pending_photo($1,$2,$3)',
        [owner, photo, randomUUID()]);
      expect((denied as { code?: string }).code).toBe('55000');
      const row = await client.query<{ content_state: string }>(
        'SELECT content_state FROM public.photos WHERE id=$1', [photo]);
      expect(row.rows[0]?.content_state).toBe('published');
    });
  });

  it('does not refund the five-per-day submission quota after withdrawal', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const photos = [];
      for (let i = 0; i < 5; i += 1) photos.push(await submit(client, owner));
      await client.query('SELECT public.member_withdraw_pending_photo($1,$2,$3)',
        [owner, photos[0]!.photo, randomUUID()]);
      const limit = await rejected(client,
        'SELECT public.member_submit_photo($1,$2,$3,$4)',
        [owner, randomUUID(), storageKey(), 'sixth photo']);
      expect((limit as { code?: string }).code).toBe('23505');
    });
  });

  it('denies application direct tombstone reads and writes', async () => {
    const read = await rejectionOf(() => app.query('SELECT * FROM public.member_photo_withdrawals LIMIT 1'));
    expect(String((read as { message?: string }).message)).toMatch(/permission denied/i);
    const write = await rejectionOf(() => app.query(
      'DELETE FROM public.member_photo_withdrawals WHERE photo_id = $1', [randomUUID()]));
    expect(String((write as { message?: string }).message)).toMatch(/permission denied/i);
  });
});
