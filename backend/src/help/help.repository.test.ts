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
    expect(sql).not.toMatch(/FROM\s+public\.help_articles/i);
    expect(args).toEqual(['ko', 'account', '로그인', 20]);
  });
  it('selects the authoritative published_at from the narrow SQL functions', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new HelpRepository({ query });
    await repo.search('en', null, 'wallet', 20);
    await repo.article('en', 'wallet-guide');
    for (const [sql] of query.mock.calls as [string, unknown[]][]) {
      expect(sql).toMatch(/published_at/);
      expect(sql).toMatch(/public\.help_public_(search|article)\(/);
      expect(sql).not.toMatch(/FROM\s+public\.help_article_revisions/i);
    }
  });
  it('looks up one public article by locale and slug only', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new HelpRepository({ query });
    expect(await repo.article('ko', 'account-login')).toBeNull();
    expect(query.mock.calls[0]?.[1]).toEqual(['ko', 'account-login']);
  });
});
