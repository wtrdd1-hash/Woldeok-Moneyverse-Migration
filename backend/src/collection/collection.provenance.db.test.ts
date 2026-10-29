import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresCollectionRepository } from './collection.repository';

const isolatedUrl = process.env.COLLECTION_TRUTH_PG_URL;
const isolatedOnly = process.env.COLLECTION_TRUTH_ISOLATED_FIXTURE === 'yes' &&
  /^postgresql:\/\/postgres:[^@]+@127\.0\.0\.1:56953\/postgres$/.test(isolatedUrl ?? '');

const first = '11111111-2222-4333-8444-555555555555';
const second = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

describe.runIf(isolatedOnly)('collection quarantine against isolated PostgreSQL 17', () => {
  const pool = new Pool({ connectionString: isolatedUrl, max: 2 });
  afterAll(async () => { await pool.end(); });

  it('counts only owner rows via function without app table privileges or writes', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1::uuid),($2::uuid)', [first, second]);
      await client.query(`INSERT INTO public.user_collections(user_id,code,name,category,rarity,provenance)
        VALUES ($1::uuid,'SEED_A','seed A','SEASON','RARE','unverified'),
               ($1::uuid,'SEED_B','seed B','SEASON','RARE','unverified'),
               ($2::uuid,'SEED_C','seed C','SEASON','RARE','unverified')`, [first, second]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new PostgresCollectionRepository(client);
      expect(await repo.countUnverifiedCollections(first)).toBe('2');
      expect(await repo.countUnverifiedCollections(second)).toBe('1');
      expect(await repo.countUnverifiedCollections('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff')).toBe('0');
      const grants = await client.query(`SELECT
        has_table_privilege(current_user,'public.user_collections','SELECT') AS sel,
        has_table_privilege(current_user,'public.user_collections','INSERT') AS ins,
        has_table_privilege(current_user,'public.user_collections','UPDATE') AS upd,
        has_table_privilege(current_user,'public.user_collections','DELETE') AS del`);
      expect(grants.rows[0]).toEqual({ sel: false, ins: false, upd: false, del: false });
      await expect(client.query('UPDATE public.user_collections SET name=name')).rejects.toMatchObject({ code: '42501' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
