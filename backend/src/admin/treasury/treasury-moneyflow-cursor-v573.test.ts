import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

const at = '2026-10-27 06:00:00.123456+00';
const tx = '00000000-0000-4000-8000-000000000011';
const posting1 = '00000000-0000-4000-8000-000000000031';
const posting2 = '00000000-0000-4000-8000-000000000030';

function row(posting_id: string) {
  return {
    transaction_id: tx, posting_id, cursor_created_at: at,
    type: 'MINT_TO_USER', user_id: '00000000-0000-4000-8000-000000000021',
    display_name: '회원', account_type: 'USER_CASH', direction: 'credit',
    amount: '9007199254740993', created_at: new Date('2026-10-27T06:00:00.123Z'),
  };
}

function fixture(rows: ReturnType<typeof row>[]) {
  const query = vi.fn(async (sql: string) => ({
    rows: sql.includes('SELECT \n        t.id::text') ? rows : [{ total_volume_24h: '0' }],
  }));
  return { repo: new TreasuryRepository({ query } as unknown as Queryable), query };
}

describe('P1 administrator money-flow posting cursor integrity', () => {
  it('uses a stable posting-level tie breaker and exact microsecond cursor', async () => {
    const { repo, query } = fixture([row(posting1), row(posting2)]);
    const result = await repo.getUserMoneyFlows(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.amount).toBe('9007199254740993');
    expect(result.next_cursor).toMatch(/^mf1\.[A-Za-z0-9_-]+$/);
    const payload = JSON.parse(Buffer.from(result.next_cursor!.slice(4), 'base64url').toString('utf8'));
    expect(payload).toMatchObject({ at, tx, posting: posting1 });
    const sql = query.mock.calls[0]?.[0] ?? '';
    expect(sql).toContain('post.id::text AS posting_id');
    expect(sql).toContain('t.created_at::text AS cursor_created_at');
    expect(sql).toContain('ORDER BY t.created_at DESC, t.id DESC, post.id DESC');
  });

  it('continues after the exact posting rather than dropping same-time siblings', async () => {
    const first = await fixture([row(posting1), row(posting2)]).repo.getUserMoneyFlows(1);
    const { repo, query } = fixture([row(posting2)]);
    await repo.getUserMoneyFlows(1, first.next_cursor!);
    const sql = query.mock.calls[0]?.[0] ?? '';
    expect(sql).toMatch(/\(t\.created_at, t\.id, post\.id\)\s*<\s*\(\$\d+::timestamptz, \$\d+::uuid, \$\d+::uuid\)/);
    const args = query.mock.calls[0]?.[1] as unknown[];
    expect(args).toEqual(expect.arrayContaining([at, tx, posting1]));
  });

  it('rejects malformed or legacy timestamp-only cursors before any SQL', async () => {
    const { repo, query } = fixture([]);
    for (const cursor of ['2026-10-27T06:00:00Z', 'mf1.invalid', 'mf1.' + 'A'.repeat(1000)]) {
      await expect(repo.getUserMoneyFlows(50, cursor)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('binds continuation to the same search and filters', async () => {
    const first = await fixture([row(posting1), row(posting2)]).repo.getUserMoneyFlows(1, undefined, '회원', 'MINT_TO_USER', 'credit');
    const { repo, query } = fixture([]);
    await expect(repo.getUserMoneyFlows(1, first.next_cursor!, '다른 이름', 'MINT_TO_USER', 'credit')).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });
});
