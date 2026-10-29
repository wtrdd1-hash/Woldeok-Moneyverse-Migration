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
  it('only suggests currently verified same-locale/category articles, excluding the current article', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = vi.fn().mockResolvedValue({ article_id: 'current', category: 'wallet' });
    const rows = [
      { article_id: 'current', locale: 'ko', category: 'wallet', slug: 'current' },
      ...Array.from({ length: 7 }, (_, i) => ({ article_id: `related-${i}`, locale: 'ko', category: 'wallet', slug: `related-${i}` })),
    ];
    const search = vi.fn().mockResolvedValue(rows);
    const controller = new HelpController({ article, search } as unknown as HelpRepository);
    const result = await controller.related('ko', 'current');
    expect(article).toHaveBeenCalledWith('ko', 'current');
    expect(search).toHaveBeenCalledWith('ko', 'wallet', '', 8);
    expect(result.articles).toHaveLength(5);
    expect(result.articles.every((item: { article_id: string }) => item.article_id !== 'current')).toBe(true);
  });

  it('does not query suggestions for an unavailable or invalid source article', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = vi.fn().mockResolvedValue(null);
    const search = vi.fn();
    const controller = new HelpController({ article, search } as unknown as HelpRepository);
    await expect(controller.related('ko', 'missing')).rejects.toThrow('not found');
    await expect(controller.related('xx', 'missing')).rejects.toThrow('not found');
    expect(search).not.toHaveBeenCalled();
  });

  it('reports DB failure as unavailable rather than fabricated empty suggestions', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const controller = new HelpController({ article: vi.fn().mockRejectedValue(new Error('connection refused')), search: vi.fn() } as unknown as HelpRepository);
    await expect(controller.related('ko', 'current')).rejects.toThrow('unavailable');
  });

  it('keeps related reads unavailable when the feature is disabled', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const controller = new HelpController({ article: vi.fn(), search: vi.fn() } as unknown as HelpRepository);
    await expect(controller.related('ko', 'current')).rejects.toThrow('unavailable');
  });

});
