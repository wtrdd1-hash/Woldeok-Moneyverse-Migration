import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

describe('wallet recipient search privacy boundary', () => {
  it.each([
    ['%', '%'],
    ['_', '_'],
    ['\\', '\\'],
    ['홍%종', '홍%종'],
    ['  홍종  ', '홍종'],
  ])(
    'treats %s as a literal display-name substring, not a SQL wildcard',
    async (input, literal) => {
      const query = vi.fn(async () => ({ rows: [] }));
      const repo = new PostgresWalletRepository({ query });
      await expect(repo.searchRecipients(input, ACTOR)).resolves.toEqual([]);
      expect(query).toHaveBeenCalledTimes(1);
      const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
      expect(sql).toMatch(/strpos\(lower\(profile\.display_name\), lower\(\$1::text\)\) > 0/);
      expect(sql).not.toMatch(/\bILIKE\b/i);
      expect(params).toEqual([literal, ACTOR]);
      expect(sql).toContain("u.status = 'active'::public.user_status");
      expect(sql).toContain('profile.user_id != $2::uuid');
      expect(sql).toContain('LIMIT 10');
    },
  );

  it('does not query all recipients on empty or overlong input', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query });
    await expect(repo.searchRecipients('  ', ACTOR)).resolves.toEqual([]);
    await expect(repo.searchRecipients('a'.repeat(65), ACTOR)).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it('uses deterministic ordering for a limited result set', async () => {
    const rows = [{ userId: '00000000-0000-4000-8000-000000000002', displayName: '홍종' }];
    const query = vi.fn(async () => ({ rows }));
    const repo = new PostgresWalletRepository({ query });
    await expect(repo.searchRecipients('홍', ACTOR)).resolves.toEqual(rows);
    const [sql] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('ORDER BY lower(profile.display_name), profile.user_id');
  });
});
