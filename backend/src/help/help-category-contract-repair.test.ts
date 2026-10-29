import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import { HelpRepository } from './help.repository';

afterEach(() => vi.unstubAllEnvs());

describe('verified help category counts end-to-end DB-to-API contract', () => {
  it('reads published-only SQL counts for the explicitly selected English locale as exact strings', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const query = vi.fn().mockResolvedValue({ rows: [
      { category: 'account', article_count: '9007199254740993' },
      { category: 'community', article_count: '0' },
      { category: 'shop', article_count: '1' },
      { category: 'support', article_count: '0' },
      { category: 'wallet', article_count: '2' },
    ] });
    const controller = new HelpController(new HelpRepository({ query }));
    await expect(controller.categories('en')).resolves.toEqual({
      locale: 'en',
      categories: ['account', 'wallet', 'shop', 'community', 'support'],
      counts: { account: '9007199254740993', wallet: '2', shop: '1', community: '0', support: '0' },
    });
    expect(query).toHaveBeenCalledOnce();
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('public.help_public_category_counts($1)');
    expect(sql).not.toMatch(/FROM\s+public\.help_articles/i);
    expect(args).toEqual(['en']);
  });

  it('defaults to Korean for older Android clients and rejects unsupported locale without SQL', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const query = vi.fn().mockResolvedValue({ rows: ['account', 'wallet', 'shop', 'community', 'support'].map(category => ({ category, article_count: '0' })) });
    const controller = new HelpController(new HelpRepository({ query }));
    await expect(controller.categories()).resolves.toMatchObject({ locale: 'ko', counts: { account: '0' } });
    expect(() => controller.categories('ja')).toThrow('invalid help locale');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('never invents verified zero counts when SQL fails or returns incomplete or malformed data', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const query = vi.fn().mockRejectedValueOnce(new Error('DB offline')).mockResolvedValueOnce({ rows: [{ category: 'account', article_count: '0' }] });
    const controller = new HelpController(new HelpRepository({ query }));
    await expect(controller.categories('ko')).rejects.toThrow('DB offline');
    await expect(controller.categories('ko')).rejects.toThrow('unavailable');
  });

  it('fails closed when the verified help feature flag is off', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const query = vi.fn();
    const controller = new HelpController(new HelpRepository({ query }));
    expect(() => controller.categories('en')).toThrow('unavailable');
    expect(query).not.toHaveBeenCalled();
  });
});
