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
  it('reads the exact approved edition and rendered content digest through a dedicated SECURITY DEFINER function', async () => {
    const row = { article_id: 'a', published_revision_id: 'b', article_version: '9007199254740993', content_digest: 'c'.repeat(64) };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const repo = new HelpRepository({ query });
    expect(await repo.article('ko', 'account-login')).toMatchObject(row);
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/public\.help_public_article_revision\(/);
    expect(sql).toContain('published_revision_id::text');
    expect(sql).toContain('article_version::text');
    expect(sql).toContain('content_digest');
    expect(sql).not.toMatch(/FROM\s+public\.help_articles/i);
    expect(args).toEqual(['ko', 'account-login']);
  });
  it('looks up one public article by locale and slug only', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new HelpRepository({ query });
    expect(await repo.article('ko', 'account-login')).toBeNull();
    expect(query.mock.calls[0]?.[1]).toEqual(['ko', 'account-login']);
  });
});
