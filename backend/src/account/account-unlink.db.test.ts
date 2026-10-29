import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('real PostgreSQL identity unlink receipts', () => {
  let migrator: Pool;

  beforeAll(() => {
    migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await migrator.end();
  });

  async function rolledBack(body: (client: PoolClient) => Promise<void>): Promise<void> {
    const client = await migrator.connect();
    try {
      await client.query('BEGIN');
      await body(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  it('returns the exact removed identity and leaves only owner-visible remaining methods', async () => {
    await rolledBack(async (client) => {
      const actor = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      const first = await client.query<{ id: string }>(
        `INSERT INTO public.identities(user_id, provider, provider_subject, display_name)
         VALUES ($1,'google',$2,'Google member') RETURNING id::text`,
        [actor, `google-${randomUUID()}`],
      );
      const second = await client.query<{ id: string }>(
        `INSERT INTO public.identities(user_id, provider, provider_subject, display_name)
         VALUES ($1,'discord',$2,'Discord member') RETURNING id::text`,
        [actor, `discord-${randomUUID()}`],
      );
      const removed = first.rows[0]!.id;
      const remaining = second.rows[0]!.id;

      const result = await client.query<{ identity_id: string }>(
        'SELECT public.account_unlink_identity($1,$2)::text AS identity_id',
        [actor, removed],
      );
      expect(result.rows[0]?.identity_id).toBe(removed);

      const readback = await client.query<{ identity_id: string }>(
        'SELECT identity_id::text FROM public.account_list_my_identities($1)',
        [actor],
      );
      expect(readback.rows).toEqual([{ identity_id: remaining }]);

      await client.query('SAVEPOINT last_method');
      const lastError = await rejectionOf(() =>
        client.query('SELECT public.account_unlink_identity($1,$2)', [actor, remaining]),
      );
      expect((lastError as { code?: string }).code).toBe('23514');
      await client.query('ROLLBACK TO SAVEPOINT last_method');
    });
  });

  it('refuses unlinking an identity belonging to another member', async () => {
    await rolledBack(async (client) => {
      const actor = randomUUID();
      const other = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [actor, other]);
      const linked = await client.query<{ id: string }>(
        `INSERT INTO public.identities(user_id, provider, provider_subject, display_name)
         VALUES ($1,'google',$2,'Other member') RETURNING id::text`,
        [other, `google-${randomUUID()}`],
      );
      const error = await rejectionOf(() =>
        client.query('SELECT public.account_unlink_identity($1,$2)', [actor, linked.rows[0]!.id]),
      );
      expect((error as { code?: string }).code).toBe('22023');
    });
  });
});
