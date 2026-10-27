import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import type { HelpRepository } from './help.repository';

afterEach(() => vi.unstubAllEnvs());
describe('public verified help controller', () => {
  it('fails closed while feature flag is OFF', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const controller = new HelpController({ search: vi.fn(), article: vi.fn() } as unknown as HelpRepository);
    expect(() => controller.categories()).toThrow('unavailable');
    await expect(controller.search({ locale: 'ko' })).rejects.toThrow('unavailable');
  });
  it('rejects overlong Unicode queries before reaching SQL', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn();
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', query: '😀'.repeat(101) })).rejects.toThrow('invalid');
    expect(search).not.toHaveBeenCalled();
  });
  it('returns a genuine empty result only after a successful DB read', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockResolvedValue([]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko' })).resolves.toEqual({ articles: [] });
    expect(search).toHaveBeenCalledWith('ko', null, '', 20);
  });
});

describe('verified help response-time expiry fence (Android and web share this API)', () => {
  it('never emits an article that expired after the SQL read but before response', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = vi.fn().mockResolvedValue({
      article_id: 'article-id', reviewed_until: new Date('2020-01-01T00:00:00Z'),
      title: 'stale response',
    });
    const controller = new HelpController({ article } as unknown as HelpRepository);
    await expect(controller.article('ko', 'stale-response')).rejects.toThrow('not found');
    expect(article).toHaveBeenCalledOnce();
  });

  it('drops expired or malformed search results rather than marking them verified', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const future = new Date(Date.now() + 3600_000);
    const search = vi.fn().mockResolvedValue([
      { article_id: 'expired', reviewed_until: new Date('2020-01-01T00:00:00Z') },
      { article_id: 'malformed', reviewed_until: 'garbled' },
      { article_id: 'valid', reviewed_until: future },
    ]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    const result = await controller.search({ locale: 'en', query: '' });
    expect(result.articles.map(row => row.article_id)).toEqual(['valid']);
  });
});


describe('public live publication status (withdrawal fence)', () => {
  it('returns a narrow status receipt for a currently published article', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const status = vi.fn().mockResolvedValue({ article_id: 'a1', published_at: new Date('2026-10-27T07:00:00Z'), reviewed_until: new Date(Date.now() + 3600_000) });
    const controller = new HelpController({ status } as unknown as HelpRepository);
    const result = await controller.status('ko', 'account-login');
    expect(result.current).toBe(true);
    expect(result.articleId).toBe('a1');
    expect(result.publishedAt).toBe('2026-10-27T07:00:00.000Z');
    expect(status).toHaveBeenCalledWith('ko', 'account-login');
  });
  it('fails closed when retracted or expired before the response', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const status = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
      article_id: 'a1', published_at: new Date(), reviewed_until: new Date('2020-01-01T00:00:00Z'),
    });
    const controller = new HelpController({ status } as unknown as HelpRepository);
    await expect(controller.status('ko', 'account-login')).rejects.toThrow('not found');
    await expect(controller.status('ko', 'account-login')).rejects.toThrow('not found');
  });
});
