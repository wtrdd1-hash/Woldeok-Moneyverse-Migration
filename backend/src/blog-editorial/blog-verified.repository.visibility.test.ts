import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { BlogVerifiedRepository } from './blog-verified.repository';

const repository = () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  return { repo: new BlogVerifiedRepository({ query } as unknown as Queryable), query };
};

describe('verified blog repository least-privilege reads (QA #1661)', () => {
  it('uses the scoped public SQL functions for list and slug lookup', async () => {
    const { repo, query } = repository();
    await repo.list();
    await repo.find('2026-10-28-kr-economy-0');
    expect(query.mock.calls[0][0]).toMatch(/FROM public\.blog_verified_public_list\(\)/);
    expect(query.mock.calls[1][0]).toMatch(/FROM public\.blog_verified_public_by_slug\(\$1\)/);
    expect(query.mock.calls[1][1]).toEqual(['2026-10-28-kr-economy-0']);
  });

  it('uses metadata-only functions for scheduler idempotency', async () => {
    const { repo, query } = repository();
    await repo.currentPeriod('2026-10-28T12:00+09:00');
    await repo.digests();
    expect(query.mock.calls[0][0]).toMatch(/FROM public\.blog_verified_period_receipt\(\$1\)/);
    expect(query.mock.calls[1][0]).toMatch(/FROM public\.blog_verified_recent_digests\(\)/);
    for (const [sql] of query.mock.calls) {
      expect(sql).not.toMatch(/FROM public\.blog_verified_articles\b/);
    }
  });
});
