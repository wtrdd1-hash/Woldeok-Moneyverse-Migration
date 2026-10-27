import { describe, expect, it, vi } from 'vitest';
import { HelpRepository } from './help.repository';

describe('verified help repository', () => {
  it('searches via a narrow published-only DB function, never direct table SELECT', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new HelpRepository({ query });
    expect(await repo.search('ko', 'account', '로그인', 20)).toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/public\.help_public_search\(/);
    expect(sql).toMatch(/reviewed_until/);
    expect(sql).not.toMatch(/FROM\s+public\.help_articles/i);
    expect(args).toEqual(['ko', 'account', '로그인', 20]);
  });
  it('looks up one public article by locale and slug only', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new HelpRepository({ query });
    expect(await repo.article('ko', 'account-login')).toBeNull();
    expect(query.mock.calls[0]?.[1]).toEqual(['ko', 'account-login']);
    expect(query.mock.calls[0]?.[0]).toMatch(/reviewed_until/);
  });
});
