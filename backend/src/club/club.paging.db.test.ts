import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresClubRepository } from './club.repository';

const isolatedUrl = process.env.CLUB_PAGING_TEST_URL;
const isolatedOnly = process.env.CLUB_PAGING_ISOLATED_FIXTURE === 'yes'
  && typeof isolatedUrl === 'string'
  && /^postgresql:\/\/[^@]+@127\.0\.0\.1:55582\/mv_b_v582$/.test(isolatedUrl);

describe.runIf(isolatedOnly)('club paging against isolated real PostgreSQL (synthetic fixture only)', () => {
  const pool = new Pool({ connectionString: isolatedUrl, max: 2 });
  const repo = new PostgresClubRepository(pool);
  const clubId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  const actor = '11111111-2222-4333-8444-555555555555';

  afterAll(async () => { await pool.end(); });

  it('returns exact bounded roster and feed rows with read-only app role', async () => {
    const first = await repo.listClubMembers(clubId, actor, 1, 0);
    const second = await repo.listClubMembers(clubId, actor, 1, 1);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0]!.user_id).not.toBe(second[0]!.user_id);
    const feed = await repo.listClubFeed(clubId, 1);
    expect(feed).toHaveLength(1);
    expect(feed[0]!.title).toBe('Synthetic announcement');
  });

  it('rejects invalid paging before issuing SQL', async () => {
    await expect(repo.listClubMembers(clubId, actor, 101, 0)).rejects.toThrow('limit must be an integer');
    await expect(repo.listClubMembers(clubId, actor, 50, 10001)).rejects.toThrow('offset must be an integer');
    await expect(repo.listClubFeed(clubId, Number.NaN)).rejects.toThrow('limit must be an integer');
  });

  it('denies app-role writes to the roster and feed tables', async () => {
    await expect(pool.query('UPDATE public.club_members SET role = role')).rejects.toMatchObject({ code: '42501' });
    await expect(pool.query('DELETE FROM public.club_feed_posts')).rejects.toMatchObject({ code: '42501' });
  });
});
