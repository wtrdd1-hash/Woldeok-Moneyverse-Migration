import { describe, expect, it, vi } from 'vitest';
import { validateSync } from 'class-validator';
import type { Queryable } from '../core/db';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceQueryDto } from './marketplace.dto';

const makeService = () => {
  const query = vi.fn(async () => ({ rows: [] }));
  return { service: new MarketplaceService({ query } as unknown as Queryable), query };
};

const validationErrors = (input: Partial<MarketplaceQueryDto>) =>
  validateSync(Object.assign(new MarketplaceQueryDto(), input));

describe('v541 marketplace literal search and stable paging', () => {
  it('escapes user LIKE metacharacters while preserving parameterized SQL', async () => {
    const { service, query } = makeService();
    await service.listListings({ search: '50%_\\', category: 'frame', limit: 20, offset: 5 });
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, values] = query.mock.calls[0]!;
    expect(sql).toContain(String.raw`ILIKE $2 ESCAPE E'\\'`);
    expect(values).toEqual(['frame', String.raw`%50\%\_\\%`, 20, 5]);
    expect(sql).not.toContain('50%_');
  });

  it('uses a unique tie-breaker for stable page boundaries', async () => {
    const { service, query } = makeService();
    await service.listListings({});
    const [sql, values] = query.mock.calls[0]!;
    expect(sql).toMatch(/ORDER BY created_at DESC, id DESC/i);
    expect(values).toEqual([null, null, 50, 0]);
  });

  it('rejects unbounded category and search values at the API validation boundary', () => {
    expect(validationErrors({ search: 'x'.repeat(121) }).map((error) => error.property)).toContain('search');
    expect(validationErrors({ category: 'x'.repeat(65) }).map((error) => error.property)).toContain('category');
    expect(validationErrors({ search: 'emerald', category: 'frame' })).toEqual([]);
  });

  it('limits offset size without changing the default and maximum page sizes', () => {
    expect(validationErrors({ offset: 10001 }).map((error) => error.property)).toContain('offset');
    expect(validationErrors({ offset: 10000, limit: 100 })).toEqual([]);
    expect(validationErrors({ limit: 101 }).map((error) => error.property)).toContain('limit');
  });
});
