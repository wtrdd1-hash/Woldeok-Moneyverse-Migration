import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import type { HelpRepository } from './help.repository';

afterEach(() => vi.unstubAllEnvs());
describe('public verified help controller', () => {
  it('fails closed while feature flag is OFF', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const controller = new HelpController({ search: vi.fn(), article: vi.fn() } as unknown as HelpRepository);
    await expect(controller.categories()).rejects.toThrow('unavailable');
    await expect(controller.search({ locale: 'ko' })).rejects.toThrow('unavailable');
  });
  it('rejects overlong Unicode queries before reaching SQL', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn();
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', query: '😀'.repeat(101) })).rejects.toThrow('invalid');
    expect(search).not.toHaveBeenCalled();
  });
  it('returns locale-scoped approved category counts and preserves the category array', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const categoryCounts = vi.fn().mockResolvedValue([
      { category: 'account', article_count: '3' },
      { category: 'support', article_count: '1' },
    ]);
    const controller = new HelpController({ categoryCounts } as unknown as HelpRepository);
    await expect(controller.categories('en')).resolves.toEqual({
      categories: ['account', 'wallet', 'shop', 'community', 'support'],
      counts: { account: '3', wallet: '0', shop: '0', community: '0', support: '1' },
      locale: 'en',
    });
    expect(categoryCounts).toHaveBeenCalledWith('en');
    await expect(controller.categories('fr')).rejects.toThrow('invalid');
    expect(categoryCounts).toHaveBeenCalledTimes(1);
  });
  it('never converts a failed category read into fabricated zero counts', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const controller = new HelpController({ categoryCounts: vi.fn().mockRejectedValue(new Error('database offline')) } as unknown as HelpRepository);
    await expect(controller.categories('ko')).rejects.toThrow('database offline');
  });
  it('returns a genuine empty result only after a successful DB read', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockResolvedValue([]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko' })).resolves.toEqual({ articles: [], requestedLocale: 'ko', resultLocale: 'ko', fallbackUsed: false });
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


describe('opt-in bilingual verified help search', () => {
  it('does not query the other locale when opt-in is absent or primary has results', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = { article_id: 'a', locale: 'ko', slug: 'test', title: '제목', summary: '요약', category: 'account' };
    const search = vi.fn().mockResolvedValue([article]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', fallbackToOtherLocale: true })).resolves.toEqual({
      articles: [article], requestedLocale: 'ko', resultLocale: 'ko', fallbackUsed: false,
    });
    expect(search).toHaveBeenCalledTimes(1);
  });
  it('queries only the other verified DB locale when explicitly requested and primary empty', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = { article_id: 'b', locale: 'en', slug: 'account', title: 'Account', summary: 'Help', category: 'account' };
    const search = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([article]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', category: 'account', query: 'login', limit: 5, fallbackToOtherLocale: true })).resolves.toEqual({
      articles: [article], requestedLocale: 'ko', resultLocale: 'en', fallbackUsed: true,
    });
    expect(search.mock.calls).toEqual([['ko', 'account', 'login', 5], ['en', 'account', 'login', 5]]);
  });
  it('never calls the alternate locale for invalid boolean input', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn();
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', fallbackToOtherLocale: 'true' as unknown as boolean })).rejects.toThrow('invalid');
    expect(search).not.toHaveBeenCalled();
  });
  it('does not turn a primary DB failure into a fallback result', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockRejectedValue(new Error('db unavailable'));
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', fallbackToOtherLocale: true })).rejects.toThrow('db unavailable');
    expect(search).toHaveBeenCalledTimes(1);
  });
});
