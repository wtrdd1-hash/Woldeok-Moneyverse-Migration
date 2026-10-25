import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresCollectionRepository } from './collection.repository';

const isolatedUrl = process.env.MV_B_V536_ISOLATED_DATABASE_URL;
if (isolatedUrl) {
  const parsed = new URL(isolatedUrl);
  if (parsed.hostname !== '127.0.0.1' || parsed.port !== '56536' ||
      parsed.pathname !== '/mv_b_v536_isolated') {
    throw new Error('Refusing collection integration test against non-isolated PostgreSQL');
  }
}

describe.skipIf(!isolatedUrl)('Collection GET isolated PostgreSQL read-only contract', () => {
  const pool = isolatedUrl ? new Pool({ connectionString: isolatedUrl }) : null;
  afterAll(async () => { await pool?.end(); });

  it('does not mint holdings or curation progress in a read-only transaction', async () => {
    const client = await pool!.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const repo = new PostgresCollectionRepository(client);
      const actor = '11111111-1111-4111-8111-111111111111';
      expect(await repo.listCollections(actor)).toEqual([]);
      expect(await repo.getCurationStatus(actor)).toBeNull();
      const other = await repo.listCollections('22222222-2222-4222-8222-222222222222');
      expect(other).toHaveLength(1);
      expect(other[0]?.code).toBe('EARNED');
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });

  it('does not grant the app reader direct collectible writes', async () => {
    await expect(pool!.query(
      "INSERT INTO public.user_collections (user_id, code) VALUES ($1::uuid, 'FAKE')",
      ['11111111-1111-4111-8111-111111111111'],
    )).rejects.toMatchObject({ code: '42501' });
  });
});
