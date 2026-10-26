import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

function fixture() {
  const query = vi.fn(async (sql: string, params?: unknown[]) => ({
    rows: sql.includes('SELECT \n        t.id::text') ? [] : [{ total_volume_24h: '0' }],
    rowCount: 0,
  }));
  return { query, repo: new TreasuryRepository({ query } as unknown as Queryable) };
}

describe('P1 admin money-flow literal and bounded filters', () => {
  it.each(['%', '_', '\\', '홍%_\\'])('treats %s as literal substring rather than SQL LIKE wildcard', async (term) => {
    const { repo, query } = fixture();
    await repo.getUserMoneyFlows(10, undefined, term);
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).not.toMatch(/\bILIKE\b/i);
    expect(sql).toContain('strpos(lower(COALESCE(p.display_name, \'\')), lower(');
    expect(sql).toContain('strpos(a.owner_user_id::text, lower(');
    expect(args).toContain(term);
    expect(args).not.toContain(`%${term}%`);
  });

  it('trims a normal Korean search term and preserves the existing filters', async () => {
    const { repo, query } = fixture();
    await repo.getUserMoneyFlows(5, undefined, '  홍길동  ', 'MINT_TO_USER', 'credit');
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(args).toContain('홍길동');
    expect(args).toContain('MINT_TO_USER');
    expect(args).toContain('credit');
    expect(sql).toContain('post.direction');
  });

  it.each(['x'.repeat(65), '\u0000', '\u202e', 123, ['홍']])('rejects oversized, unsafe or non-string search before querying: %s', async (term) => {
    const { repo, query } = fixture();
    await expect(repo.getUserMoneyFlows(10, undefined, term as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it.each(['abc', '0', '-1', '1.5', 'Infinity', '201', 1.5, 999, ['5']])('rejects invalid limits before querying: %s', async (limit) => {
    const { repo, query } = fixture();
    await expect(repo.getUserMoneyFlows(limit as number)).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not install a search condition for whitespace-only input', async () => {
    const { repo, query } = fixture();
    await repo.getUserMoneyFlows(50, undefined, '  ');
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).not.toContain('strpos(');
    expect(args).not.toContain('  ');
  });

  it.each(['x'.repeat(65), '\u0000', 42, ['MINT_TO_USER']])('rejects unsafe transaction type filter: %s', async (type) => {
    const { repo, query } = fixture();
    await expect(repo.getUserMoneyFlows(50, undefined, undefined, type as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects invalid direction instead of silently broadening a finance audit query', async () => {
    const { repo, query } = fixture();
    await expect(repo.getUserMoneyFlows(50, undefined, undefined, undefined, 'incoming')).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });
});
