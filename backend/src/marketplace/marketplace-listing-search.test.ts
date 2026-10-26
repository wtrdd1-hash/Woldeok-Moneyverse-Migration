import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { MarketplaceQueryDto } from './marketplace.dto';
import { MarketplaceService } from './marketplace.service';

function createSubject() {
  const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [] }));
  const service = new MarketplaceService({ query } as unknown as Queryable);
  return { query, service };
}

describe('marketplace listing search literal matching', () => {
  it.each(['%', '_', '\\', '달_빛', '한글'])('treats %s as literal substring input', async (search) => {
    const { query, service } = createSubject();
    await service.listListings({ search });
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/strpos\s*\(\s*lower\s*\(/i);
    expect(sql).not.toMatch(/\bILIKE\b/i);
    expect(params?.[1]).toBe(search);
    expect(sql).toMatch(/status\s*=\s*'ACTIVE'/i);
  });

  it('trims search and preserves category, bounded page size and offset', async () => {
    const { query, service } = createSubject();
    await service.listListings({ category: 'frame', search: '  달빛  ', limit: 10, offset: 20 });
    expect(query.mock.calls[0][1]).toEqual(['frame', '달빛', 10, 20]);
  });

  it('treats whitespace-only search as no filter', async () => {
    const { query, service } = createSubject();
    await service.listListings({ search: '  ' });
    expect(query.mock.calls[0][1]?.[1]).toBeNull();
  });

  it('uses a stable id tie-breaker for paginated listings', async () => {
    const { query, service } = createSubject();
    await service.listListings({});
    expect(query.mock.calls[0][0]).toMatch(/ORDER BY created_at DESC, id DESC/i);
  });

  it('rejects overlong search at the service boundary before querying', async () => {
    const { query, service } = createSubject();
    await expect(service.listListings({ search: 'x'.repeat(65) })).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects overlong search at the HTTP DTO boundary', async () => {
    const dto = Object.assign(new MarketplaceQueryDto(), { search: 'x'.repeat(65) });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'search' && error.constraints?.maxLength)).toBe(true);
  });
});
